import { useState } from 'react'
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
import { useRoomStore, useUserStore } from '@/stores'
import { CONSTANTS } from '@impostor/shared'

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
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* Room Code Display */}
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary">
          Código de sala
        </p>
        <div className="mt-2">
          <p
            className="font-mono text-5xl font-bold tracking-[0.3em] text-accent"
            style={{
              textShadow: '0 0 30px rgba(168, 85, 247, 0.5), 0 0 60px rgba(168, 85, 247, 0.3)',
            }}
          >
            {room.code}
          </p>
        </div>
        <p className="mt-2 text-xs text-text-tertiary">
          Comparte este código con tus amigos
        </p>
      </div>

      {/* Players List */}
      <div>
        <Card variant="glass">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                Jugadores
                <span className="rounded-full bg-bg-elevated px-2 py-0.5 text-sm font-normal text-text-secondary">
                  {room.players.length}
                </span>
              </span>
              {!canStart && (
                <span className="text-xs font-normal text-text-tertiary">
                  Mínimo {CONSTANTS.MIN_PLAYERS}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {room.players.map((player) => {
                const isMe = player.id === user.id
                const isPlayerAdmin = player.id === room.adminId

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                      isMe
                        ? 'border border-accent/30 bg-accent/5'
                        : 'bg-bg-tertiary'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Connection status */}
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          player.isConnected
                            ? 'bg-success'
                            : 'bg-text-tertiary'
                        }`}
                      />

                      {/* Avatar */}
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                          isPlayerAdmin
                            ? 'bg-neon-yellow text-black'
                            : isMe
                              ? 'bg-accent text-white'
                              : 'bg-bg-elevated text-text-secondary'
                        }`}
                      >
                        {player.displayName.charAt(0).toUpperCase()}
                      </div>

                      {/* Name */}
                      <div className="flex flex-col">
                        <span className={`font-medium ${isMe ? 'text-accent' : 'text-text-primary'}`}>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-text-tertiary hover:text-danger"
                        onClick={() => setPlayerToKick({ id: player.id, name: player.displayName })}
                      >
                        Expulsar
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Waiting indicator */}
      {!canStart && (
        <div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-bg-tertiary px-4 py-3">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-2 w-2 rounded-full bg-accent"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
          <span className="text-sm text-text-secondary">
            Esperando {playersNeeded} {playersNeeded === 1 ? 'jugador más' : 'jugadores más'}...
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isAdmin && (
          <Button
            variant={canStart ? 'neon' : 'outline'}
            className="w-full"
            disabled={!canStart}
            onClick={() => startGame()}
          >
            {canStart ? 'Iniciar Partida' : `Esperando jugadores...`}
          </Button>
        )}

        {!isAdmin && (
          <div className="flex items-center justify-center gap-2 text-sm text-text-tertiary">
            <motion.span
              className="h-2 w-2 rounded-full bg-accent"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            Esperando al admin...
          </div>
        )}

        <Button
          variant="ghost"
          className="w-full text-text-tertiary hover:text-danger"
          onClick={() => setShowLeaveConfirm(true)}
        >
          Salir de la sala
        </Button>
      </div>

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
    </div>
  )
}
