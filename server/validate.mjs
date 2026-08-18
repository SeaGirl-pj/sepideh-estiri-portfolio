const MAX = {
  name: 100,
  email: 150,
  subject: 150,
  message: 2000,
}

function trim(value) {
  return String(value ?? '').trim()
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * @param {unknown} body
 * @returns {{ ok: true, data: { name: string, email: string, subject: string, message: string } } | { ok: false, error: string, status: number }}
 */
export function validateContactBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, error: 'Invalid request body.', status: 400 }
  }

  const name = trim(/** @type {Record<string, unknown>} */ (body).name)
  const email = trim(/** @type {Record<string, unknown>} */ (body).email)
  const subject = trim(/** @type {Record<string, unknown>} */ (body).subject)
  const message = trim(/** @type {Record<string, unknown>} */ (body).message)

  if (!name) return { ok: false, error: 'Name is required.', status: 400 }
  if (name.length > MAX.name) return { ok: false, error: 'Name is too long.', status: 400 }
  if (!email) return { ok: false, error: 'Email is required.', status: 400 }
  if (email.length > MAX.email || !isValidEmail(email)) {
    return { ok: false, error: 'A valid email is required.', status: 400 }
  }
  if (!subject) return { ok: false, error: 'Subject is required.', status: 400 }
  if (subject.length > MAX.subject) return { ok: false, error: 'Subject is too long.', status: 400 }
  if (!message) return { ok: false, error: 'Message is required.', status: 400 }
  if (message.length > MAX.message) return { ok: false, error: 'Message is too long.', status: 400 }

  return { ok: true, data: { name, email, subject, message } }
}

export { MAX }
