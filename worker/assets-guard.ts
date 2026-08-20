/**
 * Evita que assets hasheados inexistentes (p.ej. JS viejo en caché del HTML)
 * reciban index.html por el fallback SPA — eso deja la app en blanco.
 */
export default {
  async fetch(request: Request, env: { ASSETS: Fetcher }): Promise<Response> {
    const url = new URL(request.url)
    const res = await env.ASSETS.fetch(request)

    if (
      url.pathname.startsWith('/assets/') &&
      (res.headers.get('content-type') || '').includes('text/html')
    ) {
      return new Response('Not found', {
        status: 404,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    return res
  },
}
