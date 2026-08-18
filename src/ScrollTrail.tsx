import { useRef, useEffect, useState, useCallback, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useScroll, useMotionValue, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion'
import type { Lang } from './i18n'
import { scrollToSection } from './scrollToSection'

// Circuit-like SVG path: viewBox 0 0 48 900
// Alternates left/right by ~7px around center (x=24), rounded circuit bends
const PATH_D = [
  'M 24 15',
  'L 24 88',
  'Q 24 100 17 106', 'L 17 152', 'Q 17 160 24 166',
  'L 24 238',
  'Q 24 250 31 256', 'L 31 302', 'Q 31 310 24 316',
  'L 24 388',
  'Q 24 400 17 406', 'L 17 452', 'Q 17 460 24 466',
  'L 24 538',
  'Q 24 550 31 556', 'L 31 602', 'Q 31 610 24 616',
  'L 24 688',
  'Q 24 700 17 706', 'L 17 752', 'Q 17 760 24 766',
  'L 24 838',
  'Q 24 848 31 854', 'L 31 868', 'Q 31 878 24 884',
  'L 24 900',
].join(' ')

const SECTIONS = [
  { id: 'home',       frac: 0.00, labelKey: 'home' },
  { id: 'about',      frac: 0.19, labelKey: 'about' },
  { id: 'projects',   frac: 0.37, labelKey: 'projects' },
  { id: 'skills',     frac: 0.55, labelKey: 'skills' },
  { id: 'experience', frac: 0.73, labelKey: 'experience' },
  { id: 'contact',    frac: 0.91, labelKey: 'contact' },
]

type TrailLabels = Record<string, string>
interface Props { lang: Lang; labels: TrailLabels; gotoLabel: string }

export function ScrollTrail({ lang, labels, gotoLabel }: Props) {
  const isRTL = lang === 'fa'
  const prefersReduced = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false

  // SVG refs for direct DOM mutations (no React re-renders on scroll)
  const bgPathRef   = useRef<SVGPathElement>(null)
  const fgPathRef   = useRef<SVGPathElement>(null)
  const dotCoreRef  = useRef<SVGCircleElement>(null)
  const dotGlowRef  = useRef<SVGCircleElement>(null)
  const dotWhiteRef = useRef<SVGCircleElement>(null)

  const [totalLen, setTotalLen]     = useState(0)
  const [nodePoints, setNodePoints] = useState<Record<string, { x: number; y: number }>>({})
  const [active, setActive]         = useState('home')
  const [visited, setVisited]       = useState<Set<string>>(new Set(['home']))
  const [hovered, setHovered]       = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)
  const [micro, setMicro]           = useState<string | null>(null)
  const [flash, setFlash]           = useState(false)

  const trailContainerRef = useRef<HTMLDivElement>(null)

  /** Anchor tooltip to the actual hovered/focused hit circle (viewport coords). */
  const setTooltipFromTarget = useCallback((el: Element) => {
    const r = el.getBoundingClientRect()
    setTooltipPos({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
  }, [])

  const dashOffset = useMotionValue(9999)
  const { scrollYProgress } = useScroll()

  // Measure path on mount
  useEffect(() => {
    const path = fgPathRef.current
    if (!path) return
    const len = path.getTotalLength()
    setTotalLen(len)
    dashOffset.set(len)

    const pts: Record<string, { x: number; y: number }> = {}
    SECTIONS.forEach(({ id, frac }) => {
      const pt = path.getPointAtLength(frac * len)
      pts[id] = { x: pt.x, y: pt.y }
    })
    setNodePoints(pts)
  }, [])

  // Scroll → dash + dot position (direct DOM, no state)
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    if (!totalLen) return
    const offset = totalLen * (1 - p)
    dashOffset.set(offset)

    if (!prefersReduced && fgPathRef.current) {
      const pt = fgPathRef.current.getPointAtLength(p * totalLen)
      dotCoreRef.current?.setAttribute('cx', String(pt.x))
      dotCoreRef.current?.setAttribute('cy', String(pt.y))
      dotGlowRef.current?.setAttribute('cx', String(pt.x))
      dotGlowRef.current?.setAttribute('cy', String(pt.y))
      dotWhiteRef.current?.setAttribute('cx', String(pt.x))
      dotWhiteRef.current?.setAttribute('cy', String(pt.y))
    }

    if (p >= 0.98 && !flash) {
      setFlash(true)
      setTimeout(() => setFlash(false), 650)
    }
  })

  // Section detection
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const id = e.target.id
          setActive(id)
          setVisited(prev => new Set([...prev, id]))
          if (!prefersReduced && ['projects','skills','experience','contact'].includes(id)) {
            setMicro(id)
            setTimeout(() => setMicro(null), 1400)
          }
        }
      }),
      { threshold: 0.35 }
    )
    SECTIONS.forEach(({ id }) => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [prefersReduced])

  const scrollTo = (id: string) => scrollToSection(id)

  // Don't render until path is measured
  const ready = totalLen > 0

  return (
    <>
      {/* ── Desktop full trail ─────────────────────────────────────── */}
      <div
        ref={trailContainerRef}
        className="fixed top-0 z-40 hidden md:block pointer-events-none"
        style={{ [isRTL ? 'left' : 'right']: '28px', height: '100vh', width: '48px' }}
      >
        <svg
          viewBox="0 0 48 900"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-full"
          style={{ overflow: 'visible' }}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="trailGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10B981" />
              <stop offset="50%"  stopColor="#14B8A6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
            <radialGradient id="dotGlow">
              <stop offset="0%"   stopColor="#2DD4BF" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2DD4BF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Inactive background path */}
          <path
            ref={bgPathRef}
            d={PATH_D} fill="none" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round"
            stroke={flash ? 'rgba(94,234,212,0.45)' : 'rgba(94,234,212,0.12)'}
            style={{ transition: 'stroke 0.2s ease' }}
          />

          {/* Active filled path */}
          <motion.path
            ref={fgPathRef}
            d={PATH_D} fill="none" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            stroke="url(#trailGrad)"
            strokeDasharray={totalLen || 9999}
            style={{ strokeDashoffset: dashOffset, opacity: flash ? 0.95 : 0.78 }}
          />

          {/* Section nodes */}
          {ready && SECTIONS.map(({ id, labelKey }) => {
            const pt = nodePoints[id]
            if (!pt) return null
            const isActive  = active === id
            const isVisited = visited.has(id)
            const isContact = id === 'contact'
            const r = isContact ? 5.5 : 3.5
            const rActive = isContact ? 6.5 : 5

            return (
              <g key={id}>
                {/* Glow ring for active */}
                {isActive && !prefersReduced && (
                  <motion.circle
                    cx={pt.x} cy={pt.y}
                    animate={{ r: [rActive + 3, rActive + 6, rActive + 3], opacity: [0.2, 0.08, 0.2] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    fill="rgba(20,184,166,0.2)"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Visual node */}
                <motion.circle
                  cx={pt.x} cy={pt.y}
                  animate={isActive && !prefersReduced
                    ? { r: [rActive, rActive + 1.2, rActive], opacity: [1, 0.8, 1] }
                    : { r, opacity: 1 }}
                  transition={isActive ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
                  fill={isActive ? '#14B8A6' : isVisited ? '#10B981' : 'transparent'}
                  stroke={isActive ? '#06B6D4' : isVisited ? '#059669' : 'rgba(94,234,212,0.4)'}
                  strokeWidth={isContact ? 2 : 1.5}
                  style={{ pointerEvents: 'none' }}
                />

                {/* Hit area — interactive */}
                <circle
                  cx={pt.x} cy={pt.y} r={14}
                  fill="transparent"
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                  tabIndex={0}
                  role="button"
                  aria-label={`${gotoLabel} ${labels[labelKey]}`}
                  onClick={() => scrollTo(id)}
                  onMouseEnter={(e) => { setHovered(id); setTooltipFromTarget(e.currentTarget) }}
                  onMouseLeave={() => { setHovered(null); setTooltipPos(null) }}
                  onFocus={(e) => { setHovered(id); setTooltipFromTarget(e.currentTarget) }}
                  onBlur={() => { setHovered(null); setTooltipPos(null) }}
                  onKeyDown={e => e.key === 'Enter' && scrollTo(id)}
                />
              </g>
            )
          })}

          {/* Moving energy dot */}
          {ready && !prefersReduced && (
            <>
              <circle ref={dotGlowRef}  cx={24} cy={15} r={9}   fill="url(#dotGlow)" />
              <circle ref={dotCoreRef}  cx={24} cy={15} r={4}   fill="#2DD4BF"
                style={{ filter: 'drop-shadow(0 0 3px rgba(45,212,191,0.55))' }} />
              <circle ref={dotWhiteRef} cx={24} cy={15} r={1.8} fill="white" opacity={0.85} />
            </>
          )}

          {/* Micro: Projects — pink circuit sparks */}
          <AnimatePresence>
            {micro === 'projects' && nodePoints['projects'] && (
              <>
                {[0, 1].map(i => (
                  <motion.line key={i}
                    x1={nodePoints['projects'].x} y1={nodePoints['projects'].y}
                    x2={nodePoints['projects'].x + (i === 0 ? 13 : 9)}
                    y2={nodePoints['projects'].y + (i === 0 ? 0 : -9)}
                    stroke="#FF5CA8" strokeWidth="1" strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0.7 }}
                    animate={{ pathLength: 1, opacity: 0 }}
                    exit={{}}
                    transition={{ duration: 0.75 + i * 0.15, ease: 'easeOut', delay: i * 0.1 }}
                  />
                ))}
              </>
            )}

            {/* Micro: Skills — tiny turquoise particles */}
            {micro === 'skills' && nodePoints['skills'] && (
              <>
                {[-1, 0, 1].map(i => (
                  <motion.circle key={i}
                    cx={nodePoints['skills'].x} cy={nodePoints['skills'].y}
                    r={2} fill="#06B6D4"
                    initial={{ opacity: 0.8, cx: nodePoints['skills'].x, cy: nodePoints['skills'].y }}
                    animate={{ opacity: 0, cx: nodePoints['skills'].x + i * 10, cy: nodePoints['skills'].y - 10 }}
                    exit={{}}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: Math.abs(i) * 0.1 }}
                  />
                ))}
              </>
            )}

            {/* Micro: Experience — brief bright segment (line overlay) */}
            {micro === 'experience' && nodePoints['experience'] && nodePoints['skills'] && (
              <motion.line
                x1={nodePoints['skills'].x} y1={nodePoints['skills'].y}
                x2={nodePoints['experience'].x} y2={nodePoints['experience'].y}
                stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round"
                initial={{ opacity: 0.7 }} animate={{ opacity: 0 }}
                exit={{}}
                transition={{ duration: 1.0, ease: 'easeInOut' }}
              />
            )}

            {/* Micro: Contact — orange ripple */}
            {micro === 'contact' && nodePoints['contact'] && (
              <motion.circle
                cx={nodePoints['contact'].x} cy={nodePoints['contact'].y}
                fill="none" stroke="#FF8A4C" strokeWidth="1"
                initial={{ r: 6, opacity: 0.55 }}
                animate={{ r: 22, opacity: 0 }}
                exit={{}}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            )}
          </AnimatePresence>
        </svg>

        {/* Tooltips rendered via portal — see bottom of component */}
      </div>

      {/* ── Mobile simplified progress rail ────────────────────────── */}
      <div
        className="fixed top-0 z-40 md:hidden pointer-events-none"
        style={{ [isRTL ? 'left' : 'right']: '4px', height: '100vh', width: '12px' }}
      >
        <div className="relative w-1.5 mx-auto h-full rounded-full" style={{ background: 'rgba(94,234,212,0.1)' }}>
          <motion.div
            className="absolute top-0 w-full rounded-full"
            style={{
              background: 'linear-gradient(to bottom, #10B981, #14B8A6, #06B6D4)',
              height: ready ? undefined : '0%',
              scaleY: scrollYProgress,
              transformOrigin: 'top',
            }}
          />
          {/* Mobile section dots */}
          {ready && SECTIONS.map(({ id, frac }) => {
            const isAct = active === id
            const isVis = visited.has(id)
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                aria-label={`${gotoLabel} ${labels[id]}`}
                style={{
                  position: 'absolute',
                  top: `${frac * 100}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: isAct ? '10px' : '6px',
                  height: isAct ? '10px' : '6px',
                  borderRadius: '50%',
                  background: isAct ? '#14B8A6' : isVis ? '#059669' : 'rgba(94,234,212,0.3)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  pointerEvents: 'all',
                  transition: 'all 0.3s ease',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* ── Tooltip portal — anchored 12–18px beside the hovered dot ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {hovered && tooltipPos && (() => {
            const GAP = 14
            const EDGE = 6
            const TOOLTIP_H = 34
            const vw = window.innerWidth
            const vh = window.innerHeight

            // Vertically center on the dot, keep inside viewport
            const y = Math.max(TOOLTIP_H / 2 + EDGE, Math.min(vh - TOOLTIP_H / 2 - EDGE, tooltipPos.y))

            // LTR: tooltip sits to the LEFT of the dot (right edge of tooltip = dotX - GAP)
            // RTL: tooltip sits to the RIGHT of the dot (left edge of tooltip = dotX + GAP)
            const openLeft = !isRTL
            let anchorX = openLeft ? tooltipPos.x - GAP : tooltipPos.x + GAP
            anchorX = Math.max(EDGE, Math.min(vw - EDGE, anchorX))

            const tipStyle: CSSProperties = {
              background: 'var(--card)',
              borderColor: 'rgba(94,234,212,0.25)',
              color: 'var(--text)',
              fontFamily: lang === 'fa' ? 'Vazirmatn, sans-serif' : 'Inter, sans-serif',
              direction: lang === 'fa' ? 'rtl' : 'ltr',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }

            return (
              <div
                key={`anchor-${hovered}`}
                className="pointer-events-none fixed z-[9999]"
                style={{
                  top: y,
                  left: anchorX,
                  transform: openLeft ? 'translate(-100%, -50%)' : 'translateY(-50%)',
                }}
              >
                {/*
                  Force LTR flex order so document.dir=rtl does NOT reverse
                  arrow/box placement. Tooltip text keeps its own direction.
                */}
                <motion.div
                  key={hovered}
                  dir="ltr"
                  initial={{ opacity: 0, x: openLeft ? 6 : -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: openLeft ? 6 : -6 }}
                  transition={{ duration: 0.14, ease: 'easeOut' }}
                  className="flex items-center"
                >
                  {openLeft ? (
                    <>
                      {/* LTR: circuit on right → [label] ▶ ● */}
                      <div className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border backdrop-blur-sm" style={tipStyle}>
                        {labels[hovered]}
                      </div>
                      <span
                        aria-hidden="true"
                        className="w-0 h-0 shrink-0 self-center"
                        style={{
                          marginLeft: '-1px',
                          borderTop: '5px solid transparent',
                          borderBottom: '5px solid transparent',
                          borderLeft: '6px solid color-mix(in srgb, var(--card) 92%, #14B8A6)',
                          filter: 'drop-shadow(1px 0 0 rgba(94,234,212,0.25))',
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {/* RTL: circuit on left → ● ◀ [label] */}
                      <span
                        aria-hidden="true"
                        className="w-0 h-0 shrink-0 self-center"
                        style={{
                          marginRight: '-1px',
                          borderTop: '5px solid transparent',
                          borderBottom: '5px solid transparent',
                          borderRight: '6px solid color-mix(in srgb, var(--card) 92%, #14B8A6)',
                          filter: 'drop-shadow(-1px 0 0 rgba(94,234,212,0.25))',
                        }}
                      />
                      <div className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium border backdrop-blur-sm" style={tipStyle}>
                        {labels[hovered]}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>
            )
          })()}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
