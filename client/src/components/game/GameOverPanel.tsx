import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button, Card, CardContent, CardHeader, CardTitle, Confetti, EmojiBurst } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import {
  fadeInUp,
  staggerContainer,
  victoryReveal,
  impostorReveal,
  wordReveal,
  springBouncy,
  tada,
  jelly,
} from '@/lib/motion'

export function GameOverPanel() {
  const { winner, revealedImpostorId, word } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { leaveRoom, playAgain } = useSocket()
  const [showConfetti, setShowConfetti] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)

  const impostor = room?.players.find((p) => p.id === revealedImpostorId)
  const isAdmin = room?.adminId === user?.id
  const wasImpostor = revealedImpostorId === user?.id
  const crewWon = winner === 'crew'

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
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      className="relative mx-auto w-full max-w-md space-y-6"
    >
      {/* Confetti for winners */}
      {playerWon && (
        <Confetti
          isActive={showConfetti}
          particleCount={100}
          colors={crewWon
            ? ['#00f0ff', '#22ff88', '#a855f7']
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
      <motion.div
        variants={victoryReveal}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: [0, 1.5, 1], rotate: [-180, 20, -10, 0] }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-4 text-7xl"
          variants={tada}
          whileHover="animate"
        >
          {playerWon ? '🏆' : '💀'}
        </motion.div>
        <motion.h2
          className="text-5xl font-black"
          initial={{ opacity: 0, y: 30, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, ...springBouncy }}
          variants={jelly}
          whileHover="animate"
        >
          <span
            className={`bg-gradient-to-r bg-clip-text text-transparent ${
              crewWon
                ? 'from-neon-cyan via-neon-green to-neon-cyan'
                : 'from-neon-pink via-neon-purple to-neon-pink'
            }`}
            style={{
              backgroundSize: '200% auto',
              animation: 'gradient-shift 3s ease infinite',
            }}
          >
            {playerWon ? '¡VICTORIA!' : '¡DERROTA!'}
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`mt-3 text-xl font-medium ${
            crewWon ? 'text-neon-cyan' : 'text-neon-pink'
          }`}
        >
          {crewWon ? '¡Los civiles han ganado!' : '¡El impostor ha ganado!'}
        </motion.p>
      </motion.div>

      {/* Impostor reveal */}
      <motion.div variants={fadeInUp}>
        <Card variant={wasImpostor ? 'glow-pink' : 'glow'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-normal text-text-secondary">
              El impostor era
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <motion.div
              variants={impostorReveal}
              initial="initial"
              animate="animate"
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink text-2xl font-bold text-white"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(255, 45, 106, 0.4)',
                    '0 0 40px rgba(255, 45, 106, 0.6)',
                    '0 0 20px rgba(255, 45, 106, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {impostor?.displayName.charAt(0).toUpperCase() || '?'}
              </motion.div>
              <motion.p
                className="text-2xl font-bold text-neon-pink"
                style={{
                  textShadow: '0 0 20px rgba(255, 45, 106, 0.5)',
                }}
              >
                {impostor?.displayName || 'Desconocido'}
                {wasImpostor && (
                  <span className="ml-2 text-lg text-text-secondary">(tú)</span>
                )}
              </motion.p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Word reveal */}
      {word && (
        <motion.div variants={wordReveal}>
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-sm font-normal text-text-secondary">
                La palabra era
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <motion.p
                className="text-center text-3xl font-bold text-neon-cyan"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, ...springBouncy }}
                style={{
                  textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                }}
              >
                {word}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={fadeInUp} className="space-y-3 pt-4">
        {isAdmin && (
          <motion.div
            whileHover={{ scale: 1.05, rotate: [-1, 1, -1, 0] }}
            whileTap={{ scale: 0.95 }}
            transition={springBouncy}
          >
            <Button
              variant="neon"
              className="w-full text-base"
              onClick={playAgain}
            >
              🔄 ¡Otra partida!
            </Button>
          </motion.div>
        )}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className="w-full"
            onClick={leaveRoom}
          >
            👋 Volver al inicio
          </Button>
        </motion.div>
      </motion.div>

      {/* Waiting message for non-admin */}
      {!isAdmin && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-2 text-sm text-text-tertiary"
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-neon-cyan"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Esperando al admin para nueva partida...
        </motion.div>
      )}
    </motion.div>
  )
}
