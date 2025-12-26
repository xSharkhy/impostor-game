import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
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
import { fadeInScale, wordReveal, pulseGlowPink, springBouncy, staggerContainer, listItem, hoverLift } from '@/lib/motion'
import { WordCollectionPanel } from './WordCollectionPanel'
import { VotingPanel } from './VotingPanel'
import { ResultsPanel } from './ResultsPanel'
import { GameOverPanel } from './GameOverPanel'
import { RoundTransition } from './RoundTransition'

export function GameView() {
  const { t } = useTranslation()
  const { word, isImpostor, turnOrder, currentRound, phase, impostorCount } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { nextRound, startVoting, leaveRoom } = useSocket()

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const [showRoundTransition, setShowRoundTransition] = useState(false)
  const previousRoundRef = useRef(currentRound)
  const previousPhaseRef = useRef(phase)

  // Show round transition when round changes or game starts
  useEffect(() => {
    const roundChanged = currentRound !== previousRoundRef.current && currentRound > 0
    const gameJustStarted = phase === 'playing' && previousPhaseRef.current !== 'playing' && currentRound > 0

    if (roundChanged || gameJustStarted) {
      setShowRoundTransition(true)
    }

    previousRoundRef.current = currentRound
    previousPhaseRef.current = phase
  }, [currentRound, phase])

  const handleRoundTransitionComplete = useCallback(() => {
    setShowRoundTransition(false)
  }, [])

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
      <motion.div
        variants={fadeInScale}
        initial="initial"
        animate="animate"
        transition={springBouncy}
      >
        <Card variant={isImpostor ? 'glow-pink' : 'glow'} className="overflow-hidden">
          <CardHeader className="pb-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, ...springBouncy }}
            >
              <CardTitle className="text-center text-sm font-normal text-text-secondary">
                {isImpostor ? t('game.youAreImpostor') : t('game.yourWord')}
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="relative">
              {isImpostor ? (
                <motion.p
                  className="text-center text-6xl font-black text-neon-pink"
                  variants={pulseGlowPink}
                  initial="initial"
                  animate="animate"
                >
                  ???
                </motion.p>
              ) : (
                <motion.p
                  className="text-center text-4xl font-bold text-neon-green"
                  variants={wordReveal}
                  initial="initial"
                  animate="animate"
                  style={{
                    textShadow: '0 0 20px rgba(34, 255, 136, 0.5), 0 0 40px rgba(34, 255, 136, 0.3)',
                  }}
                >
                  {word}
                </motion.p>
              )}
            </div>
            {isImpostor && (
              <motion.p
                className="mt-4 text-center text-sm text-text-secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {t('game.discoverWord')}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Round and impostor indicator - small badges */}
      <motion.div
        className="flex items-center justify-center gap-2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, ...springBouncy }}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-bg-tertiary px-4 py-1.5 text-sm font-medium text-text-secondary">
          <motion.span
            className="h-2 w-2 rounded-full bg-accent"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.7, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {t('game.round', { number: currentRound })}
        </span>
        {impostorCount > 1 && (
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-neon-pink/20 bg-bg-tertiary px-4 py-1.5 text-sm font-medium text-text-secondary"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, ...springBouncy }}
          >
            <motion.span
              className="h-2 w-2 rounded-full bg-neon-pink"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [1, 0.6, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            {t('game.impostorCount', { count: impostorCount })}
          </motion.span>
        )}
      </motion.div>

      {/* Turn Order */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, ...springBouncy }}
      >
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">{t('game.turnOrder')}</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              className="space-y-2"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {turnOrderNames.map((player, index) => (
                <motion.div
                  key={player.id}
                  variants={listItem}
                  whileHover={player.isEliminated ? undefined : hoverLift}
                  className={`flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    player.isEliminated
                      ? 'bg-danger/10 line-through opacity-50'
                      : player.isMe
                        ? 'border border-accent/30 bg-accent/10'
                        : 'bg-bg-tertiary hover:bg-bg-elevated'
                  }`}
                >
                  <motion.span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      player.isMe
                        ? 'bg-accent text-white'
                        : 'bg-bg-elevated text-text-secondary'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.05, type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    {index + 1}
                  </motion.span>
                  <span className={player.isMe ? 'font-semibold text-accent' : 'text-text-primary'}>
                    {player.name}
                    {player.isMe && (
                      <span className="ml-1.5 text-xs text-text-secondary">{t('common.you')}</span>
                    )}
                  </span>
                  {player.isEliminated && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-tertiary">
                      <span aria-hidden="true">👻</span>
                      <span>{t('game.spectator')}</span>
                    </span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

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

      {/* Round transition overlay */}
      <RoundTransition
        round={currentRound}
        show={showRoundTransition}
        onComplete={handleRoundTransitionComplete}
      />

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
