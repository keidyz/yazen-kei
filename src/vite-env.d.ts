/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FEATURE_FLAG?: "true" | "false";
  // Add more VITE_ vars as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}