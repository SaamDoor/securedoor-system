/**
 * ضرایب مصالح — هم‌راستا با عرف متره و برآورد پروژه‌های ایران
 * (آپارتمان معمولی میان‌مرتبه، لرزه‌خیزی متوسط تا زیاد)
 */

export type BuildingType = 'residential' | 'villa' | 'commercial' | 'office' | 'industrial'
export type StructureType = 'concrete' | 'steel' | 'mixed' | 'masonry'
export type QualityLevel = 'economy' | 'standard' | 'premium'
export type FoundationType = 'isolated' | 'strip' | 'mat' | 'pile_cap'
export type SlabType = 'solid' | 'joist' | 'waffle' | 'metal_deck'
export type ConstructionStage =
  | 'foundation'
  | 'structure'
  | 'walls'
  | 'finishing'
  | 'full'

export const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
  residential: 'مسکونی آپارتمانی',
  villa: 'ویلایی',
  commercial: 'تجاری',
  office: 'اداری',
  industrial: 'صنعتی',
}

export const STRUCTURE_TYPE_LABELS: Record<StructureType, string> = {
  concrete: 'بتن‌آرمه',
  steel: 'فلزی',
  mixed: 'ترکیبی',
  masonry: 'مصالح بنایی',
}

export const QUALITY_LABELS: Record<QualityLevel, string> = {
  economy: 'اقتصادی',
  standard: 'استاندارد',
  premium: 'لوکس / ویژه',
}

export const FOUNDATION_TYPE_LABELS: Record<FoundationType, string> = {
  isolated: 'تکی (پداستال/کلاهک)',
  strip: 'نواری',
  mat: 'گسترده (رادیه)',
  pile_cap: 'کلاهک شمع',
}

export const SLAB_TYPE_LABELS: Record<SlabType, string> = {
  solid: 'دال تخت',
  joist: 'تیرچه بلوک',
  waffle: 'وِافل',
  metal_deck: 'عرشه فولادی',
}

export const STAGE_LABELS: Record<ConstructionStage, string> = {
  foundation: 'فونداسیون',
  structure: 'اسکلت',
  walls: 'دیوارچینی',
  finishing: 'نازک‌کاری',
  full: 'کل پروژه',
}

/** میلگرد kg در هر m³ بتن المان — عرف کارگاه ایران */
export const REBAR_KG_PER_M3 = {
  foundation: { economy: 65, standard: 80, premium: 95 },
  column: { economy: 110, standard: 140, premium: 170 },
  beam: { economy: 95, standard: 120, premium: 145 },
  slab: { economy: 60, standard: 80, premium: 100 },
  wall: { economy: 45, standard: 60, premium: 75 },
} as const

/**
 * برآورد سریع بتن (m³ به ازای هر m² زیربنای کل)
 * عرف بازار ایران برای اسکلت کامل + سقف + فونداسیون تقریبی
 */
export const QUICK_CONCRETE_PER_SQM: Record<StructureType, number> = {
  concrete: 0.34,
  steel: 0.1,
  mixed: 0.22,
  masonry: 0.14,
}

/** برآورد سریع میلگرد kg/m² زیربنا */
export const QUICK_REBAR_PER_SQM: Record<StructureType, number> = {
  concrete: 52,
  steel: 18, // غیر از اسکلت فولادی — فقط میلگرد سقف/فنداسیون سبک
  mixed: 40,
  masonry: 20,
}

/** فولاد اسکلت تن/m² زیربنا */
export const QUICK_STRUCTURAL_STEEL_TON_PER_SQM: Record<'steel' | 'mixed', number> = {
  steel: 0.055,
  mixed: 0.028,
}

export const BUILDING_AREA_FACTOR: Record<BuildingType, number> = {
  residential: 1,
  villa: 0.92,
  commercial: 1.1,
  office: 1.05,
  industrial: 1.15,
}

export const QUALITY_FACTOR: Record<QualityLevel, number> = {
  economy: 0.9,
  standard: 1,
  premium: 1.1,
}

export const CEMENT_BAG_KG = 50
export const PLASTER_BAG_KG = 40
export const TILE_ADHESIVE_BAG_KG = 20

export const YIELDS = {
  /** عیار تقریبی بتن سازه‌ای ~350kg/m³ → ۷ کیسه ۵۰کیلویی */
  cementBagsPerM3Concrete: 7,
  sandPerM3Concrete: 0.5,
  gravelPerM3Concrete: 0.9,
  /** بلوک ۲۰×۲۰×۴۰ استاندارد حدود ۱۲.۵ عدد در m² */
  blocksPerM2Wall: 12.5,
  /** آجر فشاری ۱۰سانتی حدود ۶۰–۷۰ در m² */
  bricksPerM2Wall: 68,
  /** گچ خاک + سفیدکاری حدود ۱۴–۱۶ kg/m² تک‌رو */
  plasterKgPerM2: 15,
  adhesiveKgPerM2: 4.5,
  cementBagsPerM3Masonry: 5,
  sandPerM3Masonry: 1,
}

export const WASTE = {
  concrete: 0.03,
  rebar: 0.04,
  cement: 0.04,
  aggregates: 0.06,
  masonry: 0.05,
  finishing: 0.07,
  steel: 0.03,
}

export const FOUNDATION_AREA_RATIO: Record<FoundationType, number> = {
  isolated: 0.18,
  strip: 0.28,
  mat: 0.9,
  pile_cap: 0.22,
}

export const SLAB_THICKNESS: Record<SlabType, number> = {
  solid: 0.16,
  joist: 0.28,
  waffle: 0.26,
  metal_deck: 0.11,
}

/** ضریب حجم بتن سقف نسبت به دال توپر هم‌ضخامت */
export const SLAB_VOLUME_FACTOR: Record<SlabType, number> = {
  solid: 1,
  joist: 0.48,
  waffle: 0.58,
  metal_deck: 0.65,
}
