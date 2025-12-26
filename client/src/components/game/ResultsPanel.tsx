import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button, Card, CardContent, Confetti, EmojiBurst } from '@/components/ui'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import { fadeInUp, popIn, springBouncy, victoryReveal } from '@/lib/motion'

interface ResultsPanelProps {
  onContinue: () => void
}

const AUTO_CONTINUE_SECONDS = 5

export function ResultsPanel({ onContinue }: ResultsPanelProps) {
  const { t } = useTranslation()
  const { lastEliminated, wasImpostor, impostorCount } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const [showEffects, setShowEffects] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_CONTINUE_SECONDS)

  // Store callback in ref to avoid effect dependency issues
  const onContinueRef = useRef(onContinue)
  onContinueRef.current = onContinue

  // Trigger effects with a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEffects(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  // Auto-continue countdown when no one was eliminated
  useEffect(() => {
    if (!lastEliminated) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [lastEliminated])

  // Separate effect to call onContinue when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && !lastEliminated) {
      onContinueRef.current()
    }
  }, [countdown, lastEliminated])

  if (!room || !user) return null

  const eliminatedPlayer = lastEliminated
    ? room.players.find((p) => p.id === lastEliminated)
    : null
  const isAdmin = room.adminId === user.id

  return (
    <div className="relative mx-auto w-full max-w-md space-y-6">
      {/* Confetti for catching impostor */}
      {wasImpostor && (
        <Confetti
          isActive={showEffects}
          particleCount={80}
          colors={['#22c55e', '#a855f7', '#facc15']}
        />
      )}

      {/* Emoji burst */}
      {eliminatedPlayer && (
        <EmojiBurst
          isActive={showEffects}
          emoji={wasImpostor ? '🎯' : '💀'}
          count={8}
        />
      )}

      {/* Header */}
      <motion.div
        className="text-center"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={springBouncy}
      >
        <h2 className="text-3xl font-bold">{t('results.title')}</h2>
      </motion.div>

      {/* Result Card */}
      <motion.div
        variants={victoryReveal}
        initial="initial"
        animate="animate"
      >
        <Card
          variant={wasImpostor ? 'glow' : eliminatedPlayer ? 'glow-pink' : 'glass'}
          className="overflow-hidden"
        >
          <CardContent className="py-10 text-center">
            {eliminatedPlayer ? (
              <div className="space-y-6">
                {/* Eliminated player avatar */}
                <motion.div
                  className="mx-auto"
                  variants={popIn}
                  initial="initial"
                  animate="animate"
                >
                  <div
                    className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold ${
                      wasImpostor
                        ? 'bg-neon-pink text-white'
                        : 'bg-bg-elevated text-text-primary'
                    }`}
                    style={wasImpostor ? {
                      boxShadow: '0 0 30px rgba(255, 45, 106, 0.5), 0 0 60px rgba(255, 45, 106, 0.3)',
                    } : undefined}
                  >
                    {eliminatedPlayer.displayName.charAt(0).toUpperCase()}
                  </div>
                </motion.div>

                {/* Player name */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, ...springBouncy }}
                >
                  <p className="text-lg text-text-secondary">
                    <span className="font-semibold text-text-primary">
                      {eliminatedPlayer.displayName}
                    </span>{' '}
                    {t('results.eliminated')}
                  </p>
                </motion.div>

                {/* Result */}
                <motion.div
                  className="pt-2"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <p
                    className={`text-4xl font-black ${
                      wasImpostor ? 'text-success' : 'text-danger'
                    }`}
                    style={{
                      textShadow: wasImpostor
                        ? '0 0 30px rgba(34, 197, 94, 0.6)'
                        : '0 0 30px rgba(239, 68, 68, 0.6)',
                    }}
                  >
                    {wasImpostor ? t('results.wasImpostor') : t('results.wasInnocent')}
                  </p>
                  {wasImpostor && impostorCount > 1 && (
                    <motion.p
                      className="mt-3 text-lg text-success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {t('results.keepHunting')}
                    </motion.p>
                  )}
                  {wasImpostor && impostorCount <= 1 && (
                    <motion.p
                      className="mt-3 text-lg text-success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {t('results.goodJob')}
                    </motion.p>
                  )}
                  {!wasImpostor && (
                    <motion.p
                      className="mt-3 text-sm text-text-secondary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.8 }}
                    >
                      {impostorCount > 1
                        ? t('results.impostorsRemain', { count: impostorCount })
                        : t('results.impostorRemains')}
                    </motion.p>
                  )}
                </motion.div>
              </div>
            ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bg-elevated text-5xl" aria-hidden="true">
                🤷
              </div>
              <p className="text-2xl font-bold text-text-primary">
                {t('results.noElimination')}
              </p>
              <p className="text-sm text-text-tertiary">
                {t('results.notEnoughVotes')}
              </p>

              {/* Countdown timer */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="relative h-16 w-16">
                  {/* Background circle */}
                  <svg className="h-16 w-16 -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--color-bg-elevated)"
                      strokeWidth="4"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="var(--color-accent)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={176}
                      strokeDashoffset={176 * (1 - countdown / AUTO_CONTINUE_SECONDS)}
                      style={{
                        filter: 'drop-shadow(0 0 8px rgba(168, 85, 247, 0.5))',
                        transition: 'stroke-dashoffset 1s linear',
                      }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-accent">
                    {countdown}
                  </span>
                </div>
                <p className="text-xs text-text-tertiary">
                  {t('results.continuing')}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      </motion.div>

      {/* Continue button - show for admin always, or when someone was eliminated */}
      {(eliminatedPlayer || isAdmin) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, ...springBouncy }}
        >
          <Button variant="neon" className="w-full text-base" onClick={onContinue}>
            {eliminatedPlayer ? t('voting.continue') : t('results.skip')}
          </Button>
        </motion.div>
      )}
    </div>
  )
}
