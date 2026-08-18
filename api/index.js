/**
 * Vercel serverless entry — Express app handles all /api/* routes.
 * Local development continues to use the Vite middleware plugin.
 */
import { createApp } from '../server/createApp.mjs'

const app = createApp()

export default app
