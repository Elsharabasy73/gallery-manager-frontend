import { apiFetch } from './client'

/** POST /support — public, no login required */
export function createTicket(payload) {
  return apiFetch('/support', { method: 'POST', body: payload })
}

export function getTickets(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/support${qs}`)
}

export function unwrapTickets(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

/** PUT /support/:id — admin only (status-only) */
export function updateTicketStatus(id, status) {
  return apiFetch(`/support/${id}`, { method: 'PUT', body: { status } })
}

/** DELETE /support/:id — admin only */
export function deleteTicket(id) {
  return apiFetch(`/support/${id}`, { method: 'DELETE' })
}
