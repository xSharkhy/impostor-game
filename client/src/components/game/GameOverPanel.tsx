import { useEffect, useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Confetti, EmojiBurst } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'

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
    <div className="relative mx-auto w-full max-w-md space-y-6">
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
      <div className="text-center">
        <div className="mb-4 text-7xl">
          {playerWon ? '🏆' : '💀'}
        </div>
        <h2 className="text-5xl font-black">
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
        </h2>
        <p
          className={`mt-3 text-xl font-medium ${
            crewWon ? 'text-neon-cyan' : 'text-neon-pink'
          }`}
        >
          {crewWon ? '¡Los civiles han ganado!' : '¡El impostor ha ganado!'}
        </p>
      </div>

      {/* Impostor reveal */}
      <div>
        <Card variant={wasImpostor ? 'glow-pink' : 'glow'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-normal text-text-secondary">
              El impostor era
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink text-2xl font-bold text-white">
                {impostor?.displayName.charAt(0).toUpperCase() || '?'}
              </div>
              <p
                className="text-2xl font-bold text-neon-pink"
                style={{
                  textShadow: '0 0 20px rgba(255, 45, 106, 0.5)',
                }}
              >
                {impostor?.displayName || 'Desconocido'}
                {wasImpostor && (
                  <span className="ml-2 text-lg text-text-secondary">(tú)</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word reveal */}
      {word && (
        <div>
          <Card variant="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-center text-sm font-normal text-text-secondary">
                La palabra era
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p
                className="text-center text-3xl font-bold text-neon-cyan"
                style={{
                  textShadow: '0 0 20px rgba(0, 240, 255, 0.5)',
                }}
              >
                {word}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3 pt-4">
        {isAdmin && (
          <Button
            variant="neon"
            className="w-full text-base"
            onClick={playAgain}
          >
            🔄 ¡Otra partida!
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={leaveRoom}
        >
          👋 Volver al inicio
        </Button>
      </div>

      {/* Waiting message for non-admin */}
      {!isAdmin && (
        <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
          <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse" />
          Esperando al admin para nueva partida...
        </div>
      )}
    </div>
  )
}
