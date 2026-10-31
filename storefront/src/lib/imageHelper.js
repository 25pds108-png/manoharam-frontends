/**
 * Resolves any backend product/plan image path or URL into a fully-qualified,
 * browser-fetchable URL.
 *
 * Handles:
 * - Null / undefined / empty values
 * - Blob URLs (blob:http...) and Data URIs (data:image/...) from file inputs
 * - Absolute URLs (http:// or https://)
 * - Relative backend paths (uploads/foods_profiles/..., /uploads/..., etc.)
 * - Safe character handling for paths with spaces or special characters
 * - Avoids duplicate backend base URL prepending
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/Manoharam-Real-Foods'
export const BACKEND_BASE = RAW_BASE_URL.replace(/\/+$/, '')

export function resolveImageUrl(src) {
  if (!src || typeof src !== 'string') return ''

  const trimmed = src.trim()
  if (!trimmed) return ''

  // 1. Data URLs or local object blob URLs (previews during upload)
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed
  }

  // 2. Placeholder URLs (e.g., example.com domain in test seed data)
  if (trimmed.includes('example.com')) {
    return '' // Let component fallback to authentic local photography
  }

  // 3. Fully qualified absolute URLs
  if (/^https?:\/\//i.test(trimmed)) {
    if (trimmed.includes('localhost/Manoharam-Real-Foods')) {
      const suffix = trimmed.split('localhost/Manoharam-Real-Foods')[1] || ''
      return `${BACKEND_BASE}${suffix}`
    }
    return trimmed
  }

  // 4. Relative paths: normalize slashes
  let cleanPath = trimmed.replace(/\\/g, '/').replace(/^\/+/, '')

  // If path already starts with the project directory name (e.g. "Manoharam-Real-Foods/uploads/...")
  const projectFolder = BACKEND_BASE.split('/').pop()
  if (projectFolder && cleanPath.startsWith(projectFolder + '/')) {
    cleanPath = cleanPath.slice(projectFolder.length + 1)
  }

  // Safely encode special characters in path segments without breaking slashes
  const encodedPath = cleanPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${BACKEND_BASE}/${encodedPath}`
}
