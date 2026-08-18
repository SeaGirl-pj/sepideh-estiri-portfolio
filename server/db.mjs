import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '..', 'data')
const DB_PATH = process.env.CONTACT_DB_PATH
  ? path.resolve(process.env.CONTACT_DB_PATH)
  : path.join(DATA_DIR, 'contact.db')

/** @type {DatabaseSync | null} */
let db = null

export function getDb() {
  if (db) return db
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  db = new DatabaseSync(DB_PATH)
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'read', 'replied'))
    );
    CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages(created_at DESC);
  `)
  return db
}

export function insertContactMessage({ name, email, subject, message }) {
  const database = getDb()
  const stmt = database.prepare(`
    INSERT INTO contact_messages (name, email, subject, message, status)
    VALUES (?, ?, ?, ?, 'new')
  `)
  const result = stmt.run(name, email, subject, message)
  return Number(result.lastInsertRowid)
}

export function listContactMessages() {
  const database = getDb()
  return database.prepare(`
    SELECT id, name, email, subject, message, created_at, status
    FROM contact_messages
    ORDER BY datetime(created_at) DESC, id DESC
  `).all()
}

export function updateContactStatus(id, status) {
  const database = getDb()
  const allowed = new Set(['new', 'read', 'replied'])
  if (!allowed.has(status)) return { ok: false, error: 'invalid_status' }
  const result = database.prepare(`
    UPDATE contact_messages SET status = ? WHERE id = ?
  `).run(status, id)
  if (result.changes === 0) return { ok: false, error: 'not_found' }
  return { ok: true }
}

export function deleteContactMessage(id) {
  const database = getDb()
  const result = database.prepare(`
    DELETE FROM contact_messages WHERE id = ?
  `).run(id)
  if (result.changes === 0) return { ok: false, error: 'not_found' }
  return { ok: true }
}

export function getContactById(id) {
  const database = getDb()
  return database.prepare(`
    SELECT id, name, email, subject, message, created_at, status
    FROM contact_messages WHERE id = ?
  `).get(id) ?? null
}
