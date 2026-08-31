const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
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
