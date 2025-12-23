import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui'
import { CATEGORIES, type CategoryId } from '@/lib/categories'
import { getCurrentLanguage } from '@/lib/i18n'
import { useSocket } from '@/hooks'

interface SuggestWordProps {
  onClose?: () => void
}

export function SuggestWord({ onClose }: SuggestWordProps) {
  const { t } = useTranslation()
  const [word, setWord] = useState('')
  const [categoryId, setCategoryId] = useState<CategoryId>(CATEGORIES[0].id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const { socket } = useSocket()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!word.trim() || !categoryId || !socket) return

    setIsSubmitting(true)
    socket.emit('word:suggest', { word: word.trim(), categoryId, lang: getCurrentLanguage() })

    // Listen for response
    socket.once('word:suggested', () => {
      setSuccess(true)
      setWord('')
      setIsSubmitting(false)
      setTimeout(() => setSuccess(false), 3000)
    })

    socket.once('error', () => {
      setIsSubmitting(false)
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('suggest.title')}</span>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} aria-label={t('common.close')}>
              ✕
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('suggest.category')}</Label>
            <Select value={categoryId} onValueChange={(v) => setCategoryId(v as CategoryId)}>
              <SelectTrigger>
                <SelectValue placeholder={t('suggest.selectCategory')} />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {t(cat.translationKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('suggest.word')}</Label>
            <Input
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={t('suggest.wordPlaceholder')}
              maxLength={50}
            />
          </div>

          {success && (
            <p className="text-sm text-success">
              {t('suggest.success')}
            </p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!word.trim() || !categoryId || isSubmitting}
          >
            {isSubmitting ? t('suggest.submitting') : t('suggest.submit')}
          </Button>

          <p className="text-center text-xs text-text-tertiary">
            {t('suggest.reviewNote')}
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
