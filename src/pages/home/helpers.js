export const FALLBACK_CATEGORIES = [
  { id: 'sofas', name: 'Sofas', arabicName: 'صوفا', slug: 'sofas' },
  { id: 'tables', name: 'Tables', arabicName: 'طاولات', slug: 'tables' },
  { id: 'seating', name: 'Seating', arabicName: 'مقاعد', slug: 'seating' },
  { id: 'lighting', name: 'Lighting', arabicName: 'إضاءة', slug: 'lighting' },
  { id: 'decor', name: 'Decor', arabicName: 'ديكور', slug: 'decor' },
]

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'GA'
}

function getProductCategoryKey(product) {
  const category = product?.category
  const value = typeof category === 'string'
    ? category
    : category?.id || category?.slug || category?.name || product?.categoryId || product?.name || product?.id
  return String(value || '').trim().toLocaleLowerCase()
}

export function selectHomeProducts(candidates, limit) {
  const selected = []
  const categoryCounts = new Map()

  for (const product of candidates) {
    if (selected.length >= limit) break
    const key = getProductCategoryKey(product)
    if (key && categoryCounts.has(key)) continue
    selected.push(product)
    if (key) categoryCounts.set(key, 1)
  }

  while (selected.length < limit) {
    let nextProduct = null
    let nextKey = null
    let lowestCount = Infinity

    for (const product of candidates) {
      if (selected.includes(product)) continue
      const key = getProductCategoryKey(product)
      const count = key ? categoryCounts.get(key) || 0 : 0
      if (count < lowestCount) {
        nextProduct = product
        nextKey = key
        lowestCount = count
      }
    }

    if (!nextProduct) break
    selected.push(nextProduct)
    if (nextKey) categoryCounts.set(nextKey, lowestCount + 1)
  }

  return selected
}
