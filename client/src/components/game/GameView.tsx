import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import { WordCollectionPanel } from './WordCollectionPanel'
import { VotingPanel } from './VotingPanel'
import { ResultsPanel } from './ResultsPanel'
import { GameOverPanel } from './GameOverPanel'

export function GameView() {
  const { t } = useTranslation()
  const { word, isImpostor, turnOrder, currentRound, phase } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { nextRound, startVoting, leaveRoom } = useSocket()

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  if (!room || !user) return null

  // Show WordCollectionPanel during collecting phase (roulette mode)
  if (phase === 'collecting') {
    return (
      <div className="flex h-full w-full flex-col">
        <WordCollectionPanel />
      </div>
    )
  }

  // Show VotingPanel during voting phase
  if (phase === 'voting') {
    return (
      <div className="flex h-full w-full flex-col">
        <VotingPanel />
      </div>
    )
  }

  // Show results after voting
  if (phase === 'results') {
    return (
      <ResultsPanel
        onContinue={() => {
          useGameStore.getState().continueFromResults()
        }}
      />
    )
  }

  // Show game over screen
  if (phase === 'finished') {
    return <GameOverPanel />
  }

  const isAdmin = room.adminId === user.id

  // Get player names for turn order
  const turnOrderNames = turnOrder.map((playerId) => {
    const player = room.players.find((p) => p.id === playerId)
    return {
      id: playerId,
      name: player?.displayName || t('common.unknown'),
      isMe: playerId === user.id,
      isEliminated: player?.isEliminated || false,
    }
  })

  return (
    <div className="relative mx-auto w-full max-w-md space-y-6">
      {/* Word Display - Hero Section */}
      <div>
        <Card variant={isImpostor ? 'glow-pink' : 'glow'} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-normal text-text-secondary">
              {isImpostor ? t('game.youAreImpostor') : t('game.yourWord')}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="relative">
              {isImpostor ? (
                <p className="text-center text-6xl font-black text-neon-pink">
                  ???
                </p>
              ) : (
                <p
                  className="text-center text-4xl font-bold text-neon-green"
                  style={{
                    textShadow: '0 0 20px rgba(34, 255, 136, 0.5), 0 0 40px rgba(34, 255, 136, 0.3)',
                  }}
                >
                  {word}
                </p>
              )}
            </div>
            {isImpostor && (
              <p className="mt-4 text-center text-sm text-text-secondary">
                {t('game.discoverWord')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Round indicator - small badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-bg-tertiary px-4 py-1.5 text-sm font-medium text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-accent" />
          {t('game.round', { number: currentRound })}
        </span>
      </div>

      {/* Turn Order */}
      <div>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">{t('game.turnOrder')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {turnOrderNames.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    player.isEliminated
                      ? 'bg-danger/10 line-through opacity-50'
                      : player.isMe
                        ? 'border border-accent/30 bg-accent/10'
                        : 'bg-bg-tertiary hover:bg-bg-elevated'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      player.isMe
                        ? 'bg-accent text-white'
                        : 'bg-bg-elevated text-text-secondary'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={player.isMe ? 'font-semibold text-accent' : 'text-text-primary'}>
                    {player.name}
                    {player.isMe && (
                      <span className="ml-1.5 text-xs text-text-secondary">{t('common.you')}</span>
                    )}
                  </span>
                  {player.isEliminated && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-tertiary">
                      <span>👻</span>
                      <span>{t('game.spectator')}</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="space-y-3">
          <Button variant="neon" className="w-full text-base" onClick={startVoting}>
            {t('game.startVoting')}
          </Button>
          <Button variant="outline" className="w-full" onClick={nextRound}>
            {t('game.nextRound')}
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full text-text-tertiary hover:text-danger"
        onClick={() => setShowLeaveConfirm(true)}
      >
        {t('game.leaveGame')}
      </Button>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('game.leaveGame')}</AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin
                ? t('game.leaveGameAdminWarning')
                : t('game.leaveGameConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={leaveRoom}>
              {t('game.abandon')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
