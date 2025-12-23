import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Card, CardContent } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useRoomStore } from '@/stores'
import { CONSTANTS } from '@impostor/shared'

export function JoinRoom({ onBack }: { onBack: () => void }) {
  const [code, setCode] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { joinRoom } = useSocket()
  const { error, isConnecting } = useRoomStore()
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length === CONSTANTS.CODE_LENGTH) {
      joinRoom(code.toUpperCase())
    }
  }

  const isValid = code.length === CONSTANTS.CODE_LENGTH

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold">Unirse a sala</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Introduce el código de 4 letras
        </p>
      </div>

      {/* Code Input Card */}
      <Card
        variant={isFocused ? 'glow' : 'glass'}
        className="overflow-hidden transition-all duration-300"
      >
        <CardContent className="py-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Code Display */}
            <div className={`relative ${error ? 'animate-shake' : ''}`}>
              <div className="flex justify-center gap-3">
                {Array.from({ length: CONSTANTS.CODE_LENGTH }).map((_, i) => {
                  const char = code[i] || ''
                  const isActive = i === code.length && isFocused
                  const isFilled = char !== ''

                  return (
                    <div
                      key={i}
                      className={`relative flex h-16 w-14 items-center justify-center rounded-xl border-2 text-3xl font-bold transition-all duration-200 ${
                        isActive
                          ? 'border-neon-cyan bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                          : isFilled
                            ? 'border-neon-cyan/50 bg-bg-elevated text-neon-cyan'
                            : 'border-border bg-bg-tertiary text-text-tertiary'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {char && (
                          <motion.span
                            key={char}
                            initial={{ scale: 0, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0, y: -10 }}
                            className="font-mono"
                            style={isFilled ? {
                              textShadow: '0 0 10px rgba(0, 240, 255, 0.5)',
                            } : undefined}
                          >
                            {char}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Cursor */}
                      {isActive && (
                        <motion.div
                          className="absolute bottom-3 h-1 w-6 rounded-full bg-neon-cyan"
                          animate={{ opacity: [1, 0, 1] }}
                          transition={{ duration: 0.8, repeat: Infinity }}
                        />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Hidden input for actual typing */}
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, CONSTANTS.CODE_LENGTH))}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="absolute inset-0 opacity-0"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
            </div>

            {/* Error message */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center text-sm text-danger"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <Button
              type="submit"
              variant={isValid ? 'neon' : 'outline'}
              className="w-full"
              disabled={!isValid || isConnecting}
              isLoading={isConnecting}
            >
              {isConnecting ? 'Conectando...' : 'Unirse'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hint */}
      <p className="text-center text-xs text-text-tertiary">
        El código aparece en la pantalla del admin
      </p>

      {/* Back button */}
      <Button variant="ghost" className="w-full" onClick={onBack}>
        Volver
      </Button>
    </div>
  )
}
