import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Button } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useGameStore, useRoomStore, useUserStore } from '@/stores'
import { staggerContainer, listItem, springBouncy, fadeInUp, tapScale } from '@/lib/motion'

export function VotingPanel() {
  const { t } = useTranslation()
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
      <motion.div
        className="flex items-center justify-between"
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        transition={springBouncy}
      >
        <div className="flex items-center gap-2">
          <motion.span
            className="text-2xl"
            aria-hidden="true"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 25 }}
          >
            🗳️
          </motion.span>
          <h2 className="text-xl font-bold text-accent">{t('voting.title')}</h2>
        </div>
        <span className="text-xs text-text-tertiary">
          {hasVoted ? t('voting.voted') : t('voting.threshold', { count: threshold })}
        </span>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        className="h-1.5 overflow-hidden rounded-full bg-bg-tertiary"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.1, ...springBouncy }}
        style={{ transformOrigin: 'left' }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-accent to-neon-pink"
          initial={{ width: 0 }}
          animate={{ width: `${(totalVotes / activePlayers.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
      <motion.p
        className="text-center text-xs text-text-tertiary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {t('voting.votesCount', { current: totalVotes, total: activePlayers.length })}
      </motion.p>

      {/* Players list with stagger animation */}
      <motion.div
        className="flex-1 space-y-1.5 overflow-y-auto"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {activePlayers.map((player) => {
          const votes = voteCounts[player.id] || 0
          const isMe = player.id === user.id
          const isMyVote = myVote === player.id
          const hasThreshold = votes >= threshold

          return (
            <motion.div
              key={player.id}
              variants={listItem}
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
                <motion.div
                  className={`absolute inset-y-0 left-0 rounded-lg ${
                    hasThreshold ? 'bg-danger/20' : 'bg-neon-purple/10'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(votes / activePlayers.length) * 100}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
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
                    {isMe && <span className="ml-1 text-xs text-text-tertiary">{t('common.you')}</span>}
                  </span>
                  {isMyVote && <span className="text-[10px] text-neon-pink">{t('voting.yourVote')}</span>}
                </div>
              </div>

              {/* Vote count & button */}
              <div className="relative z-10 flex items-center gap-2">
                {votes > 0 && (
                  <motion.span
                    key={votes}
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      hasThreshold ? 'bg-danger text-white' : 'bg-bg-elevated text-text-secondary'
                    }`}
                    initial={{ scale: 1.4 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {votes}
                  </motion.span>
                )}
                {!hasVoted && !isMe && (
                  <motion.div whileTap={tapScale}>
                    <Button
                      size="sm"
                      variant="neon-outline"
                      onClick={() => castVote(player.id)}
                      className="h-9 min-w-[52px] px-3 text-xs"
                    >
                      {t('voting.vote')}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Admin controls - ALWAYS at bottom */}
      <div className="mt-auto space-y-2 pt-2">
        {isAdmin && allVoted && (
          <>
            {isTie ? (
              <>
                <div className="rounded-lg border border-neon-yellow/30 bg-neon-yellow/10 px-3 py-2 text-center">
                  <p className="text-sm font-medium text-neon-yellow">🤝 {t('voting.tie')}</p>
                </div>
                <Button
                  variant="neon"
                  className="w-full"
                  onClick={() => confirmVote(false)}
                >
                  ➡️ {t('voting.continue')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="w-full"
                  variant={voteState.twoThirdsReached ? 'neon-pink' : 'default'}
                  onClick={() => confirmVote(true)}
                >
                  {voteState.twoThirdsReached ? `💀 ${t('voting.eliminate')}` : `🎯 ${t('voting.eliminateVotes', { count: maxVotes })}`}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => confirmVote(false)}
                >
                  😇 {t('voting.forgive')}
                </Button>
              </>
            )}
          </>
        )}

        {isAdmin && !allVoted && (
          <div className="flex items-center justify-center gap-2 py-2 text-sm text-text-tertiary">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            {t('voting.waitingVotes')}
          </div>
        )}

        {!isAdmin && (
          <p className="py-2 text-center text-xs text-text-tertiary">
            {allVoted ? t('voting.waitingAdmin') : t('voting.waitingVotes')}
          </p>
        )}
      </div>
    </div>
  )
}
