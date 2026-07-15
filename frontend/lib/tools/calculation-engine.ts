import {
  BUILDING_AREA_FACTOR,
  CEMENT_BAG_KG,
  FOUNDATION_AREA_RATIO,
  PLASTER_BAG_KG,
  QUALITY_FACTOR,
  QUICK_CONCRETE_PER_SQM,
  QUICK_REBAR_PER_SQM,
  QUICK_STRUCTURAL_STEEL_TON_PER_SQM,
  REBAR_KG_PER_M3,
  SLAB_THICKNESS,
  SLAB_VOLUME_FACTOR,
  TILE_ADHESIVE_BAG_KG,
  WASTE,
  YIELDS,
  type BuildingType,
  type ConstructionStage,
  type FoundationType,
  type QualityLevel,
  type SlabType,
  type StructureType,
} from './coefficients'

export interface QuickCalcInput {
  buildingType: BuildingType
  structureType: StructureType
  areaSqm: number
  floors: number
  quality: QualityLevel
}

export interface ProfessionalCalcInput {
  buildingType: BuildingType
  structureType: StructureType
  areaSqm: number
  floors: number
  quality: QualityLevel
  storyHeightM: number
  foundationType: FoundationType
  foundationDepthM: number
  columnCount: number
  columnSectionCm: number // square side cm
  beamLengthPerFloorM: number
  beamWidthCm: number
  beamDepthCm: number
  slabType: SlabType
  slabThicknessM?: number
  exteriorWallAreaM2: number
  interiorWallAreaM2: number
  wallThicknessCm: number
  plasterCoveragePct: number
  tilingCoveragePct: number
  includeFinishing: boolean
  includeMepAllowance: boolean
  stage: ConstructionStage
}

export interface MaterialLine {
  id: string
  name: string
  unit: string
  category: 'concrete' | 'steel' | 'aggregates' | 'masonry' | 'finishing' | 'other'
  quantity: number
  quantityRounded: number
  note?: string
}

export interface ElementBreakdown {
  id: string
  label: string
  concreteM3: number
  rebarKg: number
}

export interface CalcResult {
  mode: 'quick' | 'professional'
  summary: {
    buildingType: BuildingType
    structureType: StructureType
    areaSqm: number
    floors: number
    quality: QualityLevel
    totalArea: number
    stage?: ConstructionStage
  }
  materials: MaterialLine[]
  elements?: ElementBreakdown[]
  assumptions: string[]
  generatedAt: string
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

function roundSmart(value: number): number {
  if (value <= 0) return 0
  if (value >= 1000) return Math.round(value / 5) * 5
  if (value >= 100) return Math.round(value)
  if (value >= 10) return Math.round(value * 10) / 10
  return Math.round(value * 100) / 100
}

function withWaste(value: number, waste: number) {
  return value * (1 + waste)
}

function line(
  id: string,
  name: string,
  unit: string,
  category: MaterialLine['category'],
  quantity: number,
  note?: string,
): MaterialLine {
  const q = Math.max(0, quantity)
  return {
    id,
    name,
    unit,
    category,
    quantity: q,
    quantityRounded: roundSmart(q),
    note,
  }
}

function applyStageFilter(
  materials: MaterialLine[],
  stage: ConstructionStage,
): MaterialLine[] {
  if (stage === 'full') return materials

  const keep: Record<ConstructionStage, string[]> = {
    foundation: ['concrete', 'rebar', 'cement', 'sand', 'gravel'],
    structure: ['concrete', 'rebar', 'cement', 'sand', 'gravel', 'structural_steel'],
    walls: ['concrete', 'rebar', 'cement', 'sand', 'block', 'brick', 'gravel'],
    finishing: ['cement', 'sand', 'plaster', 'tile_adhesive', 'block', 'brick'],
    full: [],
  }

  const ids = new Set(keep[stage])
  return materials
    .filter((m) => ids.has(m.id))
    .map((m) => {
      // Soft scale when stage isn't "full"
      const scale =
        stage === 'foundation'
          ? m.category === 'finishing'
            ? 0
            : m.id === 'block' || m.id === 'brick'
              ? 0.05
              : 1
          : stage === 'finishing'
            ? m.category === 'concrete' || m.id === 'rebar'
              ? 0.05
              : 1
            : 1
      const quantity = m.quantity * scale
      return { ...m, quantity, quantityRounded: roundSmart(quantity) }
    })
    .filter((m) => m.quantityRounded > 0)
}

function aggregateFromConcrete(concreteM3: number, masonryM3: number): MaterialLine[] {
  const cementBags =
    withWaste(concreteM3 * YIELDS.cementBagsPerM3Concrete, WASTE.cement) +
    withWaste(masonryM3 * YIELDS.cementBagsPerM3Masonry, WASTE.cement)
  const sand =
    withWaste(concreteM3 * YIELDS.sandPerM3Concrete, WASTE.aggregates) +
    withWaste(masonryM3 * YIELDS.sandPerM3Masonry, WASTE.aggregates)
  const gravel = withWaste(concreteM3 * YIELDS.gravelPerM3Concrete, WASTE.aggregates)

  return [
    line('cement', 'سیمان', 'کیسه ۵۰ کیلویی', 'aggregates', cementBags, `${CEMENT_BAG_KG} کیلوگرم هر کیسه`),
    line('sand', 'ماسه', 'مترمکعب', 'aggregates', sand),
    line('gravel', 'شن', 'مترمکعب', 'aggregates', gravel),
  ]
}

export function calculateQuick(input: QuickCalcInput): CalcResult {
  const area = clamp(input.areaSqm, 20, 100_000)
  const floors = clamp(Math.round(input.floors), 1, 60)
  const totalArea = area * floors
  const b = BUILDING_AREA_FACTOR[input.buildingType]
  const q = QUALITY_FACTOR[input.quality]
  // طبقات بیشتر فقط اندکی سختی فونداسیون/بادبند را افزایش می‌دهد
  const floorBump = 1 + Math.max(0, floors - 1) * 0.01

  const concrete = withWaste(
    QUICK_CONCRETE_PER_SQM[input.structureType] * totalArea * b * q * floorBump,
    WASTE.concrete,
  )
  const rebar = withWaste(
    QUICK_REBAR_PER_SQM[input.structureType] * totalArea * b * q * floorBump,
    WASTE.rebar,
  )

  // Approximate envelope for walls: perimeter from square plan × height × floors × openings factor
  const side = Math.sqrt(area)
  const perimeter = side * 4
  const storyH = 3.0
  const wallArea = perimeter * storyH * floors * 0.8 // openings ~20%
  const partitionArea = totalArea * 0.45

  const block = withWaste((wallArea * 0.75 + partitionArea * 0.85) * YIELDS.blocksPerM2Wall, WASTE.masonry)
  const brick = withWaste(wallArea * 0.25 * YIELDS.bricksPerM2Wall, WASTE.masonry)
  // نمای خارجی یک‌رو + تیغه‌ها دو‌رو — عرف نازک‌کاری ایران
  const plasterM2 = wallArea * 1.05 + partitionArea * 1.9
  const plasterBags = withWaste((plasterM2 * YIELDS.plasterKgPerM2) / PLASTER_BAG_KG, WASTE.finishing)
  const tilingM2 = totalArea * 0.55
  const adhesiveBags = withWaste(
    (tilingM2 * YIELDS.adhesiveKgPerM2) / TILE_ADHESIVE_BAG_KG,
    WASTE.finishing,
  )

  const masonryM3 = (wallArea * 0.2 + partitionArea * 0.1) * 0.9
  const materials = [
    line('concrete', 'بتن', 'مترمکعب', 'concrete', concrete, 'برآورد سریع بر اساس زیربنا (عرف بازار ایران)'),
    line(
      'rebar',
      'میلگرد',
      'کیلوگرم',
      'steel',
      rebar,
      rebar >= 1000 ? `حدود ${(rebar / 1000).toFixed(1)} تن` : undefined,
    ),
    ...aggregateFromConcrete(concrete, masonryM3 * 0.25),
    line('block', 'بلوک سیمانی', 'عدد', 'masonry', block, 'بلوک ۲۰ سانتی حدود ۱۲٫۵ عدد در مترمربع'),
    line('brick', 'آجر', 'عدد', 'masonry', brick),
    line('plaster', 'گچ', 'کیسه ۴۰ کیلویی', 'finishing', plasterBags),
    line('tile_adhesive', 'چسب کاشی', 'کیسه ۲۰ کیلویی', 'finishing', adhesiveBags),
  ].filter((m) => m.quantityRounded > 0)

  if (input.structureType === 'steel' || input.structureType === 'mixed') {
    const steelTon = withWaste(
      totalArea * QUICK_STRUCTURAL_STEEL_TON_PER_SQM[input.structureType] * q,
      WASTE.steel,
    )
    materials.splice(
      2,
      0,
      line('structural_steel', 'فولاد اسکلت', 'تن', 'steel', steelTon, 'برآورد تقریبی وزن اسکلت فولادی'),
    )
  }

  return {
    mode: 'quick',
    summary: {
      buildingType: input.buildingType,
      structureType: input.structureType,
      areaSqm: area,
      floors,
      quality: input.quality,
      totalArea,
    },
    materials,
    assumptions: [
      'برآورد سریع بر اساس ضرایب عرف متره پروژه‌های مسکونی/تجاری ایران است.',
      'بتن اسکلت بتن‌آرمه حدود ۰٫۳۴ مترمکعب و میلگرد حدود ۵۲ کیلوگرم در هر متر مربع زیربنا (میانگین).',
      'بازشوها حدود ۲۰٪ از سطح دیوار کسر شده‌اند و ضایعات مصالح لحاظ شده است.',
      'نتیجه جایگزین نقشه‌های اجرایی و متره دقیق دفتر فنی نیست.',
    ],
    generatedAt: new Date().toISOString(),
  }
}

export function calculateProfessional(input: ProfessionalCalcInput): CalcResult {
  const area = clamp(input.areaSqm, 20, 100_000)
  const floors = clamp(Math.round(input.floors), 1, 60)
  const totalArea = area * floors
  const q = input.quality
  const storyH = clamp(input.storyHeightM, 2.4, 6)
  const bFactor = BUILDING_AREA_FACTOR[input.buildingType]
  const qFactor = QUALITY_FACTOR[q]

  const structureConcreteFactor =
    input.structureType === 'concrete' ? 1 : input.structureType === 'mixed' ? 0.65 : input.structureType === 'steel' ? 0.25 : 0.4

  // ── Foundation ──
  const fArea = area * FOUNDATION_AREA_RATIO[input.foundationType] * bFactor
  const fDepth = clamp(input.foundationDepthM, 0.4, 3.5)
  const foundationConcrete = withWaste(fArea * fDepth * structureConcreteFactor, WASTE.concrete)
  const foundationRebar = foundationConcrete * REBAR_KG_PER_M3.foundation[q]

  // ── Columns ──
  const colN = clamp(Math.round(input.columnCount), 0, 500)
  const colSideM = clamp(input.columnSectionCm, 20, 120) / 100
  const columnConcrete = withWaste(
    colN * colSideM * colSideM * storyH * floors * structureConcreteFactor,
    WASTE.concrete,
  )
  const columnRebar = columnConcrete * REBAR_KG_PER_M3.column[q]

  // ── Beams ──
  const beamLen = clamp(input.beamLengthPerFloorM, 0, 5000)
  const bw = clamp(input.beamWidthCm, 20, 80) / 100
  const bd = clamp(input.beamDepthCm, 25, 120) / 100
  const beamConcrete = withWaste(beamLen * bw * bd * floors * structureConcreteFactor, WASTE.concrete)
  const beamRebar = beamConcrete * REBAR_KG_PER_M3.beam[q]

  // ── Slab ──
  const slabT = input.slabThicknessM ?? SLAB_THICKNESS[input.slabType]
  const slabConcrete = withWaste(
    area *
      slabT *
      SLAB_VOLUME_FACTOR[input.slabType] *
      floors *
      structureConcreteFactor *
      qFactor,
    WASTE.concrete,
  )
  const slabRebar = slabConcrete * REBAR_KG_PER_M3.slab[q]

  // ── Walls ──
  const extWall = clamp(input.exteriorWallAreaM2, 0, 200_000)
  const intWall = clamp(input.interiorWallAreaM2, 0, 200_000)
  const wallThick = clamp(input.wallThicknessCm, 10, 40) / 100
  const wallArea = extWall + intWall
  const wallConcrete =
    input.structureType === 'concrete' || input.structureType === 'mixed'
      ? withWaste(extWall * 0.15 * wallThick * structureConcreteFactor, WASTE.concrete) // shear walls share
      : 0
  const wallRebar = wallConcrete * REBAR_KG_PER_M3.wall[q]

  const block = withWaste(wallArea * 0.75 * YIELDS.blocksPerM2Wall, WASTE.masonry)
  const brick = withWaste(wallArea * 0.25 * YIELDS.bricksPerM2Wall, WASTE.masonry)
  const masonryM3 = wallArea * wallThick * 0.85

  // ── Finishing ──
  const plasterPct = clamp(input.plasterCoveragePct, 0, 100) / 100
  const tilePct = clamp(input.tilingCoveragePct, 0, 100) / 100
  // دیوار خارجی بیشتر یک‌رو؛ تیغه داخلی دو‌رو (تقریبی با نسبت مساحت)
  const plasterM2 =
    (extWall * 1.1 + intWall * 1.95) * plasterPct
  const plasterBags = input.includeFinishing
    ? withWaste((plasterM2 * YIELDS.plasterKgPerM2) / PLASTER_BAG_KG, WASTE.finishing)
    : 0
  const tilingM2 = totalArea * tilePct
  const adhesiveBags = input.includeFinishing
    ? withWaste((tilingM2 * YIELDS.adhesiveKgPerM2) / TILE_ADHESIVE_BAG_KG, WASTE.finishing)
    : 0

  let totalConcrete =
    foundationConcrete + columnConcrete + beamConcrete + slabConcrete + wallConcrete
  let totalRebar =
    withWaste(foundationRebar + columnRebar + beamRebar + slabRebar + wallRebar, WASTE.rebar)

  // MEP allowance: small concrete/chase + cement for installations
  let mepCement = 0
  if (input.includeMepAllowance) {
    totalConcrete *= 1.02
    totalRebar *= 1.015
    mepCement = totalArea * 0.04
  }

  const elements: ElementBreakdown[] = [
    { id: 'foundation', label: 'فونداسیون', concreteM3: foundationConcrete, rebarKg: foundationRebar },
    { id: 'columns', label: 'ستون‌ها', concreteM3: columnConcrete, rebarKg: columnRebar },
    { id: 'beams', label: 'تیرها', concreteM3: beamConcrete, rebarKg: beamRebar },
    { id: 'slab', label: 'سقف', concreteM3: slabConcrete, rebarKg: slabRebar },
    { id: 'walls', label: 'دیوار برشی / بتنی', concreteM3: wallConcrete, rebarKg: wallRebar },
  ].map((e) => ({
    ...e,
    concreteM3: roundSmart(e.concreteM3),
    rebarKg: roundSmart(e.rebarKg),
  }))

  let materials: MaterialLine[] = [
    line('concrete', 'بتن', 'مترمکعب', 'concrete', totalConcrete, 'جمع فونداسیون + ستون + تیر + سقف + دیوار بتنی'),
    line(
      'rebar',
      'میلگرد',
      'کیلوگرم',
      'steel',
      totalRebar,
      totalRebar >= 1000 ? `حدود ${(totalRebar / 1000).toFixed(1)} تن` : undefined,
    ),
    ...aggregateFromConcrete(totalConcrete, masonryM3 * 0.3),
    line('block', 'بلوک سیمانی', 'عدد', 'masonry', block),
    line('brick', 'آجر', 'عدد', 'masonry', brick),
  ]

  if (input.structureType === 'steel' || input.structureType === 'mixed') {
    const steelTon = withWaste(
      totalArea * QUICK_STRUCTURAL_STEEL_TON_PER_SQM[input.structureType === 'steel' ? 'steel' : 'mixed'] * qFactor,
      WASTE.steel,
    )
    materials.splice(
      2,
      0,
      line('structural_steel', 'فولاد اسکلت', 'تن', 'steel', steelTon),
    )
  }

  if (input.includeFinishing) {
    materials.push(
      line('plaster', 'گچ', 'کیسه ۴۰ کیلویی', 'finishing', plasterBags),
      line('tile_adhesive', 'چسب کاشی', 'کیسه ۲۰ کیلویی', 'finishing', adhesiveBags),
    )
  }

  if (mepCement > 0) {
    const cement = materials.find((m) => m.id === 'cement')
    if (cement) {
      cement.quantity += mepCement
      cement.quantityRounded = roundSmart(cement.quantity)
      cement.note = 'شامل سهم تأسیسات'
    }
  }

  materials = applyStageFilter(materials, input.stage).filter((m) => m.quantityRounded > 0)

  return {
    mode: 'professional',
    summary: {
      buildingType: input.buildingType,
      structureType: input.structureType,
      areaSqm: area,
      floors,
      quality: input.quality,
      totalArea,
      stage: input.stage,
    },
    materials,
    elements: input.stage === 'finishing' ? [] : elements.filter((e) => e.concreteM3 > 0 || e.rebarKg > 0),
    assumptions: [
      'حجم بتن و میلگرد به‌صورت المانی (فونداسیون، ستون، تیر، سقف، دیوار) محاسبه شده است.',
      `ارتفاع طبقه ${storyH} متر و کیفیت اجرا «${q}» لحاظ شده است.`,
      'ضایعات استاندارد برای هر مصالح اعمال شده است.',
      'این ابزار متره قطعی پروژه نیست؛ برای اجرا حتماً نقشه‌ها و متره دفتر فنی مبنا قرار گیرد.',
    ],
    generatedAt: new Date().toISOString(),
  }
}
