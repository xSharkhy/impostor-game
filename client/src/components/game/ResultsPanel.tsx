import { useEffect, useState, useRef } from 'react'
import { Button, Card, CardContent, Confetti, EmojiBurst } from '@/components/ui'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'

interface ResultsPanelProps {
  onContinue: () => void
}

const AUTO_CONTINUE_SECONDS = 5

export function ResultsPanel({ onContinue }: ResultsPanelProps) {
  const { lastEliminated, wasImpostor } = useGameStore()
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
      <div className="text-center">
        <h2 className="text-3xl font-bold">Resultado</h2>
      </div>

      {/* Result Card */}
      <Card
        variant={wasImpostor ? 'glow' : eliminatedPlayer ? 'glow-pink' : 'glass'}
        className="overflow-hidden"
      >
        <CardContent className="py-10 text-center">
          {eliminatedPlayer ? (
            <div className="space-y-6">
              {/* Eliminated player avatar */}
              <div className="mx-auto">
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
              </div>

              {/* Player name */}
              <div>
                <p className="text-lg text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {eliminatedPlayer.displayName}
                  </span>{' '}
                  ha sido eliminado
                </p>
              </div>

              {/* Result */}
              <div className="pt-2">
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
                  {wasImpostor ? '¡ERA EL IMPOSTOR!' : 'Inocente...'}
                </p>
                {wasImpostor && (
                  <p className="mt-3 text-lg text-success">
                    ¡Buen trabajo, equipo!
                  </p>
                )}
                {!wasImpostor && (
                  <p className="mt-3 text-sm text-text-secondary">
                    El impostor sigue entre vosotros...
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-bg-elevated text-5xl">
                🤷
              </div>
              <p className="text-2xl font-bold text-text-primary">
                Nadie fue eliminado
              </p>
              <p className="text-sm text-text-tertiary">
                No hubo suficientes votos
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
                  Continuando automáticamente...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Continue button - show for admin always, or when someone was eliminated */}
      {(eliminatedPlayer || isAdmin) && (
        <Button variant="neon" className="w-full text-base" onClick={onContinue}>
          {eliminatedPlayer ? 'Continuar' : 'Saltar'}
        </Button>
      )}
    </div>
  )
}
