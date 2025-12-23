import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translations
import es from '../locales/es.json'
import en from '../locales/en.json'
import ca from '../locales/ca.json'
import eu from '../locales/eu.json'
import gl from '../locales/gl.json'

export const SUPPORTED_LANGUAGES = {
  es: { name: 'Español', flag: '🇪🇸' },
  en: { name: 'English', flag: '🇬🇧' },
  ca: { name: 'Català', flag: '🏴' },
  eu: { name: 'Euskara', flag: '🏴' },
  gl: { name: 'Galego', flag: '🏴' },
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

export const DEFAULT_LANGUAGE: SupportedLanguage = 'es'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
      ca: { translation: ca },
      eu: { translation: eu },
      gl: { translation: gl },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
  })

export default i18n

// Helper to get current language
export function getCurrentLanguage(): SupportedLanguage {
  const lang = i18n.language?.split('-')[0] as SupportedLanguage
  return SUPPORTED_LANGUAGES[lang] ? lang : DEFAULT_LANGUAGE
}

// Helper to change language
export async function changeLanguage(lang: SupportedLanguage): Promise<void> {
  await i18n.changeLanguage(lang)
}
