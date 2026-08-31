import { apiFetch } from './client'

export function getMe() {
  return apiFetch('/users/me')
}

export function updateMe(payload) {
  return apiFetch('/users/me', { method: 'PUT', body: payload })
}

export function updatePassword(payload) {
  // payload: { currentPassword, newPassword, passwordConfirm }
  return apiFetch('/users/me/password', { method: 'PUT', body: payload })
}

export function deleteMe() {
  return apiFetch('/users/me', { method: 'DELETE' })
}

function unwrapUser(res) {
  if (!res) return null
  if (res?.data?.user) return res.data.user
  if (res?.data && !Array.isArray(res.data) && typeof res.data === 'object' && res.data.firstName) return res.data
  if (res?.data?.data) return res.data.data
  if (res?.user) return res.user
  return res
}

export { unwrapUser }
