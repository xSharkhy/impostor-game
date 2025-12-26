import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button, Card, CardContent, CardHeader, CardTitle, Confetti, EmojiBurst } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import { explosiveReveal, impostorReveal, fadeInUp, springBouncy, staggerContainer, listItem } from '@/lib/motion'

export function GameOverPanel() {
  const { t } = useTranslation()
  const { winner, revealedImpostorIds, word } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { leaveRoom, playAgain } = useSocket()
  const [showConfetti, setShowConfetti] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const impostors = room?.players.filter((p) => revealedImpostorIds.includes(p.id)) || []
  const isAdmin = room?.adminId === user?.id
  const wasImpostor = user ? revealedImpostorIds.includes(user.id) : false
  const crewWon = winner === 'crew'
  const multipleImpostors = revealedImpostorIds.length > 1

  // Trigger celebrations
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowConfetti(true)
      setShowEmoji(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  if (!room || !user) return null

  // Determine if current player won
  const playerWon = (crewWon && !wasImpostor) || (!crewWon && wasImpostor)

  return (
    <div className="relative mx-auto w-full max-w-md space-y-6">
      {/* Confetti for winners */}
      {playerWon && (
        <Confetti
          isActive={showConfetti}
          particleCount={100}
          colors={crewWon
            ? ['#22ff88', '#a855f7', '#c084fc']
            : ['#ff2d6a', '#a855f7', '#facc15']
          }
        />
      )}

      {/* Emoji burst */}
      <EmojiBurst
        isActive={showEmoji}
        emoji={crewWon ? '🎉' : '😈'}
        count={8}
      />

      {/* Victory/Defeat Header */}
      <div className="text-center">
        <motion.div
          className="mb-4 text-7xl"
          aria-hidden="true"
          variants={explosiveReveal}
          initial="initial"
          animate="animate"
        >
          {playerWon ? '🏆' : '💀'}
        </motion.div>
        <motion.h2
          className="text-5xl font-black"
          initial={{ opacity: 0, scale: 0.5, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
        >
          <span
            className={`bg-gradient-to-r bg-clip-text text-transparent ${
              crewWon
                ? 'from-neon-green via-accent to-neon-green'
                : 'from-neon-pink via-accent to-neon-pink'
            }`}
            style={{
              backgroundSize: '200% auto',
              animation: 'gradient-shift 3s ease infinite',
            }}
          >
            {playerWon ? t('gameOver.victory') : t('gameOver.defeat')}
          </span>
        </motion.h2>
        <motion.p
          className={`mt-3 text-xl font-medium ${
            crewWon ? 'text-neon-green' : 'text-neon-pink'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {crewWon ? t('gameOver.crewWon') : t('gameOver.impostorWon')}
        </motion.p>
      </div>

      {/* Impostor reveal */}
      <motion.div
        variants={impostorReveal}
        initial="initial"
        animate="animate"
      >
        <Card variant={wasImpostor ? 'glow-pink' : 'glow'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-normal text-text-secondary">
              {multipleImpostors ? t('gameOver.impostorsWere') : t('gameOver.impostorWas')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className={`flex flex-wrap items-center justify-center gap-4 ${multipleImpostors ? 'gap-y-6' : ''}`}>
              {impostors.map((impostor, index) => {
                const isMe = impostor.id === user?.id
                return (
                  <motion.div
                    key={impostor.id}
                    className="flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    <motion.div
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink text-2xl font-bold text-white"
                      style={{
                        boxShadow: '0 0 20px rgba(255, 45, 106, 0.5)',
                      }}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.8 + index * 0.15, type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      {impostor.displayName.charAt(0).toUpperCase()}
                    </motion.div>
                    <motion.p
                      className="text-xl font-bold text-neon-pink"
                      style={{
                        textShadow: '0 0 20px rgba(255, 45, 106, 0.5)',
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.15, ...springBouncy }}
                    >
                      {impostor.displayName}
                      {isMe && (
                        <span className="ml-2 text-base text-text-secondary">{t('common.you')}</span>
                      )}
                    </motion.p>
                  </motion.div>
                )
              })}
              {impostors.length === 0 && (
                <motion.p
                  className="text-xl font-bold text-text-secondary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  {t('common.unknown')}
                </motion.p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Word reveal */}
      {word && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          transition={{ delay: 1.2 }}
        >
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-sm font-normal text-text-secondary">
                {t('gameOver.wordWas')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <motion.p
                className="text-center text-3xl font-bold text-neon-green"
                style={{
                  textShadow: '0 0 20px rgba(34, 255, 136, 0.5)',
                }}
                initial={{ filter: 'blur(10px)', opacity: 0 }}
                animate={{ filter: 'blur(0px)', opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
              >
                {word}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        className="space-y-3 pt-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        custom={{ delay: 1.5 }}
      >
        {isAdmin && (
          <motion.div variants={listItem}>
            <Button
              variant="neon"
              className="w-full text-base"
              onClick={playAgain}
            >
              🔄 {t('gameOver.playAgain')}
            </Button>
          </motion.div>
        )}
        <motion.div variants={listItem}>
          <Button
            variant="outline"
            className="w-full"
            onClick={leaveRoom}
          >
            👋 {t('gameOver.backToStart')}
          </Button>
        </motion.div>
      </motion.div>

      {/* Waiting message for non-admin */}
      {!isAdmin && (
        <motion.div
          className="flex items-center justify-center gap-2 text-sm text-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
        >
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          {t('gameOver.waitingNewGame')}
        </motion.div>
      )}
    </div>
  )
}
