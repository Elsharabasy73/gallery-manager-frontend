import { apiFetch } from './client'

/**
 * Build query string from params object.
 * Supports: fields, sort, limit, page, keyword, and any filter (price, stock, galleryId, status, etc.)
 * Example:
 *   getProducts({ fields: 'id,name,mainImageUrl,gallery[id,name,slug,phone]', sort: 'price,-stock', limit: 12, page: 1, price: 250 })
 *   => /products?fields=...&sort=...&price=250&page=1&limit=12
 */
export function getProducts(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/products${qs}`)
}

export function getProduct(id, params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/products/${id}${qs}`)
}

// unwrap helper — handles { data: [...] } vs { data: { data: [...]}} vs raw array
export function unwrapProducts(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

export function unwrapProduct(res) {
  if (!res) return null
  if (res?.data && !Array.isArray(res.data) && typeof res.data === 'object' && !res.results) return res.data
  if (res?.data?.data) return res.data.data
  return res
}

export function createProduct(formData, galleryId = null) {
  const isFD = formData instanceof FormData
  if (galleryId) {
    if (isFD && !formData.has('galleryId')) formData.append('galleryId', String(galleryId))
    else if (formData && typeof formData === 'object' && !formData.galleryId) formData.galleryId = String(galleryId)
    return apiFetch(`/galleries/${galleryId}/products`, { method: 'POST', body: formData, isFormData: isFD })
  }
  return apiFetch('/products', { method: 'POST', body: formData, isFormData: isFD })
}

export function updateProduct(id, formData, galleryId = null) {
  const isFD = formData instanceof FormData
  if (galleryId && isFD && !formData.has('galleryId')) formData.append('galleryId', String(galleryId))
  else if (galleryId && formData && typeof formData === 'object' && !formData.galleryId) formData.galleryId = String(galleryId)
  return apiFetch(`/products/${id}`, { method: 'PUT', body: formData, isFormData: isFD })
}

export function deleteProduct(id) {
  return apiFetch(`/products/${id}`, { method: 'DELETE' })
}
