// src/types/sql-js.d.ts
declare module 'sql.js' {
  /**
   * Configuration for initSqlJs.
   * locateFile: (fileName) => URL string for the wasm.
   */
  export interface SqlJsConfig {
    locateFile?: (file: string) => string
  }

  import type { SqlJsStatic, Database } from 'sql.js'

  /**
   * Initializes sql.js. Accepts optional configuration to locate the wasm file.
   */
  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>

  export type { SqlJsStatic, Database }
}
