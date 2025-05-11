// src/lib/db.ts
import initSqlJs, { Database, SqlJsStatic } from 'sql.js'

let SQL: SqlJsStatic | null = null
let db: Database | null = null
const STORAGE_KEY = 'hitblow-db'

/** データベース初期化 */
async function initDb(): Promise<Database> {
  if (!SQL) {
    // wasm ファイルは public/sql-wasm.wasm に配置しておく
    SQL = await initSqlJs({ locateFile: () => '/sql-wasm.wasm' })
  }
  if (!db) {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      // base64 から復元
      const binary = Uint8Array.from(atob(saved), c => c.charCodeAt(0))
      db = new SQL.Database(binary)
    } else {
      db = new SQL.Database()
      // テーブル作成
      db.run(
        `CREATE TABLE IF NOT EXISTS results (
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           digit_count INTEGER,
           attempts INTEGER,
           elapsed_ms INTEGER,
           played_at TEXT
         );`
      )
      persistDb()
    }
  }
  return db
}

/** ローカルストレージにエクスポート */
function persistDb() {
  if (!db) return
  const data = db.export()
  const b64 = btoa(String.fromCharCode(...data))
  localStorage.setItem(STORAGE_KEY, b64)
}

/** 結果を追加 */
export async function addResult(
  digitCount: number,
  attempts: number,
  elapsedMs: number
) {
  const database = await initDb()
  const stmt = database.prepare(
    'INSERT INTO results (digit_count, attempts, elapsed_ms, played_at) VALUES (?, ?, ?, ?)'
  )
  const now = new Date().toISOString()
  stmt.run([digitCount, attempts, elapsedMs, now])
  stmt.free()
  persistDb()
}

/** 全件取得 */
export async function fetchResults(): Promise<{
  id: number
  digit_count: number
  attempts: number
  elapsed_ms: number
  played_at: string
}[]> {
  const database = await initDb()
  const res = database.exec('SELECT * FROM results ORDER BY id DESC;')
  if (!res.length) return []
  const { columns, values } = res[0]
  return values.map(row =>
    columns.reduce((obj: any, col: string, i: number) => {
      obj[col] = row[i]
      return obj
    }, {})
  )
}

/** 指定レコード削除 */
export async function deleteResult(id: number) {
  const database = await initDb()
  database.run('DELETE FROM results WHERE id = ?;', [id])
  persistDb()
}

/** 全レコード削除 */
export async function clearResults() {
  const database = await initDb()
  database.run('DELETE FROM results;')
  persistDb()
}
