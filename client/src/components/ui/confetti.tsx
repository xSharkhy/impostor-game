import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  rotation: number
  size: number
  type: 'circle' | 'square' | 'star'
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
  particleCount?: number
  colors?: string[]
  onComplete?: () => void
}

const defaultColors = [
  '#00f0ff', // cyan
  '#ff2d6a', // pink
  '#a855f7', // purple
  '#facc15', // yellow
  '#22ff88', // green
  '#ffffff', // white
]

function createConfettiPiece(id: number, colors: string[]): ConfettiPiece {
  const types: Array<'circle' | 'square' | 'star'> = ['circle', 'square', 'star']
  return {
    id,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    size: Math.random() * 8 + 4,
    type: types[Math.floor(Math.random() * types.length)],
  }
}

function ConfettiShape({ piece }: { piece: ConfettiPiece }) {
  if (piece.type === 'star') {
    return (
      <svg width={piece.size} height={piece.size} viewBox="0 0 24 24" fill={piece.color}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    )
  }

  if (piece.type === 'square') {
    return (
      <div
        style={{
          width: piece.size,
          height: piece.size,
          backgroundColor: piece.color,
          borderRadius: 2,
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: piece.size,
        height: piece.size,
        backgroundColor: piece.color,
        borderRadius: '50%',
      }}
    />
  )
}

export function Confetti({
  isActive,
  duration = 4000,
  particleCount = 100,
  colors = defaultColors,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const generatePieces = useCallback(() => {
    return Array.from({ length: particleCount }, (_, i) =>
      createConfettiPiece(i, colors)
    )
  }, [particleCount, colors])

  useEffect(() => {
    if (isActive) {
      setPieces(generatePieces())
      setIsVisible(true)

      const timer = setTimeout(() => {
        setIsVisible(false)
        onComplete?.()
      }, duration)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isActive, duration, generatePieces, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <div
          className="fixed inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: 'var(--z-confetti)' }}
        >
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute"
              style={{ left: `${piece.x}%` }}
              initial={{
                y: -20,
                opacity: 1,
                rotate: piece.rotation,
                scale: 0,
              }}
              animate={{
                y: '100vh',
                opacity: [1, 1, 0],
                rotate: piece.rotation + 720,
                scale: [0, 1, 1, 0.8],
                x: [0, Math.random() * 100 - 50, Math.random() * 200 - 100],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: piece.delay,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ConfettiShape piece={piece} />
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// === EMOJI BURST ===

interface EmojiBurstProps {
  emoji: string
  isActive: boolean
  count?: number
  duration?: number
}

export function EmojiBurst({
  emoji,
  isActive,
  count = 20,
  duration = 2000,
}: EmojiBurstProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; scale: number; rotation: number }>
  >([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isActive) {
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300,
        scale: 0.5 + Math.random() * 1,
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)
      setIsVisible(true)

      const timer = setTimeout(() => setIsVisible(false), duration)
      return () => clearTimeout(timer)
    }
  }, [isActive, count, duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          {particles.map((particle) => (
            <motion.span
              key={particle.id}
              className="absolute text-4xl"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: particle.x,
                y: particle.y,
                scale: particle.scale,
                opacity: 0,
                rotate: particle.rotation,
              }}
              transition={{
                duration: 1,
                ease: 'easeOut',
              }}
            >
              {emoji}
            </motion.span>
          ))}
        </div>
      )}
    </AnimatePresence>
  )
}

// === SPARKLES ===

interface SparklesProps {
  children: React.ReactNode
  isActive?: boolean
  color?: string
}

export function Sparkles({
  children,
  isActive = true,
  color = '#00f0ff',
}: SparklesProps) {
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number; size: number; delay: number }>
  >([])

  useEffect(() => {
    if (!isActive) return

    const generateSparkle = () => ({
      id: Date.now() + Math.random(),
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      delay: Math.random() * 2,
    })

    const interval = setInterval(() => {
      setSparkles((prev) => [...prev.slice(-10), generateSparkle()])
    }, 300)

    return () => clearInterval(interval)
  }, [isActive])

  return (
    <span className="relative inline-block">
      {children}
      {isActive && (
        <span className="absolute inset-0 pointer-events-none overflow-hidden">
          {sparkles.map((sparkle) => (
            <motion.span
              key={sparkle.id}
              className="absolute block"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                width: sparkle.size,
                height: sparkle.size,
                backgroundColor: color,
                borderRadius: '50%',
                boxShadow: `0 0 ${sparkle.size * 2}px ${color}`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{
                duration: 1,
                delay: sparkle.delay,
                ease: 'easeOut',
              }}
            />
          ))}
        </span>
      )}
    </span>
  )
}
