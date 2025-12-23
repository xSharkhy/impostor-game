import { motion } from 'motion/react'
import { Button } from '@/components/ui'
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

  // Find the most voted player(s)
  const maxVotes = Math.max(...Object.values(voteCounts), 0)
  const mostVotedPlayers = Object.entries(voteCounts)
    .filter(([, count]) => count === maxVotes)
    .map(([id]) => id)
  const isTie = mostVotedPlayers.length > 1 || maxVotes === 0

  return (
    <div className="flex h-full w-full max-w-md flex-col gap-3">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🗳️</span>
          <h2 className="text-xl font-bold text-accent">¡A votar!</h2>
        </div>
        <span className="text-xs text-text-tertiary">
          {hasVoted ? '✓ Votaste' : `${threshold} = eliminar`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary">
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-neon-pink"
          initial={{ width: 0 }}
          animate={{ width: `${(totalVotes / activePlayers.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <p className="text-center text-xs text-text-tertiary">
        {totalVotes} de {activePlayers.length} votos
      </p>

      {/* Players list - simplified without AnimatePresence */}
      <div className="flex-1 space-y-1.5 overflow-y-auto">
        {activePlayers.map((player) => {
          const votes = voteCounts[player.id] || 0
          const isMe = player.id === user.id
          const isMyVote = myVote === player.id
          const hasThreshold = votes >= threshold

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between rounded-lg px-3 py-2 ${
                isMyVote
                  ? 'border border-neon-pink/50 bg-neon-pink/10'
                  : hasThreshold
                    ? 'border border-danger/50 bg-danger/10'
                    : 'bg-bg-tertiary'
              }`}
            >
              {/* Vote bar background */}
              {votes > 0 && (
                <div
                  className={`absolute inset-y-0 left-0 rounded-lg transition-all duration-300 ${
                    hasThreshold ? 'bg-danger/20' : 'bg-neon-purple/10'
                  }`}
                  style={{ width: `${(votes / activePlayers.length) * 100}%` }}
                />
              )}

              {/* Player info */}
              <div className="relative z-10 flex items-center gap-2">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                    isMe
                      ? 'bg-accent text-white'
                      : isMyVote
                        ? 'bg-neon-pink text-white'
                        : 'bg-bg-elevated text-text-secondary'
                  }`}
                >
                  {player.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isMe ? 'text-accent' : 'text-text-primary'}`}>
                    {player.displayName}
                    {isMe && <span className="ml-1 text-xs text-text-tertiary">(tú)</span>}
                  </span>
                  {isMyVote && <span className="text-[10px] text-neon-pink">Tu voto</span>}
                </div>
              </div>

              {/* Vote count & button */}
              <div className="relative z-10 flex items-center gap-2">
                {votes > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    hasThreshold ? 'bg-danger text-white' : 'bg-bg-elevated text-text-secondary'
                  }`}>
                    {votes}
                  </span>
                )}
                {!hasVoted && !isMe && (
                  <Button
                    size="sm"
                    variant="neon-outline"
                    onClick={() => castVote(player.id)}
                    className="h-7 px-2 text-xs"
                  >
                    Votar
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Admin controls - ALWAYS at bottom */}
      <div className="mt-auto space-y-2 pt-2">
        {isAdmin && allVoted && (
          <>
            {isTie ? (
              <>
                <div className="rounded-lg border border-neon-yellow/30 bg-neon-yellow/10 px-3 py-2 text-center">
                  <p className="text-sm font-medium text-neon-yellow">🤝 ¡Empate!</p>
                </div>
                <Button
                  variant="neon"
                  className="w-full"
                  onClick={() => confirmVote(false)}
                >
                  ➡️ Continuar
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full"
                  variant={voteState.twoThirdsReached ? 'neon-pink' : 'default'}
                  onClick={() => confirmVote(true)}
                >
                  {voteState.twoThirdsReached ? '💀 ¡Eliminar!' : `🎯 Eliminar (${maxVotes} votos)`}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => confirmVote(false)}
                >
                  😇 Perdonar
                </Button>
              </>
            )}
          </>
        )}

        {isAdmin && !allVoted && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-text-tertiary">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Esperando votos...
          </div>
        )}

        {!isAdmin && (
          <p className="py-2 text-center text-xs text-text-tertiary">
            {allVoted ? 'Esperando al admin...' : 'Esperando votos...'}
          </p>
        )}
      </div>
    </div>
  )
}
