import nodemailer from 'nodemailer'

function smtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.CONTACT_RECEIVER_EMAIL,
  )
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Attempt to notify the portfolio owner. Never throws to the caller —
 * DB save must remain successful even if email fails.
 * @returns {Promise<{ sent: boolean, skipped?: boolean, error?: string }>}
 */
export async function sendContactNotification({ name, email, subject, message, createdAt }) {
  if (!smtpConfigured()) {
    console.warn('[mail] SMTP is not fully configured; skipping email notification.')
    return { sent: false, skipped: true }
  }

  try {
    const port = Number(process.env.SMTP_PORT)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      // 465 = implicit TLS (often more reliable with Gmail);
      // 587 = STARTTLS
      secure: port === 465,
      requireTLS: port === 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: String(process.env.SMTP_PASSWORD || '').replace(/\s+/g, ''),
      },
      connectionTimeout: 20000,
      greetingTimeout: 20000,
      tls: { minVersion: 'TLSv1.2' },
    })

    const when = createdAt || new Date().toISOString()
    const text = [
      'New message from your portfolio Contact form',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      `Date: ${when}`,
      '',
      'Message:',
      message,
    ].join('\n')

    const html = `
      <div style="font-family:Segoe UI,Arial,sans-serif;line-height:1.5;color:#0f172a">
        <h2 style="margin:0 0 12px">New portfolio Contact form message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Date:</strong> ${escapeHtml(when)}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap;background:#f8fafc;padding:12px;border-radius:8px">${escapeHtml(message)}</pre>
      </div>
    `

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_RECEIVER_EMAIL,
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      text,
      html,
    })

    console.log('[mail] Notification sent successfully.')
    return { sent: true }
  } catch (err) {
    console.error('[mail] Failed to send notification:', err instanceof Error ? err.message : err)
    return { sent: false, error: 'email_failed' }
  }
}
