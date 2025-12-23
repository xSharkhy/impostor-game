import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  [
    'flex w-full rounded-lg',
    'bg-bg-secondary',
    'border border-border',
    'px-4 py-2',
    'text-sm text-text-primary',
    'placeholder:text-text-tertiary',
    'transition-all duration-200',
    'focus:outline-none focus:border-neon-cyan/50',
    'focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)]',
    'hover:border-border-hover',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
  ],
  {
    variants: {
      variant: {
        default: '',
        glass: [
          'bg-[var(--glass-bg)]',
          'backdrop-blur-xl',
          'border-[var(--glass-border)]',
        ],
        glow: [
          'focus:border-neon-cyan',
          'focus:shadow-[0_0_20px_rgba(0,240,255,0.2)]',
        ],
        error: [
          'border-danger/50',
          'focus:border-danger',
          'focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]',
        ],
      },
      inputSize: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10',
        lg: 'h-12 px-5 text-base',
        xl: 'h-14 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'default',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, inputSize, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, inputSize }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input, inputVariants }
