import axios from 'axios'

export const TOKEN_KEY = 'manoharam_token'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost/Manoharam-Real-Foods'

export const api = axios.create({
  baseURL: rawBaseUrl.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Authorization header on every request if a token exists.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }

  return config
})

// Track a single "auth expired" callback so AuthContext can react
// (e.g. clear user state, redirect to login) without circular imports.
let onUnauthorized = null
export function setOnUnauthorized(fn) {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    // The backend's auth_middleware returns 401 for missing/invalid/expired tokens.
    if (status === 401 && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

/**
 * The PHP backend is inconsistent about error shape (some endpoints throw raw
 * exceptions, some return { success: false, message }). This pulls the best
 * human-readable message out of any axios error.
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  )
}
