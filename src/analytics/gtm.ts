declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export function pushToDataLayer(event: Record<string, unknown>) {
  window.dataLayer = window.dataLayer ?? []
  window.dataLayer.push(event)
}

export function trackPageView(path: string) {
  pushToDataLayer({
    event: 'page_view',
    page_path: path,
  })
}
