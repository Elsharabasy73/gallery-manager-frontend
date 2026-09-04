import { apiFetch } from './client'

export function getEmployees(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/employees${qs}`)
}

export function createEmployee(payload) {
  // payload: { firstName, lastName, email, password, passwordConfirm, jobTitle, phone }
  // Backend auto-assigns galleryId from gallery_owner's gallery (per design doc)
  // Some backends use POST /employees, fallback is handled by caller if 404
  return apiFetch('/employees', { method: 'POST', body: payload })
}

export function unwrapEmployees(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data?.employees)) return res.data.employees
  return []
}
