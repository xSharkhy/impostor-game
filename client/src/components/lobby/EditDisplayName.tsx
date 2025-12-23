import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button, Input } from '@/components/ui'
import { useUserStore } from '@/stores'
import { useProfile } from '@/hooks'

interface EditDisplayNameProps {
  className?: string
}

export function EditDisplayName({ className }: EditDisplayNameProps) {
  const { user } = useUserStore()
  const { updateDisplayName, isUpdating, error, clearError } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(user?.displayName || '')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [isEditing])

  // Sync name with user store
  useEffect(() => {
    if (user?.displayName) {
      setName(user.displayName)
    }
  }, [user?.displayName])

  const handleEdit = () => {
    clearError()
    setIsEditing(true)
  }

  const handleCancel = () => {
    setName(user?.displayName || '')
    clearError()
    setIsEditing(false)
  }

  const handleSave = async () => {
    const success = await updateDisplayName(name)
    if (success) {
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (!user) return null

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tu nombre"
                maxLength={20}
                className="flex-1"
                disabled={isUpdating}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isUpdating}
                className="shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </Button>
              <Button
                size="sm"
                variant="neon"
                onClick={handleSave}
                disabled={isUpdating || name.trim().length < 2}
                isLoading={isUpdating}
                className="shrink-0"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </Button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-danger"
              >
                {error}
              </motion.p>
            )}
            <p className="text-xs text-text-tertiary">2-20 caracteres</p>
          </motion.div>
        ) : (
          <motion.button
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={handleEdit}
            className="group flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary"
          >
            <span className="truncate font-medium">{user.displayName}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
            >
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
