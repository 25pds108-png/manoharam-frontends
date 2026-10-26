import axios from 'axios'

export const TOKEN_KEY = 'manoharam_admin_token'

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost/Manoharam-Real-Foods'

export const api = axios.create({
  baseURL: rawBaseUrl.replace(/\/+$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // The instance default above forces Content-Type: application/json on
  // every request. That's fine for plain JSON bodies, but it's wrong for
  // FormData (used by createProduct / createSubscriptionPlan for file
  // uploads) — the browser needs to set its own
  // "multipart/form-data; boundary=..." header, and it will only do that
  // if no Content-Type is already present. Strip the default here so
  // FormData requests get the right header automatically.
  if (config.data instanceof FormData) {
    if (typeof config.headers.delete === 'function') {
      // axios v1's AxiosHeaders
      config.headers.delete('Content-Type')
    } else {
      delete config.headers['Content-Type']
    }
  }

  return config
})

let onUnauthorized = null
export function setOnUnauthorized(fn) {
  onUnauthorized = fn
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status
    // admin_middleware.php returns 401 (bad/missing/expired token) or
    // 403 (valid token, but not an ADMIN role) — both should kick back to login.
    if ((status === 401 || status === 403) && onUnauthorized) {
      onUnauthorized()
    }
    return Promise.reject(error)
  }
)

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || error?.message || fallback
}