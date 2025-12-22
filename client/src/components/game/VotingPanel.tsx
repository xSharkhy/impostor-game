import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'

export function VotingPanel() {
  const { voteState, hasVoted, myVote } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { castVote, confirmVote } = useSocket()

  if (!room || !user || !voteState) return null

  const isAdmin = room.adminId === user.id
  const activePlayers = room.players.filter((p) => !p.isEliminated)

  // Count votes per player
  const voteCounts: Record<string, number> = {}
  for (const targetId of Object.values(voteState.votes)) {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1
  }

  const totalVotes = Object.keys(voteState.votes).length
  const allVoted = totalVotes === activePlayers.length
  const threshold = Math.ceil((activePlayers.length * 2) / 3)

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Votación</h2>
        <p className="text-sm text-[--color-text-muted]">
          {hasVoted
            ? 'Esperando a los demás...'
            : 'Selecciona al sospechoso'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Jugadores</span>
            <span className="text-sm font-normal text-[--color-text-muted]">
              {totalVotes}/{activePlayers.length} votos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {activePlayers.map((player) => {
            const votes = voteCounts[player.id] || 0
            const isMe = player.id === user.id
            const isMyVote = myVote === player.id
            const hasThreshold = votes >= threshold

            return (
              <div
                key={player.id}
                className={`flex items-center justify-between rounded-md px-3 py-2 transition-colors ${
                  isMyVote
                    ? 'bg-[--color-accent-pink]/20 ring-1 ring-[--color-accent-pink]'
                    : hasThreshold
                      ? 'bg-[--color-danger]/20'
                      : 'bg-[--color-bg-primary]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={isMe ? 'font-semibold' : ''}>
                    {player.displayName}
                    {isMe && ' (tú)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {votes > 0 && (
                    <span
                      className={`text-sm ${
                        hasThreshold
                          ? 'font-bold text-[--color-danger]'
                          : 'text-[--color-text-muted]'
                      }`}
                    >
                      {votes} {votes === 1 ? 'voto' : 'votos'}
                    </span>
                  )}
                  {!hasVoted && !isMe && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => castVote(player.id)}
                    >
                      Votar
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Threshold indicator */}
      <p className="text-center text-sm text-[--color-text-muted]">
        Se necesitan {threshold} votos (⅔) para eliminar
      </p>

      {/* Admin controls */}
      {isAdmin && allVoted && (
        <div className="space-y-3">
          <Button
            className="w-full"
            variant={voteState.twoThirdsReached ? 'primary' : 'outline'}
            onClick={() => confirmVote(true)}
          >
            Eliminar al más votado
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={() => confirmVote(false)}
          >
            Continuar sin eliminar
          </Button>
        </div>
      )}

      {isAdmin && !allVoted && (
        <p className="text-center text-sm text-[--color-text-muted]">
          Esperando que todos voten...
        </p>
      )}
    </div>
  )
}
