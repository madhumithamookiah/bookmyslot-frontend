/** API origin for the separately deployed backend.
 * Local development leaves this empty so Vite can proxy /api to port 3000.
 * Production builds must define VITE_API_BASE_URL in the frontend host.
 */
const configuredBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').trim().replace(/\/$/, '')

if (import.meta.env.PROD && !configuredBaseUrl) {
  throw new Error(
    'VITE_API_BASE_URL is required for production. Set it to the deployed backend origin, e.g. https://your-backend.vercel.app.'
  )
}

export const API_BASE_URL = configuredBaseUrl

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`
}
