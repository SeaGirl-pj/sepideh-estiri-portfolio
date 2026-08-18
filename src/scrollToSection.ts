/** Shared section scroll — used by header nav and right-side circuit dots. */
export function scrollToSection(id: string) {
  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }

  const el = document.getElementById(id)
  if (!el) return

  const header = document.querySelector('.site-header') as HTMLElement | null
  const headerH = header?.getBoundingClientRect().height ?? 64
  const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0

  // Land so section content (after padding) sits just below the sticky header
  const gap = 12
  const y = el.getBoundingClientRect().top + window.scrollY + padTop - headerH - gap

  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
}
