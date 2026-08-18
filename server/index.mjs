import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import express from 'express'
import dotenv from 'dotenv'
import { createApp } from './createApp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

dotenv.config({ path: path.join(root, '.env.local') })
dotenv.config({ path: path.join(root, '.env') })

const app = createApp()
const dist = path.join(root, 'dist')
const port = Number(process.env.PORT || 8443)

if (fs.existsSync(dist)) {
  app.use(express.static(dist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://localhost:${port}`)
})
