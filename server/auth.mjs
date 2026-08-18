import crypto from 'node:crypto'

const COOKIE_NAME = 'portfolio_admin_session'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || ''
}

function getCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || '',
    password: process.env.ADMIN_PASSWORD || '',
  }
}

export function isAdminConfigured() {
  const { username, password } = getCredentials()
  const secret = getSecret()
  return Boolean(username && password && secret && secret.length >= 16)
}

export function verifyLogin(username, password) {
  if (!isAdminConfigured()) return false
  const creds = getCredentials()
  return timingSafeEqual(username, creds.username) && timingSafeEqual(password, creds.password)
}

function timingSafeEqual(a, b) {
  const aa = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (aa.length !== bb.length) {
    crypto.timingSafeEqual(aa, Buffer.alloc(aa.length))
    return false
  }
  return crypto.timingSafeEqual(aa, bb)
}

function sign(payload) {
  const secret = getSecret()
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  return `${body}.${sig}`
}

function unsign(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [body, sig] = token.split('.')
  const secret = getSecret()
  if (!secret) return null
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url')
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload?.exp || Date.now() > payload.exp) return null
    if (payload.u !== getCredentials().username) return null
    return payload
  } catch {
    return null
  }
}

function isSecureCookie() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'
}

export function createSessionCookie() {
  const token = sign({
    u: getCredentials().username,
    exp: Date.now() + MAX_AGE_MS,
  })
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecureCookie(),
      maxAge: MAX_AGE_MS,
      path: '/',
    },
  }
}

export function clearSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecureCookie(),
      maxAge: 0,
      path: '/',
    },
  }
}

export function requireAdmin(req, res, next) {
  if (!isAdminConfigured()) {
    return res.status(503).json({ success: false, message: 'Admin access is not configured.' })
  }
  const token = req.cookies?.[COOKIE_NAME]
  if (!unsign(token)) {
    return res.status(401).json({ success: false, message: 'Unauthorized.' })
  }
  return next()
}

export { COOKIE_NAME }
