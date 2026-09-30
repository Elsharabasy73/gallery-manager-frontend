import { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react'
import ar from './ar'
import en from './en'

const DICTS = { ar, en }
const STORAGE_KEY = 'lang'

function getInitialLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'ar') return stored
  } catch {}
  return 'ar' // default Arabic
}

// Simple {var} interpolation
function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`))
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang)

  const setLang = useCallback((next) => {
    const v = next === 'en' ? 'en' : 'ar'
    setLangState(v)
    try { localStorage.setItem(STORAGE_KEY, v) } catch {}
  }, [])

  const toggle = useCallback(() => {
    setLangState((prev) => {
      const v = prev === 'ar' ? 'en' : 'ar'
      try { localStorage.setItem(STORAGE_KEY, v) } catch {}
      return v
    })
  }, [])

  // Sync <html> lang/dir + font
  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr'
    try {
      document.documentElement.lang = lang
      document.documentElement.dir = dir
    } catch {}
  }, [lang])

  const t = useCallback((key, vars) => {
    const dict = DICTS[lang] || {}
    const fallback = DICTS.en || {}
    const raw = dict[key] ?? fallback[key] ?? key
    return interpolate(raw, vars)
  }, [lang])

  const locale = lang === 'ar' ? 'ar-EG' : 'en-EG'

  const formatPrice = useCallback((price) => {
    const n = Number(price)
    if (Number.isNaN(n)) return String(price ?? '')
    try {
      const num = new Intl.NumberFormat(locale).format(n)
      const cur = (DICTS[lang] || {})['common.currency'] || (lang === 'ar' ? 'ج.م' : 'EGP')
      return `${num} ${cur}`
    } catch {
      return `${n.toLocaleString()} ${lang === 'ar' ? 'ج.م' : 'EGP'}`
    }
  }, [lang, locale])

  const formatNumber = useCallback((n) => {
    const num = Number(n)
    if (Number.isNaN(num)) return String(n ?? '')
    try { return new Intl.NumberFormat(locale).format(num) } catch { return String(num) }
  }, [locale])

  const formatDate = useCallback((d) => {
    if (!d) return t('orders.na')
    try {
      const date = d instanceof Date ? d : new Date(d)
      return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short', day: 'numeric' }).format(date)
    } catch { return String(d) }
  }, [locale, t])

  // Category label: prefer arabicName in AR mode, keep backend data as-is
  const categoryLabel = useCallback((c) => {
    if (!c) return ''
    if (typeof c === 'string') return c
    if (lang === 'ar') return c.arabicName || c.name || ''
    return c.name || c.arabicName || ''
  }, [lang])

  const value = useMemo(() => ({
    lang, setLang, toggle,
    t, locale,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    isRTL: lang === 'ar',
    formatPrice, formatNumber, formatDate,
    categoryLabel,
  }), [lang, setLang, toggle, t, locale, formatPrice, formatNumber, formatDate, categoryLabel])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
