import { neon } from '@neondatabase/serverless'

/** @type {ReturnType<typeof neon> | null} */
let sql = null
let schemaReady = false

function getSql() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required for PostgreSQL.')
  }
  if (!sql) sql = neon(url)
  return sql
}

export async function ensureReady() {
  const db = getSql()
  if (schemaReady) return
  await db`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'new'
        CHECK (status IN ('new', 'read', 'replied'))
    )
  `
  await db`
    CREATE INDEX IF NOT EXISTS idx_contact_created_at
    ON contact_messages (created_at DESC)
  `
  schemaReady = true
}

function mapRow(row) {
  if (!row) return null
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    created_at: row.created_at instanceof Date
      ? row.created_at.toISOString()
      : String(row.created_at),
    status: row.status,
  }
}

export async function insertContactMessage({ name, email, subject, message }) {
  await ensureReady()
  const rows = await getSql()`
    INSERT INTO contact_messages (name, email, subject, message, status)
    VALUES (${name}, ${email}, ${subject}, ${message}, 'new')
    RETURNING id
  `
  return Number(rows[0].id)
}

export async function listContactMessages() {
  await ensureReady()
  const rows = await getSql()`
    SELECT id, name, email, subject, message, created_at, status
    FROM contact_messages
    ORDER BY created_at DESC, id DESC
  `
  return rows.map(mapRow)
}

export async function updateContactStatus(id, status) {
  const allowed = new Set(['new', 'read', 'replied'])
  if (!allowed.has(status)) return { ok: false, error: 'invalid_status' }
  await ensureReady()
  const rows = await getSql()`
    UPDATE contact_messages
    SET status = ${status}
    WHERE id = ${id}
    RETURNING id
  `
  if (!rows.length) return { ok: false, error: 'not_found' }
  return { ok: true }
}

export async function deleteContactMessage(id) {
  await ensureReady()
  const rows = await getSql()`
    DELETE FROM contact_messages
    WHERE id = ${id}
    RETURNING id
  `
  if (!rows.length) return { ok: false, error: 'not_found' }
  return { ok: true }
}

export async function getContactById(id) {
  await ensureReady()
  const rows = await getSql()`
    SELECT id, name, email, subject, message, created_at, status
    FROM contact_messages
    WHERE id = ${id}
    LIMIT 1
  `
  return mapRow(rows[0] ?? null)
}

export function getDriverName() {
  return 'postgres'
}
