import { apiFetch } from './client'

export function getUsers(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return
    search.set(k, String(v))
  })
  const qs = search.toString() ? `?${search.toString()}` : ''
  return apiFetch(`/users${qs}`)
}

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

export function deleteUser(id) {
  return apiFetch(`/users/${id}`, { method: 'DELETE' })
}

const allowedFields = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "role",
  "isActive",
];

export function updateUser(id, payload) {
  // Only allow whitelisted fields
  const filtered = {};
  for (const key of allowedFields) {
    if (key in payload) filtered[key] = payload[key];
  }

  // Normalize frontend alias `customer` -> backend `user`
  if (filtered.role === "customer") filtered.role = "user";

  // Prevent privilege escalation: admin cannot create another admin
  if (filtered.role === "admin") {
    const err = new Error("Admins cannot assign 'admin' role");
    err.status = 403;
    throw err;
  }

  // Optional: normalize isActive to boolean if provided as string
  if ("isActive" in filtered && typeof filtered.isActive === "string") {
    filtered.isActive = filtered.isActive === "true";
  }

  return apiFetch(`/admins/users/${id}`, { method: "PATCH", body: filtered })
}

export function unwrapUsers(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
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