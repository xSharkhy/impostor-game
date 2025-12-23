import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Button, Card, CardContent, Input } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import { SUPPORTED_LANGUAGES } from '@/lib/i18n'

export function WordCollectionPanel() {
  const { t } = useTranslation()
  const { collecting } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { submitWord, forceStartRoulette, playAgain } = useSocket()

  const [word, setWord] = useState('')
  const [timeLeft, setTimeLeft] = useState(collecting?.timeLimit ?? 30)
  const [timerExpired, setTimerExpired] = useState(false)
  const hasTriedAutoStart = useRef(false)

  const isAdmin = room?.adminId === user?.id
  const hasSubmitted = collecting?.hasSubmittedWord ?? false
  const wordCount = collecting?.wordCount ?? 0
  const minWords = collecting?.minWords ?? 0
  const playerCount = collecting?.playerCount ?? 0
  const hasEnoughWords = wordCount >= minWords
  const canForceStart = isAdmin && hasEnoughWords
  const wordsNeeded = Math.max(0, minWords - wordCount)

  // Timer countdown
  useEffect(() => {
    if (!collecting) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setTimerExpired(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [collecting])

  // Handle timer expiration - only admin triggers start
  useEffect(() => {
    if (!timerExpired || hasTriedAutoStart.current) return
    hasTriedAutoStart.current = true

    if (hasEnoughWords && isAdmin) {
      // Admin auto-starts when timer expires with enough words
      forceStartRoulette()
    } else if (!hasEnoughWords) {
      // Not enough words - show error
      toast.error(t('collecting.timerExpiredNoWords'))
    }
  }, [timerExpired, hasEnoughWords, isAdmin, forceStartRoulette, t])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (word.trim() && !hasSubmitted) {
      submitWord(word.trim())
      setWord('')
    }
  }

  if (!collecting || !room) return null

  const languageName = SUPPORTED_LANGUAGES[room.language]?.name ?? room.language

  // Show failure state when timer expired without enough words
  if (timerExpired && !hasEnoughWords) {
    return (
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="text-center">
          <motion.h2
            className="text-3xl font-bold text-danger"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {t('collecting.timerExpired')}
          </motion.h2>
        </div>

        <Card variant="glass">
          <CardContent className="space-y-4 pt-6 text-center">
            <p className="text-text-secondary">
              {t('collecting.notEnoughWords', { count: wordCount, min: minWords })}
            </p>
            {!isAdmin && (
              <p className="text-sm text-text-tertiary">
                {t('collecting.waitingAdminAction')}
              </p>
            )}
          </CardContent>
        </Card>

        {isAdmin && (
          <Button variant="secondary" className="w-full" onClick={playAgain}>
            {t('collecting.backToLobby')}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          className="text-3xl font-bold text-neon-yellow"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {t('collecting.title')}
        </motion.h2>
      </div>

      {/* Timer */}
      <div className="flex justify-center">
        <motion.div
          className={`flex h-24 w-24 items-center justify-center rounded-full border-4 ${
            timeLeft <= 10 ? 'border-danger' : 'border-accent'
          }`}
          animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: timeLeft <= 10 ? Infinity : 0 }}
        >
          <span
            className={`font-mono text-4xl font-bold ${
              timeLeft <= 10 ? 'text-danger' : 'text-accent'
            }`}
          >
            {timeLeft}
          </span>
        </motion.div>
      </div>

      {/* Word input */}
      <Card variant="glass">
        <CardContent className="space-y-4 pt-6">
          {hasSubmitted ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-success/10 px-4 py-3 text-success">
              <span className="text-xl">&#10003;</span>
              <span className="font-medium">{t('collecting.wordSent')}</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                placeholder={t('collecting.wordPlaceholder')}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                maxLength={30}
                autoFocus
              />
              <p className="text-center text-xs text-text-tertiary">
                {t('collecting.languageHint', { language: languageName })}
              </p>
              <Button
                type="submit"
                variant="neon"
                className="w-full"
                disabled={!word.trim()}
              >
                {t('collecting.submitWord')}
              </Button>
            </form>
          )}

          {/* Progress */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {t('collecting.wordsReceived', { count: wordCount, total: playerCount })}
              </span>
              {wordsNeeded > 0 && (
                <span className="text-warning">
                  {t('collecting.minWordsNeeded', { count: wordsNeeded })}
                </span>
              )}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-tertiary">
              <motion.div
                className="h-full bg-accent"
                initial={{ width: 0 }}
                animate={{ width: `${(wordCount / playerCount) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Admin force start */}
      {isAdmin && (
        <Button
          variant={canForceStart ? 'secondary' : 'ghost'}
          className="w-full"
          disabled={!canForceStart}
          onClick={forceStartRoulette}
        >
          {canForceStart
            ? t('collecting.startNow')
            : t('collecting.minWordsNeeded', { count: wordsNeeded })}
        </Button>
      )}
    </div>
  )
}
