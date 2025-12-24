import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Card, CardContent, CardHeader, CardTitle, Confetti, EmojiBurst } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'

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
        <div className="mb-4 text-7xl" aria-hidden="true">
          {playerWon ? '🏆' : '💀'}
        </div>
        <h2 className="text-5xl font-black">
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
        </h2>
        <p
          className={`mt-3 text-xl font-medium ${
            crewWon ? 'text-neon-green' : 'text-neon-pink'
          }`}
        >
          {crewWon ? t('gameOver.crewWon') : t('gameOver.impostorWon')}
        </p>
      </div>

      {/* Impostor reveal */}
      <div>
        <Card variant={wasImpostor ? 'glow-pink' : 'glow'}>
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-normal text-text-secondary">
              {multipleImpostors ? t('gameOver.impostorsWere') : t('gameOver.impostorWas')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className={`flex flex-wrap items-center justify-center gap-4 ${multipleImpostors ? 'gap-y-6' : ''}`}>
              {impostors.map((impostor) => {
                const isMe = impostor.id === user?.id
                return (
                  <div key={impostor.id} className="flex flex-col items-center gap-2">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-pink text-2xl font-bold text-white">
                      {impostor.displayName.charAt(0).toUpperCase()}
                    </div>
                    <p
                      className="text-xl font-bold text-neon-pink"
                      style={{
                        textShadow: '0 0 20px rgba(255, 45, 106, 0.5)',
                      }}
                    >
                      {impostor.displayName}
                      {isMe && (
                        <span className="ml-2 text-base text-text-secondary">{t('common.you')}</span>
                      )}
                    </p>
                  </div>
                )
              })}
              {impostors.length === 0 && (
                <p className="text-xl font-bold text-text-secondary">{t('common.unknown')}</p>
              )}
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
                {t('gameOver.wordWas')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-6">
              <p
                className="text-center text-3xl font-bold text-neon-green"
                style={{
                  textShadow: '0 0 20px rgba(34, 255, 136, 0.5)',
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
            🔄 {t('gameOver.playAgain')}
          </Button>
        )}
        <Button
          variant="outline"
          className="w-full"
          onClick={leaveRoom}
        >
          👋 {t('gameOver.backToStart')}
        </Button>
      </div>

      {/* Waiting message for non-admin */}
      {!isAdmin && (
        <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          {t('gameOver.waitingNewGame')}
        </div>
      )}
    </div>
  )
}
