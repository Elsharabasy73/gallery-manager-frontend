import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPageView } from '../api/analytics'

const VISITOR_KEY = 'visitorId'
const SESSION_KEY = 'sessionId'
const SESSION_AT_KEY = 'sessionLastSeen'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 min of inactivity = new visit

// Internal pages are never counted as site traffic (also filtered server-side).
const isInternalPath = (path) => path.startsWith('/admin') || path.startsWith('/dashboard')

// UUIDv4 that works outside secure contexts too (plain-HTTP LAN/phone testing
// has no crypto.randomUUID). Always valid-UUID format so /track validation
// never rejects it.
function uuidv4() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  const rand = (n) => {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) return crypto.getRandomValues(new Uint8Array(n))
    return Array.from({ length: n }, () => Math.floor(Math.random() * 256))
  }
  const b = rand(16)
  b[6] = (b[6] & 0x0f) | 0x40 // version 4
  b[8] = (b[8] & 0x3f) | 0x80 // variant 10
  const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    // Generated once on first visit, reused on every visit after that.
    if (!id) {
      id = uuidv4()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

function getSessionId() {
  try {
    const now = Date.now()
    let id = sessionStorage.getItem(SESSION_KEY)
    const lastSeen = Number(sessionStorage.getItem(SESSION_AT_KEY) || 0)
    if (!id || now - lastSeen > SESSION_TIMEOUT_MS) {
      id = uuidv4()
      sessionStorage.setItem(SESSION_KEY, id)
    }
    sessionStorage.setItem(SESSION_AT_KEY, String(now))
    return id
  } catch {
    return null
  }
}

/**
 * Tracks one anonymous page view per navigation. Mount once (in Layout).
 * Fire-and-forget — never affects rendering or navigation.
 */
export default function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    const path = location.pathname
    if (isInternalPath(path)) {
      if (import.meta.env?.DEV) console.debug(`[tracking] skipped internal path ${path}`)
      return
    }
    const visitorId = getVisitorId()
    const sessionId = getSessionId()
    if (!visitorId || !sessionId) {
      if (import.meta.env?.DEV) console.warn('[tracking] skipped: no visitor/session id (storage unavailable?)')
      return
    }
    trackPageView({ visitorId, sessionId, path, referrer: document.referrer || null })
  }, [location.pathname])
}
