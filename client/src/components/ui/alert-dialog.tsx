import * as React from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'default' | 'danger' | 'neon' | 'neon-pink'
}

const AlertDialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
} | null>(null)

function useAlertDialog() {
  const context = React.useContext(AlertDialogContext)
  if (!context) {
    throw new Error('AlertDialog components must be used within AlertDialog')
  }
  return context
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  return (
    <AlertDialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </AlertDialogContext.Provider>
  )
}

export function AlertDialogTrigger({
  children,
  asChild,
}: {
  children: React.ReactNode
  asChild?: boolean
}) {
  const { onOpenChange } = useAlertDialog()

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: () => onOpenChange(true),
    })
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)}>
      {children}
    </button>
  )
}

export function AlertDialogContent({
  children,
  className,
}: AlertDialogContentProps) {
  const { open, onOpenChange } = useAlertDialog()

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onOpenChange])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          {/* Content */}
          <motion.div
            className={cn(
              'relative z-10 w-full max-w-md rounded-2xl bg-[--color-bg-elevated] p-6 shadow-xl',
              'border border-[--color-border]',
              className
            )}
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.3, bounce: 0.2 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

export function AlertDialogHeader({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function AlertDialogTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold text-[--color-text-primary]',
        className
      )}
    >
      {children}
    </h2>
  )
}

export function AlertDialogDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('mt-2 text-sm text-[--color-text-secondary]', className)}>
      {children}
    </p>
  )
}

export function AlertDialogFooter({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mt-6 flex justify-end gap-3', className)}>
      {children}
    </div>
  )
}

export function AlertDialogCancel({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { onOpenChange } = useAlertDialog()

  return (
    <Button
      variant="ghost"
      className={className}
      onClick={() => onOpenChange(false)}
      {...props}
    >
      {children || 'Cancelar'}
    </Button>
  )
}

export function AlertDialogAction({
  children,
  variant = 'default',
  className,
  onClick,
  ...props
}: AlertDialogActionProps) {
  const { onOpenChange } = useAlertDialog()

  return (
    <Button
      variant={variant}
      className={className}
      onClick={(e) => {
        onClick?.(e)
        onOpenChange(false)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}
