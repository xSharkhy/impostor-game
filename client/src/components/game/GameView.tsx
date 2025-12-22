import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
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

  if (!room || !user) return null

  // Show VotingPanel during voting phase
  if (phase === 'voting') {
    return <VotingPanel />
  }

  // Show results after voting
  if (phase === 'results') {
    return (
      <ResultsPanel
        onContinue={() => {
          useGameStore.getState().setRound(useGameStore.getState().currentRound)
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
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Word Display */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-sm font-normal text-[--color-text-muted]">
            {isImpostor ? 'Eres el impostor' : 'Tu palabra'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p
            className={`text-center text-4xl font-bold ${
              isImpostor
                ? 'text-[--color-accent-pink]'
                : 'text-[--color-accent-cyan]'
            }`}
          >
            {isImpostor ? '???' : word}
          </p>
          {isImpostor && (
            <p className="mt-2 text-center text-sm text-[--color-text-muted]">
              Descubre la palabra escuchando a los demás
            </p>
          )}
        </CardContent>
      </Card>

      {/* Round indicator */}
      <div className="text-center">
        <span className="text-sm text-[--color-text-muted]">
          Ronda {currentRound}
        </span>
      </div>

      {/* Turn Order */}
      <Card>
        <CardHeader>
          <CardTitle>Orden de turnos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {turnOrderNames.map((player, index) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 rounded-md px-3 py-2 ${
                player.isEliminated
                  ? 'bg-[--color-danger]/10 line-through opacity-50'
                  : player.isMe
                    ? 'bg-[--color-accent-cyan]/10'
                    : 'bg-[--color-bg-primary]'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[--color-bg-card] text-xs">
                {index + 1}
              </span>
              <span className={player.isMe ? 'font-semibold' : ''}>
                {player.name}
                {player.isMe && ' (tú)'}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="space-y-3">
          <Button className="w-full" onClick={startVoting}>
            Iniciar Votación
          </Button>
          <Button variant="outline" className="w-full" onClick={nextRound}>
            Siguiente Ronda
          </Button>
        </div>
      )}

      <Button
        variant="ghost"
        className="w-full text-[--color-text-muted]"
        onClick={leaveRoom}
      >
        Abandonar partida
      </Button>
    </div>
  )
}
