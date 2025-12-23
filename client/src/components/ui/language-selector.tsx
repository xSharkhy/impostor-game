import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select'
import { SUPPORTED_LANGUAGES, type SupportedLanguage, changeLanguage } from '@/lib/i18n'

interface LanguageSelectorProps {
  className?: string
  compact?: boolean
}

export function LanguageSelector({ className, compact = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation()

  const currentLang = (i18n.language?.split('-')[0] || 'es') as SupportedLanguage
  const validLang = SUPPORTED_LANGUAGES[currentLang] ? currentLang : 'es'

  const handleChange = (value: string) => {
    changeLanguage(value as SupportedLanguage)
  }

  return (
    <Select value={validLang} onValueChange={handleChange}>
      <SelectTrigger className={className} aria-label="Select language">
        <SelectValue>
          {compact ? (
            <span className="flex items-center gap-1.5">
              <span>{SUPPORTED_LANGUAGES[validLang].flag}</span>
              <span className="uppercase text-xs font-medium">{validLang}</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>{SUPPORTED_LANGUAGES[validLang].flag}</span>
              <span>{SUPPORTED_LANGUAGES[validLang].name}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, { name, flag }]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{flag}</span>
              <span>{name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
