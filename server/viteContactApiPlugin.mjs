import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function loadEnv() {
  dotenv.config({ path: path.join(root, '.env.local') })
  dotenv.config({ path: path.join(root, '.env') })
}

/**
 * Dev/preview only — never loaded during `vite build` / Vercel build.
 * Mounts Express for /api/* while Vite serves the SPA.
 */
export function viteContactApiPlugin() {
  return {
    name: 'vite-contact-api',
    apply: 'serve',
    async configureServer(server) {
      loadEnv()
      const { createApp } = await import('./createApp.mjs')
      const app = createApp()
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()
        return app(req, res, next)
      })
    },
    async configurePreviewServer(server) {
      loadEnv()
      const { createApp } = await import('./createApp.mjs')
      const app = createApp()
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api')) return next()
        return app(req, res, next)
      })
    },
  }
}
