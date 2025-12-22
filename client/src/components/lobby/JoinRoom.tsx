import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useRoomStore } from '@/stores'
import { CONSTANTS } from '@impostor/shared'

export function JoinRoom({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('')
  const { joinRoom } = useSocket()
  const { error, isConnecting } = useRoomStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === CONSTANTS.CODE_LENGTH) {
      joinRoom(code.toUpperCase())
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-[--color-text-muted]">
            Código de sala
          </label>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX"
            maxLength={CONSTANTS.CODE_LENGTH}
            className="text-center text-2xl tracking-widest"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-center text-sm text-[--color-danger]">{error}</p>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={code.length !== CONSTANTS.CODE_LENGTH || isConnecting}
        >
          {isConnecting ? 'Conectando...' : 'Unirse'}
        </Button>
      </form>
      <Button variant="ghost" className="w-full" onClick={onBack}>
        Volver
      </Button>
    </div>
  )
}
