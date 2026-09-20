import { apiFetch, BASE_URL } from './client'

const DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV

/**
 * Anonymous page-view beacon. Fire-and-forget: uses sendBeacon so it never
 * blocks navigation, with a fetch fallback. Never throws.
 *
 * Note: DNT/GPC is intentionally NOT honored. This is first-party anonymous
 * counting only (random UUID + page path, no IP, no cookie, no personal
 * data), so there is nothing to opt out of.
 */
export function trackPageView({ visitorId, sessionId, path, referrer }) {
  try {
    // userId is only attached when logged in (links views to customers for admins).
    // /track is public — no auth header needed.
    let userId = null
    try {
      const rawUser = localStorage.getItem('user')
      const parsed = rawUser ? JSON.parse(rawUser) : null
      userId = parsed?.id || parsed?._id || null
    } catch {}
    const url = `${BASE_URL}/analytics/track`
    const payload = JSON.stringify({ visitorId, sessionId, userId, path, referrer: referrer || null })
    if (typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'application/json' })
      const queued = navigator.sendBeacon(url, blob)
      if (DEV) console.debug(`[tracking] beacon ${queued ? 'queued' : 'NOT queued'} → ${path}`)
      if (queued) return
      if (DEV) console.warn('[tracking] sendBeacon refused the payload, falling back to fetch')
    }
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).then((res) => {
      if (DEV && !res.ok) console.warn(`[tracking] fallback responded ${res.status} for ${path}`)
    }).catch((err) => {
      if (DEV) console.warn('[tracking] fallback failed:', err?.message || err)
    })
  } catch (err) {
    if (DEV) console.warn('[tracking] unexpected error:', err?.message || err)
  }
}

/**
 * Admin traffic overview: totals, daily series, top pages.
 * @param {Object} params - { from, to, groupBy: 'day'|'week'|'month' }
 */
export function getVisitors(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    search.set(key, String(value))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/analytics/visitors${qs}`)
}
