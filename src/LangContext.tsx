import { createContext, useContext, useState, useEffect } from 'react'
import type { Lang } from './i18n'

interface LangContextType { lang: Lang; setLang: (l: Lang) => void }
const LangCtx = createContext<LangContextType>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    return (localStorage.getItem('lang') as Lang) || 'en'
  })

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l
    document.documentElement.dir = l === 'fa' ? 'rtl' : 'ltr'
  }

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
  }, [lang])

  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>
}

export const useLang = () => useContext(LangCtx)
