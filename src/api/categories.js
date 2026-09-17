import { apiFetch } from './client'

export function getCategories(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/categories${qs}`)
}

export function getCategory(id, params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/categories/${id}${qs}`)
}

export function unwrapCategories(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

export function unwrapCategory(res) {
  if (!res) return null
  if (res?.data?.data) return res.data.data
  if (res?.data && !Array.isArray(res.data)) return res.data
  return res
}

/** POST /categories — admin only. Backend auto-generates slug from name. */
export function createCategory(payload) {
  return apiFetch('/categories', { method: 'POST', body: payload })
}

/** PUT /categories/:id — admin only */
export function updateCategory(id, payload) {
  return apiFetch(`/categories/${id}`, { method: 'PUT', body: payload })
}

/** DELETE /categories/:id — admin only */
export function deleteCategory(id) {
  return apiFetch(`/categories/${id}`, { method: 'DELETE' })
}
