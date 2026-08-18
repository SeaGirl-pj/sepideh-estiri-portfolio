import { useEffect, useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'

type MessageStatus = 'new' | 'read' | 'replied'

type ContactMessage = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  status: MessageStatus
}

const STATUS_OPTIONS: MessageStatus[] = ['new', 'read', 'replied']

export default function AdminMessages() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const refreshSession = async () => {
    try {
      const res = await fetch('/api/admin/session', { credentials: 'include' })
      setAuthed(res.ok)
      if (res.ok) await loadMessages()
    } catch {
      setAuthed(false)
    }
  }

  const loadMessages = async () => {
    setLoadError(null)
    try {
      const res = await fetch('/api/admin/messages', { credentials: 'include' })
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setLoadError(data.message || 'Failed to load messages.')
        return
      }
      setMessages(Array.isArray(data.messages) ? data.messages : [])
    } catch {
      setLoadError('Failed to load messages.')
    }
  }

  useEffect(() => {
    void refreshSession()
  }, [])

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.success) {
        setLoginError(data.message || 'Invalid credentials.')
        setAuthed(false)
        return
      }
      setPassword('')
      setAuthed(true)
      await loadMessages()
    } catch {
      setLoginError('Login failed. Please try again.')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
    setAuthed(false)
    setMessages([])
  }

  const handleStatusChange = async (id: number, status: MessageStatus) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      if (!res.ok) return
      setMessages(prev => prev.map(m => (m.id === id ? { ...m, status } : m)))
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this message permanently?')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (res.status === 401) {
        setAuthed(false)
        return
      }
      if (!res.ok) return
      setMessages(prev => prev.filter(m => m.id !== id))
    } finally {
      setDeletingId(null)
    }
  }

  const cardStyle = {
    background: 'var(--card)',
    borderColor: 'var(--border)',
    color: 'var(--text)',
  } as const

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-4xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--primary)' }}>Admin</p>
            <h1 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl tracking-tight">Messages</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm underline-offset-2 hover:underline" style={{ color: 'var(--muted)' }}>
              Back to site
            </Link>
            {authed && (
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="text-sm px-3 py-1.5 rounded-lg border"
                style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
              >
                Log out
              </button>
            )}
          </div>
        </div>

        {authed === null && (
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Checking session…</p>
        )}

        {authed === false && (
          <form
            onSubmit={handleLogin}
            className="rounded-2xl border p-6 space-y-4 max-w-md"
            style={cardStyle}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Sign in to view contact messages. This page is not linked from the public site.
            </p>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Username</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                required
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--muted)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              />
            </div>
            {loginError && <p className="text-sm" style={{ color: '#ef4444' }}>{loginError}</p>}
            <button
              type="submit"
              disabled={loggingIn}
              className="gradient-bg w-full py-3 rounded-xl text-white font-medium disabled:opacity-60"
            >
              {loggingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}

        {authed && (
          <div className="space-y-4">
            {loadError && <p className="text-sm" style={{ color: '#ef4444' }}>{loadError}</p>}
            {!loadError && messages.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No messages yet.</p>
            )}
            {messages.map(msg => (
              <article key={msg.id} className="rounded-2xl border p-5 space-y-3" style={cardStyle}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-lg">{msg.name}</h2>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm ltr-isolate underline-offset-2 hover:underline"
                      style={{ color: 'var(--primary)' }}
                    >
                      {msg.email}
                    </a>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-xs ltr-isolate" style={{ color: 'var(--muted)' }}>
                      {new Date(msg.created_at.endsWith('Z') ? msg.created_at : `${msg.created_at}Z`).toLocaleString()}
                    </p>
                    <label className="block text-xs" style={{ color: 'var(--muted)' }}>
                      Status
                      <select
                        value={msg.status}
                        disabled={updatingId === msg.id}
                        onChange={e => void handleStatusChange(msg.id, e.target.value as MessageStatus)}
                        className="mt-1 block w-full px-2 py-1.5 rounded-lg border text-sm"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      >
                        {STATUS_OPTIONS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>
                <p className="text-sm font-medium">{msg.subject}</p>
                <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--muted)' }}>{msg.message}</p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => void handleDelete(msg.id)}
                    disabled={deletingId === msg.id}
                    className="text-sm px-3 py-1.5 rounded-lg border transition-opacity disabled:opacity-60"
                    style={{ borderColor: 'rgba(239,68,68,0.35)', color: '#ef4444', background: 'transparent' }}
                  >
                    {deletingId === msg.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
