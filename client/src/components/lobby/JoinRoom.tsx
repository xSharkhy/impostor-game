import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Card, CardContent } from '@/components/ui'
import { useSocket } from '@/hooks'
import { useRoomStore } from '@/stores'
import { CONSTANTS } from '@impostor/shared'
import {
  fadeInUp,
  staggerContainer,
  springBouncy,
  shakeAnimation,
} from '@/lib/motion'

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
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={staggerContainer}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center">
        <motion.h2
          className="text-2xl font-bold"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springBouncy}
        >
          Unirse a sala
        </motion.h2>
        <motion.p
          className="mt-1 text-sm text-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Introduce el código de 4 letras
        </motion.p>
      </motion.div>

      {/* Code Input Card */}
      <motion.div variants={fadeInUp}>
        <Card
          variant={isFocused ? 'glow' : 'glass'}
          className="overflow-hidden transition-all duration-300"
        >
          <CardContent className="py-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Code Display */}
              <motion.div
                className="relative"
                variants={error ? shakeAnimation : undefined}
                animate={error ? 'animate' : undefined}
              >
                <div className="flex justify-center gap-3">
                  {Array.from({ length: CONSTANTS.CODE_LENGTH }).map((_, i) => {
                    const char = code[i] || ''
                    const isActive = i === code.length && isFocused
                    const isFilled = char !== ''

                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.05, ...springBouncy }}
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
                              transition={springBouncy}
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
                      </motion.div>
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
              </motion.div>

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
              <motion.div
                whileHover={{ scale: isValid && !isConnecting ? 1.02 : 1 }}
                whileTap={{ scale: isValid && !isConnecting ? 0.98 : 1 }}
              >
                <Button
                  type="submit"
                  variant={isValid ? 'neon' : 'outline'}
                  className="w-full"
                  disabled={!isValid || isConnecting}
                  isLoading={isConnecting}
                >
                  {isConnecting ? 'Conectando...' : 'Unirse'}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Hint */}
      <motion.p
        variants={fadeInUp}
        className="text-center text-xs text-text-tertiary"
      >
        El código aparece en la pantalla del admin
      </motion.p>

      {/* Back button */}
      <motion.div
        variants={fadeInUp}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button variant="ghost" className="w-full" onClick={onBack}>
          Volver
        </Button>
      </motion.div>
    </motion.div>
  )
}
