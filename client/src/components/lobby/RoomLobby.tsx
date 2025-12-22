import { useState } from 'react'
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
import { useRoomStore, useUserStore } from '@/stores'
import { CONSTANTS } from '@impostor/shared'
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  springBouncy,
  popIn,
} from '@/lib/motion'

export function RoomLobby() {
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { leaveRoom, kickPlayer, startGame } = useSocket()
  const [playerToKick, setPlayerToKick] = useState<{ id: string; name: string } | null>(null)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  if (!room || !user) return null

  const isAdmin = room.adminId === user.id
  const canStart = room.players.length >= CONSTANTS.MIN_PLAYERS
  const playersNeeded = CONSTANTS.MIN_PLAYERS - room.players.length

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      className="mx-auto w-full max-w-md space-y-6"
    >
      {/* Room Code Display */}
      <motion.div variants={fadeInUp} className="text-center">
        <motion.p
          className="text-sm font-medium text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Código de sala
        </motion.p>
        <motion.div
          className="mt-2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={springBouncy}
        >
          <motion.p
            className="font-mono text-5xl font-bold tracking-[0.3em] text-neon-cyan"
            style={{
              textShadow: '0 0 30px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.3)',
            }}
            whileHover={{ scale: 1.05 }}
            transition={springBouncy}
          >
            {room.code}
          </motion.p>
        </motion.div>
        <motion.p
          className="mt-2 text-xs text-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Comparte este código con tus amigos
        </motion.p>
      </motion.div>

      {/* Players List */}
      <motion.div variants={fadeInUp}>
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                Jugadores
                <motion.span
                  key={room.players.length}
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-full bg-bg-elevated px-2 py-0.5 text-sm font-normal text-text-secondary"
                >
                  {room.players.length}
                </motion.span>
              </span>
              {!canStart && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs font-normal text-text-tertiary"
                >
                  Mínimo {CONSTANTS.MIN_PLAYERS}
                </motion.span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-2"
            >
              <AnimatePresence mode="popLayout">
                {room.players.map((player, index) => {
                  const isMe = player.id === user.id
                  const isPlayerAdmin = player.id === room.adminId

                  return (
                    <motion.div
                      key={player.id}
                      variants={staggerItem}
                      layout
                      initial={{ opacity: 0, x: -20, scale: 0.8 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 20, scale: 0.8 }}
                      transition={{ delay: index * 0.05, ...springBouncy }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(0, 240, 255, 0.03)' }}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                        isMe
                          ? 'border border-neon-cyan/30 bg-neon-cyan/5'
                          : 'bg-bg-tertiary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Connection status */}
                        <motion.div
                          className={`h-2.5 w-2.5 rounded-full ${
                            player.isConnected
                              ? 'bg-success'
                              : 'bg-text-tertiary'
                          }`}
                          animate={player.isConnected ? {
                            boxShadow: [
                              '0 0 0 0 rgba(34, 197, 94, 0.4)',
                              '0 0 0 8px rgba(34, 197, 94, 0)',
                            ],
                          } : undefined}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {/* Avatar */}
                        <motion.div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isPlayerAdmin
                              ? 'bg-neon-yellow text-black'
                              : isMe
                                ? 'bg-neon-cyan text-black'
                                : 'bg-bg-elevated text-text-secondary'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          transition={springBouncy}
                        >
                          {player.displayName.charAt(0).toUpperCase()}
                        </motion.div>

                        {/* Name */}
                        <div className="flex flex-col">
                          <span className={`font-medium ${isMe ? 'text-neon-cyan' : 'text-text-primary'}`}>
                            {player.displayName}
                            {isMe && (
                              <span className="ml-1.5 text-xs text-text-secondary">(tú)</span>
                            )}
                          </span>
                          {isPlayerAdmin && (
                            <span className="text-xs text-neon-yellow">Admin</span>
                          )}
                        </div>
                      </div>

                      {/* Kick button */}
                      {isAdmin && player.id !== user.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-text-tertiary hover:text-danger"
                            onClick={() => setPlayerToKick({ id: player.id, name: player.displayName })}
                          >
                            Expulsar
                          </Button>
                        </motion.div>
                      )}
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Waiting indicator */}
      {!canStart && (
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-3 rounded-lg border border-border bg-bg-tertiary px-4 py-3"
        >
          <motion.div
            className="flex gap-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-neon-cyan"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </motion.div>
          <span className="text-sm text-text-secondary">
            Esperando {playersNeeded} {playersNeeded === 1 ? 'jugador más' : 'jugadores más'}...
          </span>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div variants={fadeInUp} className="space-y-3">
        {isAdmin && (
          <motion.div
            variants={popIn}
            whileHover={{ scale: canStart ? 1.02 : 1 }}
            whileTap={{ scale: canStart ? 0.98 : 1 }}
          >
            <Button
              variant={canStart ? 'neon' : 'outline'}
              className="w-full"
              disabled={!canStart}
              onClick={() => startGame()}
            >
              {canStart ? 'Iniciar Partida' : `Esperando jugadores...`}
            </Button>
          </motion.div>
        )}

        {!isAdmin && (
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-2 text-sm text-text-tertiary"
          >
            <motion.span
              className="h-2 w-2 rounded-full bg-neon-cyan"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Esperando al admin...
          </motion.div>
        )}

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            className="w-full text-text-tertiary hover:text-danger"
            onClick={() => setShowLeaveConfirm(true)}
          >
            Salir de la sala
          </Button>
        </motion.div>
      </motion.div>

      {/* Kick confirmation dialog */}
      <AlertDialog open={!!playerToKick} onOpenChange={(open) => !open && setPlayerToKick(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Expulsar jugador</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres expulsar a <strong>{playerToKick?.name}</strong> de la sala?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={() => {
                if (playerToKick) kickPlayer(playerToKick.id)
              }}
            >
              Expulsar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Leave confirmation dialog */}
      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Salir de la sala</AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin
                ? 'Eres el admin. Si sales, otro jugador será asignado como admin.'
                : '¿Estás seguro de que quieres salir de la sala?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="danger" onClick={leaveRoom}>
              Salir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
