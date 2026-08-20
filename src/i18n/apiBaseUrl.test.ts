import { resolveApiBaseUrl, setApiBaseUrlFallback } from './apiBaseUrl'

describe('resolveApiBaseUrl', () => {
  it('uses default API for any hostname', () => {
    expect(resolveApiBaseUrl('localhost')).toBe('https://stage-amarilo.ddev.site/api')
    expect(resolveApiBaseUrl('medellin.localhost')).toBe('https://stage-amarilo.ddev.site/api')
  })

  it('honors configured fallback', () => {
    setApiBaseUrlFallback('https://example.com/api')
    expect(resolveApiBaseUrl('localhost')).toBe('https://example.com/api')
    setApiBaseUrlFallback('https://stage-amarilo.ddev.site/api')
  })
})
