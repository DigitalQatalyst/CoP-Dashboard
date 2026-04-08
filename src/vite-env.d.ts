/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AZURE_CLIENT_ID: string
  readonly VITE_AZURE_TENANT_ID: string
  readonly VITE_SHAREPOINT_SITE_URL: string
  readonly VITE_SHAREPOINT_SITE_PATH: string
  readonly VITE_SHAREPOINT_FILE_ID: string
  readonly VITE_SHAREPOINT_WORKSHEET_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}