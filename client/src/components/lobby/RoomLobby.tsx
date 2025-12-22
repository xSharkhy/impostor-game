import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useRoomStore, useUserStore } from '@/stores'
import { CONSTANTS } from '@impostor/shared'

export function RoomLobby() {
  const { room } = useRoomStore()
  const { user } = useUserStore()
  const { leaveRoom, kickPlayer, startGame } = useSocket()

  if (!room || !user) return null

  const isAdmin = room.adminId === user.id
  const canStart = room.players.length >= CONSTANTS.MIN_PLAYERS

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <div className="text-center">
        <p className="text-sm text-[--color-text-muted]">Código de sala</p>
        <p className="text-4xl font-bold tracking-widest text-[--color-accent-cyan]">
          {room.code}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Jugadores ({room.players.length})</span>
            {!canStart && (
              <span className="text-xs font-normal text-[--color-text-muted]">
                Mínimo {CONSTANTS.MIN_PLAYERS}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {room.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-md bg-[--color-bg-primary] px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    player.isConnected
                      ? 'bg-[--color-success]'
                      : 'bg-[--color-text-muted]'
                  }`}
                />
                <span>{player.displayName}</span>
                {player.id === room.adminId && (
                  <span className="text-xs text-[--color-accent-yellow]">
                    Admin
                  </span>
                )}
              </div>
              {isAdmin && player.id !== user.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[--color-danger]"
                  onClick={() => kickPlayer(player.id)}
                >
                  Expulsar
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-3">
        {isAdmin && (
          <Button
            className="w-full"
            disabled={!canStart}
            onClick={() => startGame()}
          >
            {canStart ? 'Iniciar Partida' : `Esperando jugadores...`}
          </Button>
        )}
        <Button variant="outline" className="w-full" onClick={leaveRoom}>
          Salir de la sala
        </Button>
      </div>
    </div>
  )
}
