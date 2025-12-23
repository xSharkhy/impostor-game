import { useState } from 'react'
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
import { VotingPanel } from './VotingPanel'
import { ResultsPanel } from './ResultsPanel'
import { GameOverPanel } from './GameOverPanel'

export function GameView() {
  const { word, isImpostor, turnOrder, currentRound, phase } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { nextRound, startVoting, leaveRoom } = useSocket()

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  if (!room || !user) return null

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
      name: player?.displayName || 'Desconocido',
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
              {isImpostor ? 'Eres el impostor' : 'Tu palabra'}
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
                  className="text-center text-4xl font-bold text-neon-cyan"
                  style={{
                    textShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
                  }}
                >
                  {word}
                </p>
              )}
            </div>
            {isImpostor && (
              <p className="mt-4 text-center text-sm text-text-secondary">
                Descubre la palabra escuchando a los demás
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Round indicator - small badge */}
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-bg-tertiary px-4 py-1.5 text-sm font-medium text-text-secondary">
          <span className="h-2 w-2 rounded-full bg-neon-cyan" />
          Ronda {currentRound}
        </span>
      </div>

      {/* Turn Order */}
      <div>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Orden de turnos</CardTitle>
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
                        ? 'border border-neon-cyan/30 bg-neon-cyan/10'
                        : 'bg-bg-tertiary hover:bg-bg-elevated'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      player.isMe
                        ? 'bg-neon-cyan text-black'
                        : 'bg-bg-elevated text-text-secondary'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={player.isMe ? 'font-semibold text-neon-cyan' : 'text-text-primary'}>
                    {player.name}
                    {player.isMe && (
                      <span className="ml-1.5 text-xs text-text-secondary">(tú)</span>
                    )}
                  </span>
                  {player.isEliminated && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-tertiary">
                      <span>👻</span>
                      <span>Espectador</span>
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
            Iniciar Votación
          </Button>
          <Button variant="outline" className="w-full" onClick={nextRound}>
            Siguiente Ronda
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full text-text-tertiary hover:text-danger"
        onClick={() => setShowLeaveConfirm(true)}
      >
        Abandonar partida
      </Button>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abandonar partida</AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin
                ? '¡Eres el admin! Si abandonas, la partida continuará con otro admin.'
                : '¿Seguro que quieres abandonar la partida en curso?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={leaveRoom}>
              Abandonar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
