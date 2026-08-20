/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_GTM_ID: string
  readonly VITE_JWT_TOKEN: string
  readonly VITE_SALESIQ_WIDGET_CODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
