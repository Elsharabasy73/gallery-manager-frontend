import { apiFetch } from './client'

// backend allows: gallery_owner, craftsman, user
// frontend uses: customer (=user), gallery_owner, craftsman
const toApiRole = (frontendRole) => {
  if (frontendRole === 'customer' || frontendRole === 'user') return 'user'
  return frontendRole
}

export function signup({ firstName, lastName, email, password, passwordConfirm, role }) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: {
      firstName,
      lastName,
      email,
      password,
      passwordConfirm,
      role: toApiRole(role),
    },
  })
}

export function login({ email, password }) {
  return apiFetch('/auth/login', { method: 'POST', body: { email, password } })
}

export function sendVerificationOtp(email) {
  return apiFetch('/auth/send-verification-otp', { method: 'POST', body: { email } })
}

export function verifyEmail({ email, otp }) {
  return apiFetch('/auth/verify-email', { method: 'POST', body: { email, otp } })
}

export function forgotPassword(email) {
  return apiFetch('/auth/forgot-password', { method: 'POST', body: { email } })
}

export function verifyResetOtp({ email, otp }) {
  return apiFetch('/auth/verify-reset-password-otp', { method: 'POST', body: { email, otp } })
}

export function resetPassword({ email, otp, password, passwordConfirm }) {
  return apiFetch('/auth/reset-password', { method: 'POST', body: { email, otp, password, passwordConfirm } })
}
