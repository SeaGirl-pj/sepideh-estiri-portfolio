/**
 * Database facade:
 * - DATABASE_URL set  → PostgreSQL (Neon / Vercel production)
 * - otherwise         → SQLite file (local development)
 *
 * SQLite is loaded only when needed so Vercel never imports `node:sqlite`.
 */

/** @type {typeof import('./sqlite.mjs') | typeof import('./postgres.mjs') | null} */
let store = null

function usePostgres() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim())
}

async function getStore() {
  if (store) return store
  if (usePostgres()) {
    store = await import('./postgres.mjs')
    return store
  }
  if (process.env.VERCEL) {
    throw new Error('DATABASE_URL is required when running on Vercel.')
  }
  store = await import('./sqlite.mjs')
  return store
}

export async function ensureReady() {
  const s = await getStore()
  await s.ensureReady()
}

export async function insertContactMessage(data) {
  const s = await getStore()
  return s.insertContactMessage(data)
}

export async function listContactMessages() {
  const s = await getStore()
  return s.listContactMessages()
}

export async function updateContactStatus(id, status) {
  const s = await getStore()
  return s.updateContactStatus(id, status)
}

export async function deleteContactMessage(id) {
  const s = await getStore()
  return s.deleteContactMessage(id)
}

export async function getContactById(id) {
  const s = await getStore()
  return s.getContactById(id)
}

export async function getDriverName() {
  const s = await getStore()
  return s.getDriverName()
}
