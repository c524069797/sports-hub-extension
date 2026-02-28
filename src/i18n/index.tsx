import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { zhTranslations } from './zh'
import { enTranslations } from './en'
import { NBA_PLAYER_NAMES_CN, FOOTBALL_PLAYER_NAMES_CN } from './player-names'
import type { SportType } from '../types'

export type Locale = 'zh' | 'en'

export type Translations = typeof zhTranslations

const STORAGE_KEY = 'sports-hub-locale'

interface I18nContextValue {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')

  // 从 chrome.storage 加载语言设置
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([STORAGE_KEY], (result: { [key: string]: unknown }) => {
        const saved = result[STORAGE_KEY] as Locale | undefined
        if (saved && (saved === 'zh' || saved === 'en')) {
          setLocaleState(saved)
        }
      })
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: newLocale })
    }
  }

  const toggleLocale = () => {
    const newLocale = locale === 'zh' ? 'en' : 'zh'
    setLocale(newLocale)
  }

  const translations = locale === 'zh' ? zhTranslations : enTranslations

  return (
    <I18nContext.Provider value={{ locale, t: translations, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }

  const { locale } = context

  // 翻译球员/选手名称
  const translatePlayerName = useCallback((name: string, sportType: SportType): string => {
    if (locale !== 'zh') return name

    if (sportType === 'nba') {
      return NBA_PLAYER_NAMES_CN[name] ?? name
    }
    if (sportType === 'football') {
      return FOOTBALL_PLAYER_NAMES_CN[name] ?? name
    }
    // 电竞选手通常用 ID，不需要翻译
    return name
  }, [locale])

  return { ...context, translatePlayerName }
}

// 日期格式化 hook
export function useLocaleDateFormat() {
  const { locale } = useI18n()

  return (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date

    if (locale === 'zh') {
      return d.toLocaleString('zh-CN', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
