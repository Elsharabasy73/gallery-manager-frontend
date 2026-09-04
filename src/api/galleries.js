import { apiFetch } from './client'

/**
 * GET /galleries
 * Supports limit, page, fields, sort, keyword etc via ApiFeatures on backend
 * Example: getGalleries({ limit: 4, fields: 'id,name,slug,city,country,logo,banner' })
 */
export function getGalleries(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/galleries${qs}`)
}

export function getGallery(id, params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/galleries/${id}${qs}`)
}

export function unwrapGalleries(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

export function unwrapGallery(res) {
  if (!res) return null
  if (res?.data && !Array.isArray(res.data) && typeof res.data === 'object' && !res.results) return res.data
  if (res?.data?.data) return res.data.data
  return res
}

export function getMyGallery(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/galleries/my-gallery${qs}`)
}

export function createGallery(formData) {
  return apiFetch('/galleries', { method: 'POST', body: formData })
}

export function updateMyGallery(formData) {
  return apiFetch('/galleries/my-gallery', { method: 'PATCH', body: formData })
}

export function updateGallery(id, formData) {
  const body = formData instanceof FormData ? formData : formData
  const isFD = formData instanceof FormData
  return apiFetch(`/galleries/${id}`, { method: 'PUT', body, isFormData: isFD })
}
