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

export function createEmployee(payload, galleryId = null) {
  // payload: { firstName, lastName, email, password, passwordConfirm, title, phone } - title not jobTitle per API
  // Backend expects title (see employee.validation.js:79) and galleryId via params {{LURL}}/api/v1/galleries/{{GALLERY_ID}}/employees
  // Controller sets req.body.galleryId = req.params.galleryId if present
  let body = { ...payload }
  // map legacy jobTitle -> title if needed
  if (body.jobTitle && !body.title) {
    body.title = body.jobTitle
    delete body.jobTitle
  }
  if (galleryId) {
    body.galleryId = String(galleryId)
    return apiFetch(`/galleries/${galleryId}/employees`, { method: 'POST', body })
  }
  return apiFetch('/employees', { method: 'POST', body })
}

export function unwrapEmployees(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  if (Array.isArray(res?.data?.employees)) return res.data.employees
  return []
}
