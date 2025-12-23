import { useTranslation } from 'react-i18next'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui'
import { SUPPORTED_LANGUAGES, type SupportedLanguage, changeLanguage } from '@/lib/i18n'

interface LanguageChangeDialogProps {
  open: boolean
  roomLanguage: SupportedLanguage
  onConfirm: () => void
  onCancel: () => void
}

export function LanguageChangeDialog({
  open,
  roomLanguage,
  onConfirm,
  onCancel,
}: LanguageChangeDialogProps) {
  const { t } = useTranslation()

  const languageInfo = SUPPORTED_LANGUAGES[roomLanguage]

  const handleConfirm = async () => {
    await changeLanguage(roomLanguage)
    onConfirm()
  }

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{languageInfo.flag}</span>
            {t('language.differentLanguage', { language: languageInfo.name })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('language.willChange')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {t('common.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            {t('language.joinAnyway')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
