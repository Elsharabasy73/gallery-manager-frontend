const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'
// Auto-fix for LAN testing: if page is loaded via 192.168.x.x but env is localhost, rewrite to current hostname
function resolveBaseUrl(raw) {
  if (typeof window === 'undefined') return raw
  try {
    const host = window.location.hostname
    // only rewrite when accessing via LAN IP (not localhost) and raw points to localhost
    if (host && host !== 'localhost' && host !== '127.0.0.1' && raw.includes('localhost')) {
      return raw.replace('localhost', host)
    }
    // also handle explicit 127.0.0.1 in raw
    if (host && host !== '127.0.0.1' && raw.includes('127.0.0.1')) {
      return raw.replace('127.0.0.1', host)
    }
  } catch {}
  return raw
}
const BASE_URL = resolveBaseUrl(RAW_BASE_URL)

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
