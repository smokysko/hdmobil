import { createContext, useContext } from 'react'
import { sk } from './sk'
import { cs } from './cs'
import { pl } from './pl'

export type Language = 'sk' | 'cs' | 'pl'
export type Translations = typeof sk

export const translations: Record<Language, Translations> = { sk, cs, pl }

export const I18nContext = createContext<{
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}>({
  language: 'sk',
  setLanguage: () => {},
  t: sk,
})

export const useI18n = () => useContext(I18nContext)
