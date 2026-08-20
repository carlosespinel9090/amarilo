/**
 * Resolve Drupal API base URL (single site).
 * Override with VITE_API_BASE_URL when needed.
 */
const DEFAULT_API = 'https://stage-amarilo.ddev.site/api'

let configuredFallback = DEFAULT_API

/** Call once from api client with import.meta.env.VITE_API_BASE_URL. */
export function setApiBaseUrlFallback(url: string | undefined): void {
  if (url && url.trim() !== '') {
    configuredFallback = url.replace(/\/$/, '')
  }
}

export function resolveApiBaseUrl(
  _hostname: string = typeof window !== 'undefined' ? window.location.hostname : '',
): string {
  return configuredFallback || DEFAULT_API
}
