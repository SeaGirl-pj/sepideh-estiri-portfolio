import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createApp } from './createApp.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  dotenv.config({ path: path.join(root, '.env.local') })
  dotenv.config({ path: path.join(root, '.env') })
}

/**
 * Mounts the Express app only for /api/* so Vite still serves the SPA.
 */
export function viteContactApiPlugin() {
  return {
    name: 'vite-contact-api',
    configureServer(server) {
      loadEnv()
      const app = createApp()
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()
        return app(req, res, next)
      })
    },
    configurePreviewServer(server) {
      loadEnv()
      const app = createApp()
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()
        return app(req, res, next)
      })
    },
  }
}
