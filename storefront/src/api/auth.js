import { api } from './client'

/**
 * POST /register.php
 * Body: { name, email, phone, address, password }
 * Returns: { success, message, user }
 */
export function registerCustomer(payload) {
  return api.post('/register.php', payload).then((res) => res.data)
}

/**
 * POST /login.php
 * Body: { email, password }
 * Returns: { success, message, token, user }
 */
export function login(payload) {
  return api.post('/login.php', payload).then((res) => res.data)
}

/**
 * POST /forgot_password.php
 * Body: { email }
 */
export function forgotPassword(payload) {
  return api.post('/forgot_password.php', payload).then((res) => res.data)
}

/**
 * POST /reset_password.php
 * Body: { email, token, new_password }
 */
export function resetPassword({ email, token, newPassword }) {
  return api
    .post('/reset_password.php', {
      email,
      token,
      new_password: newPassword,
    })
    .then((res) => res.data)
}

/**
 * GET /user_routes/get_profile.php
 * Auth required. Returns { success, profile: { id, name, email, phone, address, role, status } }
 */
export function getProfile() {
  return api.get('/user_routes/get_profile.php').then((res) => res.data)
}

/**
 * POST /user_routes/update_profile.php
 * Auth required. Body: { name, phone, address }
 */
export function updateProfile(payload) {
  return api.post('/user_routes/update_profile.php', payload).then((res) => res.data)
}

/**
 * POST /user_routes/change_password.php
 * Auth required. Body: { current_password, new_password }
 */
export function changePassword({ currentPassword, newPassword }) {
  return api
    .post('/user_routes/change_password.php', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    .then((res) => res.data)
}
