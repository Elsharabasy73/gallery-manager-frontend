// Minimal JWT expiry check — no dependency, works with standard base64url JWTs.
export function isTokenExpired(token) {
  if (!token || typeof token !== 'string') return true
  const parts = token.split('.')
  if (parts.length !== 3) return true
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    )
    if (!payload.exp) return false // no exp claim — treat as non-expiring
    return payload.exp * 1000 <= Date.now()
  } catch {
    return true // malformed token — treat as expired
  }
}

export function clearStoredAuth() {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  } catch {}
}
