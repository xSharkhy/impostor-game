import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button, Card, CardContent, Confetti, EmojiBurst } from '@/components/ui'
import { useGameStore, useRoomStore } from '@/stores'
import {
  fadeInUp,
  staggerContainer,
  bounceIn,
  springBouncy,
  shakeAnimation,
  tada,
  jelly,
} from '@/lib/motion'

interface ResultsPanelProps {
  onContinue: () => void
}

const AUTO_CONTINUE_SECONDS = 5

export function ResultsPanel({ onContinue }: ResultsPanelProps) {
  const { lastEliminated, wasImpostor } = useGameStore()
  const { room } = useRoomStore()
  const [showEffects, setShowEffects] = useState(false)
  const [countdown, setCountdown] = useState(AUTO_CONTINUE_SECONDS)

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
            onContinue()
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [lastEliminated, onContinue])

  if (!room) return null

  const eliminatedPlayer = lastEliminated
    ? room.players.find((p) => p.id === lastEliminated)
    : null

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      className="relative mx-auto w-full max-w-md space-y-6"
    >
      {/* Confetti for catching impostor */}
      {wasImpostor && (
        <Confetti
          isActive={showEffects}
          particleCount={80}
          colors={['#22c55e', '#00f0ff', '#facc15']}
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
      <motion.div variants={fadeInUp} className="text-center">
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={springBouncy}
        >
          Resultado
        </motion.h2>
      </motion.div>

      {/* Result Card */}
      <motion.div variants={bounceIn}>
        <Card
          variant={wasImpostor ? 'glow' : eliminatedPlayer ? 'glow-pink' : 'glass'}
          className="overflow-hidden"
        >
          <CardContent className="py-10 text-center">
            {eliminatedPlayer ? (
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="space-y-6"
              >
                {/* Eliminated player avatar */}
                <motion.div variants={bounceIn} className="mx-auto">
                  <motion.div
                    className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl font-bold ${
                      wasImpostor
                        ? 'bg-neon-pink text-white'
                        : 'bg-bg-elevated text-text-primary'
                    }`}
                    variants={wasImpostor ? tada : shakeAnimation}
                    animate="animate"
                    style={wasImpostor ? {
                      boxShadow: '0 0 30px rgba(255, 45, 106, 0.5), 0 0 60px rgba(255, 45, 106, 0.3)',
                    } : undefined}
                  >
                    {eliminatedPlayer.displayName.charAt(0).toUpperCase()}
                  </motion.div>
                </motion.div>

                {/* Player name */}
                <motion.div variants={fadeInUp}>
                  <p className="text-lg text-text-secondary">
                    <motion.span
                      className="font-semibold text-text-primary"
                      variants={jelly}
                      whileHover="animate"
                    >
                      {eliminatedPlayer.displayName}
                    </motion.span>{' '}
                    ha sido eliminado
                  </p>
                </motion.div>

                {/* Result */}
                <motion.div variants={bounceIn} className="pt-2">
                  <motion.p
                    className={`text-4xl font-black ${
                      wasImpostor ? 'text-success' : 'text-danger'
                    }`}
                    style={{
                      textShadow: wasImpostor
                        ? '0 0 30px rgba(34, 197, 94, 0.6)'
                        : '0 0 30px rgba(239, 68, 68, 0.6)',
                    }}
                    variants={wasImpostor ? tada : shakeAnimation}
                    animate="animate"
                  >
                    {wasImpostor ? '¡ERA EL IMPOSTOR!' : 'Inocente...'}
                  </motion.p>
                  {wasImpostor && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 text-lg text-success"
                    >
                      ¡Buen trabajo, equipo!
                    </motion.p>
                  )}
                  {!wasImpostor && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-3 text-sm text-text-secondary"
                    >
                      El impostor sigue entre vosotros...
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div variants={fadeInUp} className="space-y-4">
                <motion.div
                  className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bg-elevated text-5xl"
                  animate={{
                    y: [0, -10, 0],
                    rotate: [-5, 5, -5],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🤷
                </motion.div>
                <motion.p
                  className="text-2xl font-bold text-text-primary"
                  variants={jelly}
                  animate="animate"
                >
                  Nadie fue eliminado
                </motion.p>
                <p className="text-sm text-text-tertiary">
                  No hubo suficientes votos
                </p>

                {/* Countdown timer */}
                <motion.div
                  className="mt-6 flex flex-col items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
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
                      <motion.circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="var(--color-neon-cyan)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={176}
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: 176 }}
                        transition={{ duration: AUTO_CONTINUE_SECONDS, ease: 'linear' }}
                        style={{
                          filter: 'drop-shadow(0 0 8px rgba(0, 240, 255, 0.5))',
                        }}
                      />
                    </svg>
                    <motion.span
                      className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-bold text-neon-cyan"
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={springBouncy}
                    >
                      {countdown}
                    </motion.span>
                  </div>
                  <p className="text-xs text-text-tertiary">
                    Continuando automáticamente...
                  </p>
                </motion.div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Continue button - only show when someone was eliminated */}
      {eliminatedPlayer && (
        <motion.div
          variants={fadeInUp}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button variant="neon" className="w-full text-base" onClick={onContinue}>
            Continuar
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}
