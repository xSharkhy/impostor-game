import { motion, AnimatePresence } from 'motion/react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  springBouncy,
  wobble,
  tada,
} from '@/lib/motion'

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
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      className="mx-auto w-full max-w-md space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center">
        <motion.div
          className="mb-2 text-5xl"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        >
          🗳️
        </motion.div>
        <motion.h2
          className="text-3xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springBouncy}
          variants={wobble}
          whileHover="animate"
        >
          <span className="text-gradient-party bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-clip-text text-transparent">
            ¡A votar!
          </span>
        </motion.h2>
        <motion.p
          variants={fadeInUp}
          className="mt-2 text-sm text-text-secondary"
        >
          {hasVoted
            ? '✓ Voto registrado. Esperando...'
            : '¿Quién es el impostor?'}
        </motion.p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div variants={fadeInUp} className="px-4">
        <div className="relative h-2 overflow-hidden rounded-full bg-bg-tertiary">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan to-neon-purple"
            initial={{ width: 0 }}
            animate={{ width: `${(totalVotes / activePlayers.length) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="mt-2 text-center text-xs text-text-tertiary">
          {totalVotes} de {activePlayers.length} votos
        </p>
      </motion.div>

      {/* Players list */}
      <motion.div variants={fadeInUp}>
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Jugadores</span>
              <span className="font-mono text-sm font-normal text-text-secondary">
                {threshold} votos = eliminación
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence>
                {activePlayers.map((player) => {
                  const votes = voteCounts[player.id] || 0
                  const isMe = player.id === user.id
                  const isMyVote = myVote === player.id
                  const hasThreshold = votes >= threshold

                  return (
                    <motion.div
                      key={player.id}
                      variants={staggerItem}
                      layout
                      animate={hasThreshold ? 'animate' : undefined}
                      className={`relative flex items-center justify-between rounded-lg px-4 py-3 transition-all ${
                        isMyVote
                          ? 'border border-neon-pink/50 bg-neon-pink/10'
                          : hasThreshold
                            ? 'border border-danger/50 bg-danger/10'
                            : 'bg-bg-tertiary hover:bg-bg-elevated'
                      }`}
                      style={hasThreshold ? {
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                      } : undefined}
                    >
                      {/* Vote count bar (background) */}
                      {votes > 0 && (
                        <motion.div
                          className={`absolute inset-y-0 left-0 rounded-lg ${
                            hasThreshold ? 'bg-danger/20' : 'bg-neon-purple/10'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(votes / activePlayers.length) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Player info */}
                      <div className="relative z-10 flex items-center gap-3">
                        <motion.div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isMe
                              ? 'bg-neon-cyan text-black'
                              : isMyVote
                                ? 'bg-neon-pink text-white'
                                : 'bg-bg-elevated text-text-secondary'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={springBouncy}
                        >
                          {player.displayName.charAt(0).toUpperCase()}
                        </motion.div>
                        <div>
                          <span className={`font-medium ${isMe ? 'text-neon-cyan' : 'text-text-primary'}`}>
                            {player.displayName}
                          </span>
                          {isMe && (
                            <span className="ml-1.5 text-xs text-text-secondary">(tú)</span>
                          )}
                          {isMyVote && (
                            <p className="text-xs text-neon-pink">Tu voto</p>
                          )}
                        </div>
                      </div>

                      {/* Vote count & button */}
                      <div className="relative z-10 flex items-center gap-3">
                        {votes > 0 && (
                          <motion.div
                            key={votes}
                            initial={{ scale: 1.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${
                              hasThreshold
                                ? 'bg-danger text-white'
                                : 'bg-bg-elevated text-text-secondary'
                            }`}
                          >
                            <span>{votes}</span>
                            <span className="text-xs opacity-70">
                              {votes === 1 ? 'voto' : 'votos'}
                            </span>
                          </motion.div>
                        )}
                        {!hasVoted && !isMe && (
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: [-2, 2, -2, 0] }}
                            whileTap={{ scale: 0.9 }}
                            transition={springBouncy}
                          >
                            <Button
                              size="sm"
                              variant="neon-outline"
                              onClick={() => castVote(player.id)}
                            >
                              👆 Votar
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Threshold indicator */}
      <motion.p
        variants={fadeInUp}
        className="text-center text-sm text-text-tertiary"
      >
        Se necesitan <span className="font-semibold text-neon-purple">{threshold} votos</span> (⅔) para eliminar
      </motion.p>

      {/* Admin controls */}
      {isAdmin && allVoted && (
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="space-y-3"
        >
          {isTie ? (
            <>
              {/* Tie message */}
              <motion.div
                className="rounded-lg border border-neon-yellow/30 bg-neon-yellow/10 px-4 py-3 text-center"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <span className="text-2xl">🤝</span>
                <p className="mt-1 text-sm font-medium text-neon-yellow">
                  ¡Empate! Nadie será eliminado
                </p>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="neon"
                  className="w-full text-base"
                  onClick={() => confirmVote(false)}
                >
                  ➡️ Continuar
                </Button>
              </motion.div>
            </>
          ) : (
            <>
              {/* Clear winner */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={voteState.twoThirdsReached ? tada : undefined}
                animate={voteState.twoThirdsReached ? 'animate' : undefined}
              >
                <Button
                  className="w-full text-base"
                  variant={voteState.twoThirdsReached ? 'neon-pink' : 'outline'}
                  onClick={() => confirmVote(true)}
                >
                  {voteState.twoThirdsReached ? '💀 ¡Eliminación!' : `🎯 Eliminar (${maxVotes} votos)`}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => confirmVote(false)}
                >
                  😇 Perdonar a todos
                </Button>
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {isAdmin && !allVoted && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-2 text-sm text-text-tertiary"
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-neon-cyan"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Esperando que todos voten...
        </motion.div>
      )}
    </motion.div>
  )
}
