import { api } from './client'

/**
 * POST /login.php
 * Same login endpoint as the storefront — the backend doesn't have a
 * separate admin login route. We just check `user.role === 'ADMIN'` after
 * a successful login before granting access to this app.
 */
export function login(payload) {
  return api.post('/login.php', payload).then((res) => res.data)
}

/**
 * POST /admin_register.php
 * Creates a new ADMIN user. Note: this endpoint has no auth guard in the
 * backend (anyone can call it) — that's a backend security gap worth
 * fixing (it should require an existing admin's token), but the frontend
 * call itself just mirrors what the endpoint expects.
 */
export function registerAdmin(payload) {
  return api.post('/admin_register.php', payload).then((res) => res.data)
}
