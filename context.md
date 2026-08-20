# Contexto — Frontend Amarilo

Workspace: `../context.md`. Rama activa i18n: **`feature/i18n`**.

## Stack

React 19 · Vite · TS · pnpm · Tailwind · Redux · axios

## i18n

- Rutas: `/` = es · `/en` · `/fr`
- API: `VITE_API_BASE_URL` + `?lang=`
- Selector: `LanguageSwitcher`
- Strings no-CMS: `src/i18n/ui.ts`

## API

- Default: `https://stage-amarilo.ddev.site/api` vía `resolveApiBaseUrl()` / `VITE_API_BASE_URL`.

## Arranque

```bash
pnpm install && pnpm dev
```
