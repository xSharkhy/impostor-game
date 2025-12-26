import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { fadeIn, roundReveal, springBouncy } from '@/lib/motion'

interface RoundTransitionProps {
  round: number
  show: boolean
  onComplete: () => void
}

/**
 * Dramatic round transition overlay
 * Shows the round number with a goofy but elegant animation
 */
export function RoundTransition({ round, show, onComplete }: RoundTransitionProps) {
  const { t } = useTranslation()
  const [displayRound, setDisplayRound] = useState(round)

  // Keep displaying the round number during exit animation
  useEffect(() => {
    if (show) {
      setDisplayRound(round)
    }
  }, [show, round])

  // Auto-hide after animation completes
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete()
      }, 2000) // Show for 2 seconds

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
          variants={fadeIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {/* Round label */}
          <motion.span
            className="mb-4 text-lg font-medium uppercase tracking-widest text-text-secondary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...springBouncy }}
          >
            {t('game.roundLabel', 'Ronda')}
          </motion.span>

          {/* Big round number */}
          <motion.span
            className="text-[12rem] font-black leading-none text-accent"
            style={{
              textShadow: '0 0 60px rgba(168, 85, 247, 0.5), 0 0 120px rgba(168, 85, 247, 0.3)',
            }}
            variants={roundReveal}
            initial="initial"
            animate="animate"
          >
            {displayRound}
          </motion.span>

          {/* Decorative elements */}
          <motion.div
            className="mt-8 flex items-center gap-3"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, ...springBouncy }}
          >
            <span className="h-1 w-12 rounded-full bg-accent/30" />
            <span className="h-2 w-2 rounded-full bg-accent" />
            <span className="h-1 w-12 rounded-full bg-accent/30" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
