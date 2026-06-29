/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Base URL for backend API calls.
   * - Relative (e.g. "/api/v1") → goes through the Vite dev proxy (same-origin).
   * - Absolute (e.g. "http://localhost:5001/api/v1") → calls the backend host:port directly.
   */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
