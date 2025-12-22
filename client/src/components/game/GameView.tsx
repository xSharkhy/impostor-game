import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
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
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  pulseGlowPink,
  springBouncy,
  explosiveReveal,
  roundReveal,
  jelly,
  wobble,
} from '@/lib/motion'
import { VotingPanel } from './VotingPanel'
import { ResultsPanel } from './ResultsPanel'
import { GameOverPanel } from './GameOverPanel'

export function GameView() {
  const { word, isImpostor, turnOrder, currentRound, phase } = useGameStore()
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { nextRound, startVoting, leaveRoom } = useSocket()

  // Track round changes for animation
  const [showRoundAnnounce, setShowRoundAnnounce] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)
  const prevRoundRef = useRef(currentRound)

  useEffect(() => {
    if (currentRound !== prevRoundRef.current && phase === 'playing') {
      setShowRoundAnnounce(true)
      prevRoundRef.current = currentRound
      const timer = setTimeout(() => setShowRoundAnnounce(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [currentRound, phase])

  // Show announcement on first load too
  useEffect(() => {
    if (phase === 'playing' && currentRound >= 1) {
      setShowRoundAnnounce(true)
      const timer = setTimeout(() => setShowRoundAnnounce(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

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
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      className="relative mx-auto w-full max-w-md space-y-6"
    >
      {/* Round Announcement Overlay */}
      <AnimatePresence>
        {showRoundAnnounce && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={roundReveal}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center"
            >
              <motion.span
                className="block font-mono text-9xl font-black text-neon-cyan"
                style={{
                  textShadow: '0 0 40px rgba(0, 240, 255, 0.8), 0 0 80px rgba(0, 240, 255, 0.5), 0 0 120px rgba(0, 240, 255, 0.3)',
                }}
                variants={jelly}
                animate="animate"
              >
                {currentRound}
              </motion.span>
              <motion.span
                className="mt-2 block text-2xl font-bold text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                RONDA
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Word Display - Hero Section */}
      <motion.div variants={fadeInUp}>
        <Card variant={isImpostor ? 'glow-pink' : 'glow'} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-sm font-normal text-text-secondary">
              {isImpostor ? 'Eres el impostor' : 'Tu palabra'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={isImpostor ? 'impostor' : word}
                variants={explosiveReveal}
                initial="initial"
                animate="animate"
                className="relative"
              >
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
                    className="text-center text-4xl font-bold text-neon-cyan"
                    style={{
                      textShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)',
                    }}
                    variants={jelly}
                    whileHover="animate"
                  >
                    {word}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
            {isImpostor && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center text-sm text-text-secondary"
              >
                Descubre la palabra escuchando a los demás
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Round indicator - small badge */}
      <motion.div variants={fadeInUp} className="text-center">
        <motion.button
          className="inline-flex items-center gap-2 rounded-full border border-neon-cyan/20 bg-bg-tertiary px-4 py-1.5 text-sm font-medium text-text-secondary"
          whileHover={{ scale: 1.1, borderColor: 'var(--color-neon-cyan)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRoundAnnounce(true)}
          transition={springBouncy}
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-neon-cyan"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Ronda {currentRound}
        </motion.button>
      </motion.div>

      {/* Turn Order */}
      <motion.div variants={fadeInUp}>
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-lg">Orden de turnos</CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              {turnOrderNames.map((player, index) => (
                <motion.div
                  key={player.id}
                  variants={staggerItem}
                  whileHover={!player.isEliminated ? { x: 8, scale: 1.02 } : undefined}
                  whileTap={!player.isEliminated ? { scale: 0.98 } : undefined}
                  transition={springBouncy}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
                    player.isEliminated
                      ? 'bg-danger/10 line-through opacity-50'
                      : player.isMe
                        ? 'border border-neon-cyan/30 bg-neon-cyan/10'
                        : 'bg-bg-tertiary hover:bg-bg-elevated'
                  }`}
                >
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.08, type: 'spring', stiffness: 500, damping: 20 }}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                      player.isMe
                        ? 'bg-neon-cyan text-black'
                        : 'bg-bg-elevated text-text-secondary'
                    }`}
                  >
                    {index + 1}
                  </motion.span>
                  <span className={player.isMe ? 'font-semibold text-neon-cyan' : 'text-text-primary'}>
                    {player.name}
                    {player.isMe && (
                      <span className="ml-1.5 text-xs text-text-secondary">(tú)</span>
                    )}
                  </span>
                  {player.isEliminated && (
                    <motion.span
                      initial={{ scale: 0, rotate: -10 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="ml-auto flex items-center gap-1 rounded-full bg-bg-elevated px-2 py-0.5 text-xs text-text-tertiary"
                    >
                      <span>👻</span>
                      <span>Espectador</span>
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Admin Controls */}
      {isAdmin && (
        <motion.div variants={fadeInUp} className="space-y-3">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            variants={wobble}
          >
            <Button variant="neon" className="w-full text-base" onClick={startVoting}>
              Iniciar Votación
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="outline" className="w-full" onClick={nextRound}>
              Siguiente Ronda
            </Button>
          </motion.div>
        </motion.div>
      )}

      <motion.div variants={fadeInUp} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          variant="ghost"
          className="w-full text-text-tertiary hover:text-danger"
          onClick={() => setShowLeaveConfirm(true)}
        >
          Abandonar partida
        </Button>
      </motion.div>

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
    </motion.div>
  )
}
