import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  Mail, Menu, X, ExternalLink, Download,
  ChevronLeft, ChevronRight, Code2, Database, Globe, Terminal, Layers, ArrowRight,
  MapPin, Calendar, Award, CheckCircle2, Sun, Moon
} from 'lucide-react'
import { t } from './i18n'
import { LangProvider, useLang } from './LangContext'
import { ScrollTrail } from './ScrollTrail'
import { scrollToSection } from './scrollToSection'
import AdminMessages from './AdminMessages'
import {
  personal,
  resumeMeta,
  skills as skillCategories,
  featuredProject,
  socialLinks,
} from './data/portfolio'

// ── Brand icons ───────────────────────────────────────────────────────────────
function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}
function LinkedinIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
}

// ── Dark mode ─────────────────────────────────────────────────────────────────
const DarkCtx = createContext({ dark: false, toggle: () => {} })

function DarkProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return <DarkCtx.Provider value={{ dark, toggle: () => setDark(v => !v) }}>{children}</DarkCtx.Provider>
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >{children}</motion.div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-4 border"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
      <span className="w-1.5 h-1.5 rounded-full gradient-bg" />
      {children}
    </div>
  )
}

function Logo() {
  return (
    <a href="#home" aria-label={`${personal.name} home`} className="font-['Plus_Jakarta_Sans'] font-extrabold text-2xl tracking-tight select-none" dir="ltr">
      <span style={{ color: 'var(--secondary)' }}>S</span>
      <span style={{ color: 'var(--primary)' }}>3</span>
      <span style={{ color: 'var(--accent)' }}>.</span>
    </a>
  )
}

function DirArrow({ isRTL }: { isRTL: boolean }) {
  return <ArrowRight className="w-4 h-4" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
}

// ── Controls ──────────────────────────────────────────────────────────────────
function DarkToggle() {
  const { dark, toggle } = useContext(DarkCtx)
  return (
    <button onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ background: 'var(--bg2)', border: '1.5px solid var(--border)' }}
      className="relative w-14 h-7 rounded-full flex items-center px-1 transition-colors duration-300">
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className="gradient-bg w-5 h-5 rounded-full flex items-center justify-center text-white shadow"
        style={{ marginLeft: dark ? 'auto' : 0 }}>
        {dark ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
      </motion.span>
    </button>
  )
}

function LangToggle() {
  const { lang, setLang } = useLang()
  const tr = t[lang].langToggle
  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}
      aria-label={tr.ariaLabel}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:opacity-80"
      style={{ borderColor: 'var(--border)', background: 'var(--bg2)', color: 'var(--primary)' }}
    >
      <Globe className="w-3.5 h-3.5" />
      {tr.label}
    </button>
  )
}

// ── Nav ───────────────────────────────────────────────────────────────────────
const NAV_IDS = ['home','about','projects','skills','experience','contact'] as const

function Header() {
  const { lang } = useLang()
  const tr = t[lang]
  const isRTL = lang === 'fa'
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('home')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.35 }
    )
    NAV_IDS.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  const scrollTo = (id: string) => { scrollToSection(id); setOpen(false) }

  const navLabels: Record<string, string> = {
    home: tr.nav.home, about: tr.nav.about, projects: tr.nav.projects,
    skills: tr.nav.skills, experience: tr.nav.experience, contact: tr.nav.contact,
  }

  return (
    <header className={`site-header inset-x-0 w-full${scrolled || open ? ' is-scrolled' : ''}`}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Logo />

        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_IDS.map(id => (
            <button key={id} onClick={() => scrollTo(id)}
              className="relative px-3 py-1.5 text-sm rounded-lg transition-colors"
              style={{ color: active === id ? 'var(--primary)' : 'var(--muted)' }}>
              {navLabels[id]}
              {active === id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg -z-10"
                  style={{ background: 'var(--bg2)' }} />
              )}
            </button>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <LangToggle />
          <DarkToggle />
          <a href={resumeMeta.publicPath}
            download={resumeMeta.filename}
            className="gradient-bg flex items-center gap-1.5 px-4 py-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            dir="ltr">
            <Download className="w-3.5 h-3.5" /> {tr.nav.downloadCV}
          </a>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <LangToggle />
          <DarkToggle />
          <button onClick={() => setOpen(v => !v)}
            className="p-2 rounded-lg" style={{ color: 'var(--muted)' }}
            aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden px-5 pb-4"
            style={{ background: 'color-mix(in srgb, var(--card) 96%, transparent)', backdropFilter: 'blur(14px)' }}>
            {NAV_IDS.map(id => (
              <button key={id} onClick={() => scrollTo(id)}
                className="block w-full text-left py-3 text-sm border-b last:border-0"
                style={{ color: 'var(--text)', borderColor: 'var(--border)', textAlign: isRTL ? 'right' : 'left' }}>
                {navLabels[id]}
              </button>
            ))}
            <a href={resumeMeta.publicPath} download={resumeMeta.filename} dir="ltr"
              className="gradient-bg mt-3 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-white text-sm font-medium">
              <Download className="w-3.5 h-3.5" /> {tr.nav.downloadCV}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  const { lang } = useLang()
  const tr = t[lang].hero
  const isRTL = lang === 'fa'
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-16 overflow-hidden sect-plain">
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.12] gradient-bg blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-[380px] h-[380px] rounded-full opacity-[0.10] blur-3xl pointer-events-none"
        style={{ background: 'var(--secondary)' }} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.22]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <div className="relative max-w-6xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <SectionLabel>{tr.badge}</SectionLabel>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}
            className="font-['Plus_Jakarta_Sans'] font-extrabold text-5xl md:text-6xl leading-[1.08] tracking-tight mt-2 mb-4"
            style={{ color: 'var(--text)' }}>
            {tr.greeting}{' '}
            <span className="gradient-text block">{tr.name}</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}
            className="font-['Plus_Jakarta_Sans'] font-bold text-2xl md:text-3xl mb-2"
            style={{ color: 'var(--primary)' }}>
            {tr.title}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.24 }}
            className="font-['Plus_Jakarta_Sans'] font-semibold text-lg mb-4 ltr-isolate"
            style={{ color: 'var(--muted)' }}>
            {tr.headline}
          </motion.p>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
            className="text-lg leading-relaxed max-w-[540px] mb-8" style={{ color: 'var(--muted)' }}>
            {tr.bio}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.36 }}
            className="flex flex-wrap gap-3 mb-8">
            <button onClick={() => scrollToSection('projects')}
              className="gradient-bg flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium shadow-md hover:opacity-90 transition-opacity">
              {tr.cta1} <DirArrow isRTL={isRTL} />
            </button>
            <button onClick={() => scrollToSection('about')}
              className="flex items-center gap-2 px-6 py-3 rounded-full font-medium border transition-all hover:opacity-80"
              style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
              {tr.cta2}
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="flex items-center gap-3">
            {[
              { href: personal.github.url, icon: <GithubIcon />, label: 'GitHub' },
              { href: personal.linkedin.url, icon: <LinkedinIcon />, label: 'LinkedIn' },
              { href: `mailto:${personal.email}`, icon: <Mail className="w-4 h-4" />, label: 'Email' },
            ].map(s => (
              <a key={s.label} href={s.href} target={s.label !== 'Email' ? '_blank' : undefined}
                rel="noopener noreferrer" aria-label={s.label}
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all hover:scale-110"
                style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                {s.icon}
              </a>
            ))}
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-[28px] scale-105 gradient-bg opacity-20 blur-2xl" />
            <div className="gradient-border relative w-72 h-80 rounded-[28px] overflow-hidden shadow-2xl"
              style={{ background: 'var(--card)' }}>
              <img
                src="/images/profile.png"
                alt={personal.name}
                className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
              />
              <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4"
                style={{ background: 'linear-gradient(to top, rgba(8,18,40,0.85) 0%, transparent 100%)' }}>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-lg text-white">{personal.name}</p>
                <p className="text-sm text-white/80">{personal.title}</p>
                <div className="flex items-center gap-1.5 text-xs text-white/70 mt-1">
                  <MapPin className="w-3 h-3" /> {personal.location.en}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-3 -right-3 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 border"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }} dir="ltr">
              <span className="text-lg">🐍</span>
              <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>Python · Django</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  const { lang } = useLang()
  const tr = t[lang].about
  const icons = [<CheckCircle2 className="w-4 h-4" />, <Code2 className="w-4 h-4" />, <Layers className="w-4 h-4" />]
  return (
    <section id="about" className="py-24 sect-layered">
      <div className="max-w-6xl mx-auto px-5">
        <FadeUp>
          <SectionLabel>{tr.label}</SectionLabel>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl md:text-5xl tracking-tight mb-6" style={{ color: 'var(--text)' }}>
            {tr.h1} <span className="gradient-text">{tr.h1accent}</span>
          </h2>
        </FadeUp>
        <div className="grid md:grid-cols-2 gap-12 items-start mt-8">
          <FadeUp delay={0.1}>
            <div className="space-y-4 text-lg leading-relaxed" style={{ color: 'var(--muted)' }}>
              <p>{tr.p1}</p><p>{tr.p2}</p><p>{tr.p3}</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[
                { label: tr.infoFocusLabel, value: tr.infoFocus },
                { label: tr.infoLocLabel,   value: tr.infoLoc },
                { label: tr.infoEduLabel,   value: tr.infoEdu },
                { label: tr.infoLangLabel,  value: tr.infoLang },
              ].map(item => (
                <div key={item.label} className="rounded-xl p-4 border" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--muted)' }}>{item.label}</p>
                  <p className="font-['Plus_Jakarta_Sans'] font-semibold text-sm" style={{ color: 'var(--text)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </FadeUp>
          <FadeUp delay={0.2}>
            <div className="space-y-4">
              {tr.values.map((v, i) => (
                <div key={i} className="rounded-2xl p-5 border transition-all hover:opacity-90"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start gap-3">
                    <div className="gradient-bg w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 mt-0.5">{icons[i]}</div>
                    <div>
                      <p className="font-['Plus_Jakarta_Sans'] font-bold mb-1" style={{ color: 'var(--text)' }}>{v.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{v.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Projects ──────────────────────────────────────────────────────────────────
const PROJECT_TECH = featuredProject?.technologies ?? []
const PROJECT_GALLERY = (featuredProject?.images ?? []).map((img) => ({
  src: img.src,
  alt: img.alt,
  fit: img.fit as 'cover' | 'contain',
}))

function SafeHandsCarousel({
  featuredLabel,
  numberLabel,
}: {
  featuredLabel: string
  numberLabel: string
}) {
  const slides = PROJECT_GALLERY
  const total = slides.length
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const goTo = useCallback((i: number) => {
    setIndex(((i % total) + total) % total)
  }, [total])

  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  // Keyboard navigation when carousel (or lightbox) is focused/open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox) {
        if (e.key === 'Escape') setLightbox(false)
        if (e.key === 'ArrowLeft') prev()
        if (e.key === 'ArrowRight') next()
        return
      }
      const root = rootRef.current
      const active = document.activeElement
      if (!root || (active !== root && !root.contains(active))) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
      if (e.key === 'ArrowRight') { e.preventDefault(); next() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, prev, next])

  useEffect(() => {
    if (!lightbox) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prevOverflow }
  }, [lightbox])

  const slide = slides[index]

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0]?.clientX ?? null
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return
    const dx = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 40) return
    if (dx > 0) prev()
    else next()
  }

  const navBtnClass =
    'absolute top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all hover:scale-105'
  const navBtnStyle: React.CSSProperties = {
    background: 'rgba(7, 23, 41, 0.62)',
    borderColor: 'rgba(94, 234, 212, 0.22)',
    color: '#DFF3F3',
    backdropFilter: 'blur(8px)',
  }

  return (
    <>
      <div
        ref={rootRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${featuredProject?.name ?? 'Project'} gallery`}
        className="relative outline-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative aspect-[16/10] sm:aspect-[2/1] overflow-hidden"
          style={{ background: '#071729' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={slide.src}
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full cursor-zoom-in"
              onClick={() => setLightbox(true)}
              aria-label={`View larger: ${slide.alt}`}
            >
              <img
                src={slide.src}
                alt={slide.alt}
                className={`w-full h-full ${slide.fit === 'cover' ? 'object-cover object-center' : 'object-contain object-center'}`}
                draggable={false}
              />
            </motion.button>
          </AnimatePresence>

          {index === 0 && (
            <div className="absolute inset-x-0 top-0 h-16 pointer-events-none"
              style={{ background: 'linear-gradient(to bottom, rgba(8,18,40,0.55), transparent)' }} />
          )}

          <div className="absolute top-3 left-4 flex items-center gap-2 z-20 pointer-events-none">
            <span className="text-xs px-2.5 py-1 rounded-full border font-medium backdrop-blur-sm"
              style={{ color: 'var(--primary)', borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--card) 88%, transparent)' }}>{featuredLabel}</span>
            <span className="text-xs px-2.5 py-1 rounded-full border ltr-isolate backdrop-blur-sm"
              style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 88%, transparent)' }}>{numberLabel}</span>
          </div>

          <span className="absolute top-3 right-3 z-20 text-[11px] px-2 py-0.5 rounded-full border ltr-isolate backdrop-blur-sm"
            style={{ color: '#DFF3F3', borderColor: 'rgba(94,234,212,0.2)', background: 'rgba(7,23,41,0.55)' }}>
            {index + 1} / {total}
          </span>

          {total > 1 && (
            <>
              <button type="button" aria-label="Previous image" onClick={prev}
                className={`${navBtnClass} left-2 sm:left-3`} style={navBtnStyle}>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" aria-label="Next image" onClick={next}
                className={`${navBtnClass} right-2 sm:right-3`} style={navBtnStyle}>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="flex items-center justify-center gap-2 py-2.5" style={{ background: 'var(--card)' }}>
            {slides.map((s, i) => (
              <button
                key={s.src}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: i === index ? 'var(--primary)' : 'var(--border)',
                  transform: i === index ? 'scale(1.2)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {lightbox && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={slide.alt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6"
              style={{ background: 'rgba(4, 12, 24, 0.88)', backdropFilter: 'blur(8px)' }}
              onClick={() => setLightbox(false)}
            >
              <button type="button" aria-label="Close preview"
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center border"
                style={{ background: 'rgba(7,23,41,0.8)', borderColor: 'rgba(94,234,212,0.25)', color: '#DFF3F3' }}
                onClick={() => setLightbox(false)}>
                <X className="w-5 h-5" />
              </button>

              <button type="button" aria-label="Previous image" onClick={(e) => { e.stopPropagation(); prev() }}
                className={`${navBtnClass} left-3 sm:left-6`} style={navBtnStyle}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" aria-label="Next image" onClick={(e) => { e.stopPropagation(); next() }}
                className={`${navBtnClass} right-3 sm:right-6`} style={navBtnStyle}>
                <ChevronRight className="w-5 h-5" />
              </button>

              <motion.img
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                initial={{ opacity: 0.6, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
                draggable={false}
              />
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs px-2.5 py-1 rounded-full border ltr-isolate"
                style={{ color: '#DFF3F3', borderColor: 'rgba(94,234,212,0.2)', background: 'rgba(7,23,41,0.7)' }}>
                {index + 1} / {total}
              </span>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}

function Projects() {
  const { lang } = useLang()
  const tr = t[lang].projects
  return (
    <section id="projects" className="py-24 sect-plain">
      <div className="max-w-6xl mx-auto px-5">
        <FadeUp>
          <SectionLabel>{tr.label}</SectionLabel>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl md:text-5xl tracking-tight mb-3" style={{ color: 'var(--text)' }}>
            {tr.h1} <span className="gradient-text">{tr.h1accent}</span>
          </h2>
          <p className="text-lg max-w-[540px]" style={{ color: 'var(--muted)' }}>{tr.sub}</p>
        </FadeUp>
        <div className="mt-10 max-w-3xl">
          <FadeUp delay={0.08}>
            <div className="rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <SafeHandsCarousel featuredLabel={tr.featured} numberLabel={tr.number} />
              <div className="p-5 md:p-6">
                <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl ltr-isolate" style={{ color: 'var(--text)' }}>{featuredProject?.name ?? 'Project'}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ color: 'var(--muted)', borderColor: 'var(--border)', background: 'var(--bg)' }}>{tr.shRole}</span>
                </div>
                <p className="text-sm font-medium mb-3 ltr-isolate" style={{ color: 'var(--primary)' }}>{tr.shSubtitle}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {PROJECT_TECH.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-xs font-medium border ltr-isolate"
                      style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--primary)' }}>{s}</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--muted)' }}>{tr.shDesc}</p>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>{tr.featuresLabel}</p>
                <ul className="grid sm:grid-cols-2 gap-1.5">
                  {tr.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                      <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Skills ────────────────────────────────────────────────────────────────────
const SKILL_ICONS = [
  <Terminal className="w-4 h-4" />,
  <Database className="w-4 h-4" />,
  <Globe className="w-4 h-4" />,
  <Layers className="w-4 h-4" />,
  <Code2 className="w-4 h-4" />,
  <Award className="w-4 h-4" />,
]

function Skills() {
  const { lang } = useLang()
  const tr = t[lang].skills
  return (
    <section id="skills" className="py-24 sect-layered">
      <div className="max-w-6xl mx-auto px-5">
        <FadeUp>
          <SectionLabel>{tr.label}</SectionLabel>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl md:text-5xl tracking-tight mb-3" style={{ color: 'var(--text)' }}>
            {tr.h1} <span className="gradient-text">{tr.h1accent}</span>
          </h2>
          <p className="text-lg" style={{ color: 'var(--muted)' }}>{tr.sub}</p>
        </FadeUp>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {skillCategories.map((cat, i) => (
            <FadeUp key={cat.id} delay={i * 0.08}>
              <div className="rounded-2xl border p-5 hover:shadow-md transition-shadow h-full"
                style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border mb-4"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--primary)' }}>
                  {SKILL_ICONS[i] ?? <Code2 className="w-4 h-4" />} {tr.cats[i]}
                </div>
                <div className="flex flex-col gap-2">
                  {cat.items.map(s => (
                    <div key={s} className="flex items-center gap-2 py-1.5 border-b last:border-0"
                      style={{ borderColor: 'var(--bg)' }}>
                      <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                      <span className="text-sm ltr-isolate" style={{ color: 'var(--text)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Experience ────────────────────────────────────────────────────────────────
function Experience() {
  const { lang } = useLang()
  const tr = t[lang].experience
  return (
    <section id="experience" className="py-24 sect-plain">
      <div className="max-w-7xl mx-auto px-5">
        <FadeUp>
          <SectionLabel>{tr.label}</SectionLabel>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl md:text-5xl tracking-tight mb-8" style={{ color: 'var(--text)' }}>
            {tr.h1} <span className="gradient-text">{tr.h1accent}</span>
          </h2>
        </FadeUp>

        <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-8 lg:gap-10 items-start">
          {/* Professional Experience */}
          <FadeUp delay={0.1}>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span className="w-2 h-2 rounded-full gradient-bg inline-block" /> {tr.expTitle}
            </h3>
            <div className="rounded-2xl border p-5" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold" style={{ color: 'var(--text)' }}>{tr.role}</p>
                  <p className="text-sm mt-0.5 ltr-isolate" style={{ color: 'var(--primary)' }}>{tr.org}</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                  <Calendar className="w-3 h-3" /> {tr.current}
                </span>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--muted)' }}>{tr.roleDesc}</p>
              <ul className="space-y-1.5 mb-4">
                {tr.highlights.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--accent)' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a href={personal.linkedin.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs hover:underline" style={{ color: 'var(--primary)' }}>
                {tr.viewLinkedIn} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </FadeUp>

          {/* Education & Technical Training */}
          <FadeUp delay={0.15}>
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl mb-1.5 flex items-center gap-2" style={{ color: 'var(--text)' }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--secondary)' }} /> {tr.eduTitle}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>{tr.eduSub}</p>

            <p className="text-xs font-semibold mb-2 tracking-wide uppercase" style={{ color: 'var(--primary)' }}>{tr.academicLabel}</p>
            <div className="rounded-2xl border p-4 mb-4" style={{ background: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 0 0 1px color-mix(in srgb, var(--primary) 18%, transparent)' }}>
              <div className="flex items-start justify-between flex-wrap gap-2 mb-1.5">
                <div>
                  <p className="font-['Plus_Jakarta_Sans'] font-bold" style={{ color: 'var(--text)' }}>{tr.academic.title}</p>
                  <p className="text-sm mt-0.5 ltr-isolate" style={{ color: 'var(--secondary)' }}>{tr.academic.institution}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs px-2 py-1 rounded-full border font-medium"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--primary)' }}>{tr.academic.status}</span>
                  <span className="text-xs ltr-isolate" style={{ color: 'var(--muted)' }}>{tr.academic.dates}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{tr.academic.desc}</p>
            </div>

            <p className="text-xs font-semibold mb-2 tracking-wide uppercase" style={{ color: 'var(--primary)' }}>{tr.trainingLabel}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {tr.training.map((item) => (
                <div key={item.title} className="rounded-2xl border p-3.5 h-full" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-sm leading-snug" style={{ color: 'var(--text)' }}>{item.title}</p>
                    <span className="text-[11px] shrink-0 ltr-isolate" style={{ color: 'var(--muted)' }}>{item.dates}</span>
                  </div>
                  <p className="text-xs mb-1.5 ltr-isolate" style={{ color: 'var(--secondary)' }}>{item.institution}</p>
                  <p className="text-sm leading-relaxed mb-2.5" style={{ color: 'var(--muted)' }}>{item.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.skills.map((skill) => (
                      <span key={skill} className="px-2 py-0.5 rounded-full text-[11px] font-medium border ltr-isolate"
                        style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--primary)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── CTA ───────────────────────────────────────────────────────────────────────
function CTAStrip() {
  const { lang } = useLang()
  const tr = t[lang].cta
  const isRTL = lang === 'fa'
  return (
    <section className="py-20 sect-plain">
      <div className="max-w-3xl mx-auto px-5 text-center">
        <FadeUp>
          <div className="relative cta-card rounded-3xl overflow-hidden p-10 shadow-sm">
            <div className="absolute inset-0 opacity-[0.04] gradient-bg pointer-events-none" />
            <h2 className="relative font-['Plus_Jakarta_Sans'] font-extrabold text-3xl md:text-4xl mb-4 tracking-tight" style={{ color: 'var(--text)' }}>
              {tr.h1} <span className="gradient-text">{tr.h1accent}</span>
            </h2>
            <p className="relative mb-7" style={{ color: 'var(--muted)' }}>{tr.sub}</p>
            <div className="relative flex flex-wrap gap-3 justify-center">
              <button onClick={() => scrollToSection('contact')}
                className="gradient-bg flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium hover:opacity-90 transition-opacity">
                {tr.btn1} <DirArrow isRTL={isRTL} />
              </button>
              <a href={personal.linkedin.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-full font-medium border transition-all hover:opacity-80"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
                <LinkedinIcon className="w-4 h-4" /> {tr.btn2}
              </a>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact() {
  const { lang } = useLang()
  const tr = t[lang].contact
  const isRTL = lang === 'fa'
  const emptyForm = { name: '', email: '', subject: '', message: '' }
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'sending') return

    const name = form.name.trim()
    const email = form.email.trim()
    const subject = form.subject.trim()
    const message = form.message.trim()

    if (!name || !email || !subject || !message) {
      setStatus('error')
      setFeedback('error')
      return
    }

    setStatus('sending')
    setFeedback(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json().catch(() => ({} as { success?: boolean }))
      if (!res.ok || !data.success) throw new Error('send_failed')

      setForm(emptyForm)
      setStatus('idle')
      setFeedback('success')
    } catch {
      setStatus('error')
      setFeedback('error')
    }
  }

  const fieldStyle: React.CSSProperties = { background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }
  const fields = [
    { key: 'name' as const,    label: tr.name,    ph: tr.namePh,    type: 'text',  max: 100 },
    { key: 'email' as const,   label: tr.email,   ph: tr.emailPh,   type: 'email', max: 150 },
    { key: 'subject' as const, label: tr.subject, ph: tr.subjectPh, type: 'text',  max: 150 },
  ]

  const buttonLabel = status === 'sending' ? tr.sending : tr.send

  return (
    <section id="contact" className="py-24 sect-layered">
      <div className="max-w-6xl mx-auto px-5">
        <FadeUp>
          <SectionLabel>{tr.label}</SectionLabel>
          <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-4xl md:text-5xl tracking-tight mb-3" style={{ color: 'var(--text)' }}>
            {tr.h1} <span className="gradient-text">{tr.h1accent}</span>
          </h2>
          <p className="text-lg max-w-[480px]" style={{ color: 'var(--muted)' }}>{tr.sub}</p>
        </FadeUp>

        <div className="mt-10 grid md:grid-cols-2 gap-10">
          <FadeUp delay={0.1}>
            <div className="space-y-4">
              {socialLinks().map(item => {
                const icon = item.label === 'LinkedIn' ? <LinkedinIcon className="w-5 h-5" />
                  : item.label === 'GitHub' ? <GithubIcon className="w-5 h-5" />
                  : <Mail className="w-5 h-5" />
                return (
                <a key={item.label} href={item.href}
                  target={item.label !== 'Email' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 rounded-2xl p-5 border transition-all hover:opacity-90 group"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--bg)', color: 'var(--primary)' }}>{icon}</div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{item.label}</p>
                    <p className="text-sm font-medium ltr-isolate" style={{ color: 'var(--text)' }}>{item.value}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--muted)' }} />
                </a>
                )
              })}
            </div>
          </FadeUp>

          <FadeUp delay={0.2}>
            <form onSubmit={handleSubmit} className="relative rounded-2xl border p-6 space-y-4"
              style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
              {fields.map(f => (
                <div key={f.key}>
                  <label htmlFor={f.key} className="block text-xs font-medium mb-1.5"
                    style={{ color: 'var(--muted)', textAlign: isRTL ? 'right' : 'left' }}>{f.label}</label>
                  <input id={f.key} type={f.type} required placeholder={f.ph} maxLength={f.max}
                    value={form[f.key]}
                    onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                    disabled={status === 'sending'}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition"
                    style={{ ...fieldStyle, textAlign: f.key === 'email' ? 'left' : isRTL ? 'right' : 'left', direction: f.key === 'email' ? 'ltr' : 'inherit' }}
                  />
                </div>
              ))}
              <div>
                <label htmlFor="message" className="block text-xs font-medium mb-1.5"
                  style={{ color: 'var(--muted)', textAlign: isRTL ? 'right' : 'left' }}>{tr.message}</label>
                <textarea id="message" required rows={4} placeholder={tr.messagePh} maxLength={2000}
                  value={form.message}
                  onChange={e => setForm(v => ({ ...v, message: e.target.value }))}
                  disabled={status === 'sending'}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition resize-none"
                  style={{ ...fieldStyle, textAlign: isRTL ? 'right' : 'left' }}
                />
              </div>
              {feedback && (
                <p className="text-sm" style={{ color: feedback === 'success' ? 'var(--secondary)' : '#ef4444', textAlign: isRTL ? 'right' : 'left' }}>
                  {feedback === 'success' ? tr.successMsg : tr.errorMsg}
                </p>
              )}
              <button type="submit" disabled={status === 'sending'}
                className="relative z-10 gradient-bg w-full py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-60">
                {buttonLabel}
              </button>
            </form>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const { lang } = useLang()
  const tr = t[lang].footer
  return (
    <footer className="py-10" style={{ background: 'transparent', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <Logo />
          <span className="text-sm" style={{ color: 'var(--muted)' }}>{personal.name}</span>
        </div>
        <div className="flex items-center gap-3">
          {[
            { href: personal.linkedin.url, icon: <LinkedinIcon />, label: 'LinkedIn' },
            { href: personal.github.url, icon: <GithubIcon />, label: 'GitHub' },
            { href: `mailto:${personal.email}`, icon: <Mail className="w-4 h-4" />, label: 'Email' },
          ].map(s => (
            <a key={s.label} href={s.href}
              target={s.label !== 'Email' ? '_blank' : undefined}
              rel="noopener noreferrer" aria-label={s.label}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all hover:scale-110"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
              {s.icon}
            </a>
          ))}
        </div>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          © {new Date().getFullYear()} {personal.name}. {tr.copy}
        </p>
      </div>
    </footer>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
function Portfolio() {
  const { lang } = useLang()
  const tr = t[lang].trail
  const trailLabels: Record<string, string> = {
    home: tr.home, about: tr.about, projects: tr.projects,
    skills: tr.skills, experience: tr.experience, contact: tr.contact,
  }

  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:gradient-bg focus:text-white focus:rounded-lg">
        {lang === 'fa' ? 'رفتن به محتوای اصلی' : 'Skip to main content'}
      </a>
      <ScrollTrail lang={lang} labels={trailLabels} gotoLabel={tr.goto} />
      <Header />
      <main id="main" className={`relative z-[1] ${lang === 'fa' ? 'md:pl-14' : 'md:pr-14'}`}>
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Experience />
        <CTAStrip />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <DarkProvider>
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
    </DarkProvider>
  )
}
