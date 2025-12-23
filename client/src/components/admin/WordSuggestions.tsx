import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  CardContent,
  Skeleton,
  Input,
  Label,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/lib/i18n'

interface WordSuggestion {
  id: string
  word: string
  lang: SupportedLanguage
  categoryId: string
  categoryName: string
  suggestedBy: string
  createdAt: string
}

type Translations = Record<SupportedLanguage, string>

const API_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

const LANGUAGE_ORDER: SupportedLanguage[] = ['es', 'en', 'ca', 'eu', 'gl']

const createEmptyTranslations = (): Translations => ({
  es: '',
  en: '',
  ca: '',
  eu: '',
  gl: '',
})

export function WordSuggestions() {
  const { t } = useTranslation()
  const [suggestions, setSuggestions] = useState<WordSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSuggestion, setSelectedSuggestion] = useState<WordSuggestion | null>(null)
  const [translations, setTranslations] = useState<Translations>(createEmptyTranslations())
  const [isApproving, setIsApproving] = useState(false)

  const fetchSuggestions = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError(t('admin.notAuthenticated'))
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/admin/suggestions`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 403) {
          setError(t('admin.noPermission'))
        } else {
          setError(t('admin.errorLoading'))
        }
        setLoading(false)
        return
      }

      const data = await response.json()
      setSuggestions(data)
      setLoading(false)
    } catch {
      setError(t('connection.error'))
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const openTranslationModal = (suggestion: WordSuggestion) => {
    const newTranslations = createEmptyTranslations()
    // Pre-fill the original language with the suggested word
    newTranslations[suggestion.lang] = suggestion.word
    setTranslations(newTranslations)
    setSelectedSuggestion(suggestion)
  }

  const closeTranslationModal = () => {
    setSelectedSuggestion(null)
    setTranslations(createEmptyTranslations())
  }

  const handleApproveWithTranslations = async () => {
    if (!selectedSuggestion) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    // Validate all translations are filled
    const hasEmptyTranslation = Object.values(translations).some((v) => !v.trim())
    if (hasEmptyTranslation) return

    setIsApproving(true)

    const response = await fetch(`${API_URL}/api/admin/words/${selectedSuggestion.id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ translations }),
    })

    if (response.ok) {
      setSuggestions((prev) => prev.filter((s) => s.id !== selectedSuggestion.id))
      closeTranslationModal()
    }

    setIsApproving(false)
  }

  const handleReject = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const response = await fetch(`${API_URL}/api/admin/words/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    })

    if (response.ok) {
      setSuggestions((prev) => prev.filter((s) => s.id !== id))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-8 w-56" />
          <Skeleton className="mx-auto mt-2 h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center justify-between py-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-20 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t('admin.suggestions')}</h1>
        </div>
        <Card variant="glass">
          <CardContent className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-danger/10 text-2xl" aria-hidden="true">
              ⚠️
            </div>
            <p className="font-medium text-danger">{error}</p>
            <p className="mt-1 text-sm text-text-tertiary">
              {t('admin.errorLoading')}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setError(null)
                setLoading(true)
                fetchSuggestions()
              }}
            >
              {t('common.retry')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('admin.suggestions')}</h1>
        <p className="text-sm text-text-tertiary">
          {t('admin.pendingCount', { count: suggestions.length })}
        </p>
      </div>

      {suggestions.length === 0 ? (
        <Card variant="glass">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-elevated text-4xl" aria-hidden="true">
              ✨
            </div>
            <p className="font-medium text-text-primary">
              {t('admin.allCaughtUp')}
            </p>
            <p className="mt-1 text-sm text-text-tertiary">
              {t('admin.noPending')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {suggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold">{suggestion.word}</p>
                  <p className="text-sm text-text-tertiary">
                    {suggestion.categoryName}
                  </p>
                  <p className="text-xs text-text-tertiary">
                    {new Date(suggestion.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => openTranslationModal(suggestion)}
                  >
                    {t('admin.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(suggestion.id)}
                  >
                    {t('admin.reject')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Button variant="outline" className="w-full" onClick={fetchSuggestions}>
        {t('admin.refresh')}
      </Button>

      {/* Translation Modal */}
      <AlertDialog open={!!selectedSuggestion} onOpenChange={(open) => !open && closeTranslationModal()}>
        <AlertDialogContent className="max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.translateWord')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.translateDescription', {
                word: selectedSuggestion?.word,
                category: selectedSuggestion?.categoryName
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {LANGUAGE_ORDER.map((langCode) => {
              const langInfo = SUPPORTED_LANGUAGES[langCode]
              const isOriginal = selectedSuggestion?.lang === langCode
              return (
                <div key={langCode} className="space-y-1.5">
                  <Label className="flex items-center gap-2">
                    <span>{langInfo.flag}</span>
                    <span>{langInfo.name}</span>
                    {isOriginal && (
                      <span className="text-xs text-accent">({t('admin.original')})</span>
                    )}
                  </Label>
                  <Input
                    value={translations[langCode]}
                    onChange={(e) => setTranslations((prev) => ({ ...prev, [langCode]: e.target.value }))}
                    placeholder={langInfo.name}
                  />
                </div>
              )
            })}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <Button
              onClick={handleApproveWithTranslations}
              disabled={isApproving || Object.values(translations).some((v) => !v.trim())}
              isLoading={isApproving}
            >
              {t('admin.approveAll')}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
