const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export async function apiFetch(path, { method = 'GET', body, token, isFormData = false } = {}) {
  const headers = {}
  const isFD = isFormData || (typeof FormData !== 'undefined' && body instanceof FormData)
  if (!isFD) headers['Content-Type'] = 'application/json'
  const authToken = token || (typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null)
  if (authToken) headers.Authorization = `Bearer ${authToken}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isFD ? body : JSON.stringify(body)) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const details = data?.error?.details
    const message = data?.message || data?.error?.message || `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.details = details
    err.data = data
    throw err
  }
  return data
}
export { BASE_URL }
