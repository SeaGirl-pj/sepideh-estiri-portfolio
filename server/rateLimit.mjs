/**
 * In-memory rate limiter.
 *
 * Local: works well against a single Node process.
 * Vercel: each serverless instance has its own memory, so limits are
 * best-effort only (not globally shared). Server-side validation remains
 * the primary abuse protection for this personal portfolio.
 */

const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 5

/** @type {Map<string, { start: number, count: number }>} */
const hits = new Map()

export function getClientIp(req) {
  const xf = req.headers['x-forwarded-for']
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim()
  return req.socket?.remoteAddress || req.ip || 'unknown'
}

export function checkRateLimit(ip) {
  const now = Date.now()
  const entry = hits.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 })
    return true
  }
  if (entry.count >= RATE_MAX) return false
  entry.count += 1
  return true
}
