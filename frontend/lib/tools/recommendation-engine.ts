import type { CalcResult } from './calculation-engine'
import type { BuildingType, StructureType } from './coefficients'

export interface ProductRecommendationHint {
  reason: string
  categoryHints: string[]
  tags: string[]
  priority: number
}

/**
 * Stateless recommendation rules → category hints for live shop catalog filtering.
 * Does not store user project data.
 */
export function buildRecommendationHints(result: CalcResult): ProductRecommendationHint[] {
  const { buildingType, structureType, floors, totalArea } = result.summary
  const hints: ProductRecommendationHint[] = []

  hints.push({
    reason: 'برای امنیت ورودی واحد و ساختمان',
    categoryHints: ['ضدسرقت', 'ضد سرقت', 'درب'],
    tags: ['anti-theft', 'entrance'],
    priority: 100,
  })

  if (floors >= 3 || buildingType === 'residential' || buildingType === 'commercial') {
    hints.push({
      reason: 'مناسب لابی و ورودی مشترک ساختمان چندطبقه',
      categoryHints: ['لابی', 'آپارتمان', 'اداری'],
      tags: ['lobby'],
      priority: 90,
    })
  }

  if (floors >= 2 || buildingType === 'residential') {
    hints.push({
      reason: 'برای پارکینگ و فضای مشاع',
      categoryHints: ['پارکینگ', 'حیاط', 'فلزی'],
      tags: ['parking'],
      priority: 80,
    })
  }

  if (structureType === 'steel' || structureType === 'mixed') {
    hints.push({
      reason: 'هماهنگ با سازه فلزی / ترکیبی — چارچوب و متعلقات فلزی',
      categoryHints: ['چارچوب', 'چهارچوب', 'فلزی', 'یراق'],
      tags: ['frame', 'metal'],
      priority: 85,
    })
  }

  if (buildingType === 'villa') {
    hints.push({
      reason: 'پیشنهاد ویژه پروژه‌های ویلایی و ورودی لوکس',
      categoryHints: ['ویلا', 'لوکس', 'ضدسرقت'],
      tags: ['villa'],
      priority: 95,
    })
  }

  if (totalArea >= 800) {
    hints.push({
      reason: 'پروژه در مقیاس بزرگ — درب‌های تجاری و مقاوم',
      categoryHints: ['تجاری', 'ضد حریق', 'اداری'],
      tags: ['commercial', 'fire'],
      priority: 88,
    })
  }

  if (buildingType === 'office' || buildingType === 'commercial') {
    hints.push({
      reason: 'نیاز فضای اداری/تجاری به درب ضدحریق و تردد بالا',
      categoryHints: ['ضد حریق', 'اداری', 'تجاری'],
      tags: ['fire', 'office'],
      priority: 92,
    })
  }

  return hints.sort((a, b) => b.priority - a.priority)
}

export function scoreProductAgainstHints(
  product: { name: string; categoryName: string; tags?: string[] },
  hints: ProductRecommendationHint[],
): { score: number; reason: string } {
  const hay = `${product.name} ${product.categoryName} ${(product.tags ?? []).join(' ')}`.toLowerCase()
  let best = { score: 0, reason: 'محصول منتخب گروه صنعتی مشعوف برای تکمیل پروژه شما' }

  for (const hint of hints) {
    let hit = 0
    for (const token of hint.categoryHints) {
      if (hay.includes(token.toLowerCase())) hit += 2
    }
    for (const tag of hint.tags) {
      if (hay.includes(tag.toLowerCase())) hit += 1
    }
    const score = hit * hint.priority
    if (score > best.score) {
      best = { score, reason: hint.reason }
    }
  }

  // Soft base score so catalog isn't empty
  if (best.score === 0 && /درب|در|چارچوب|چهارچوب/.test(hay)) {
    best = { score: 10, reason: best.reason }
  }

  return best
}

export function buildingLabel(type: BuildingType): string {
  const map: Record<BuildingType, string> = {
    residential: 'مسکونی',
    villa: 'ویلایی',
    commercial: 'تجاری',
    office: 'اداری',
    industrial: 'صنعتی',
  }
  return map[type]
}

export function structureLabel(type: StructureType): string {
  const map: Record<StructureType, string> = {
    concrete: 'بتن‌آرمه',
    steel: 'فلزی',
    mixed: 'ترکیبی',
    masonry: 'بنایی',
  }
  return map[type]
}
