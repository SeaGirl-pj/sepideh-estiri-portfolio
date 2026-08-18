import express from 'express'
import cookieParser from 'cookie-parser'
import {
  ensureReady,
  insertContactMessage,
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
  getContactById,
} from './db/index.mjs'
import { validateContactBody } from './validate.mjs'
import { checkRateLimit, getClientIp } from './rateLimit.mjs'
import {
  verifyLogin,
  createSessionCookie,
  clearSessionCookie,
  requireAdmin,
  isAdminConfigured,
} from './auth.mjs'
import { sendContactNotification } from './mail.mjs'

const JSON_LIMIT = '32kb'

/** API-only router — safe to mount under Vite without blocking the SPA. */
export function createApiRouter() {
  const router = express.Router()
  router.use(express.json({ limit: JSON_LIMIT }))
  router.use(cookieParser())

  router.use(async (_req, res, next) => {
    try {
      await ensureReady()
      next()
    } catch (err) {
      console.error('[db] init failed:', err instanceof Error ? err.message : err)
      res.status(500).json({
        success: false,
        message: 'Database is unavailable. Please try again later.',
      })
    }
  })

  router.post('/contact', async (req, res) => {
    try {
      const ip = getClientIp(req)
      if (!checkRateLimit(ip)) {
        return res.status(429).json({
          success: false,
          message: 'Too many requests. Please try again later.',
        })
      }

      const validated = validateContactBody(req.body)
      if (!validated.ok) {
        return res.status(validated.status).json({
          success: false,
          message: validated.error,
        })
      }

      const id = await insertContactMessage(validated.data)
      const saved = await getContactById(id)

      // Email is best-effort; never roll back the DB insert.
      void sendContactNotification({
        ...validated.data,
        createdAt: saved?.created_at,
      })

      return res.status(201).json({
        success: true,
        message: 'Message received successfully.',
      })
    } catch (err) {
      console.error('[contact] Unexpected error:', err instanceof Error ? err.message : err)
      return res.status(500).json({
        success: false,
        message: 'Something went wrong. Please try again later.',
      })
    }
  })

  router.post('/admin/login', (req, res) => {
    if (!isAdminConfigured()) {
      return res.status(503).json({ success: false, message: 'Admin access is not configured.' })
    }
    const username = String(req.body?.username ?? '')
    const password = String(req.body?.password ?? '')
    if (!verifyLogin(username, password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' })
    }
    const cookie = createSessionCookie()
    res.cookie(cookie.name, cookie.value, cookie.options)
    return res.json({ success: true, message: 'Logged in.' })
  })

  router.post('/admin/logout', (_req, res) => {
    const cookie = clearSessionCookie()
    res.cookie(cookie.name, cookie.value, cookie.options)
    return res.json({ success: true, message: 'Logged out.' })
  })

  router.get('/admin/session', requireAdmin, (_req, res) => {
    return res.json({ success: true, authenticated: true })
  })

  router.get('/admin/messages', requireAdmin, async (_req, res) => {
    try {
      const messages = await listContactMessages()
      return res.json({ success: true, messages })
    } catch (err) {
      console.error('[admin] list failed:', err instanceof Error ? err.message : err)
      return res.status(500).json({ success: false, message: 'Failed to load messages.' })
    }
  })

  router.patch('/admin/messages/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: 'Invalid message id.' })
    }
    const status = String(req.body?.status ?? '')
    const result = await updateContactStatus(id, status)
    if (!result.ok) {
      const code = result.error === 'not_found' ? 404 : 400
      return res.status(code).json({
        success: false,
        message: result.error === 'not_found' ? 'Message not found.' : 'Invalid status.',
      })
    }
    return res.json({ success: true, message: 'Status updated.', status })
  })

  router.delete('/admin/messages/:id', requireAdmin, async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ success: false, message: 'Invalid message id.' })
    }
    const result = await deleteContactMessage(id)
    if (!result.ok) {
      return res.status(404).json({ success: false, message: 'Message not found.' })
    }
    return res.json({ success: true, message: 'Message deleted.' })
  })

  return router
}

/** Full Express app for local Vite middleware and Vercel serverless. */
export function createApp() {
  const app = express()
  app.disable('x-powered-by')
  app.use('/api', createApiRouter())
  return app
}
