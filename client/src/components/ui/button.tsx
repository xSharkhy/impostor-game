import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[--color-accent-cyan] text-[--color-bg-primary] hover:scale-105 active:scale-95',
        primary:
          'bg-[--color-accent-pink] text-white hover:scale-105 active:scale-95',
        secondary:
          'bg-[--color-accent-purple] text-white hover:scale-105 active:scale-95',
        outline:
          'border-2 border-[--color-accent-purple] text-[--color-accent-purple] bg-transparent hover:bg-[--color-accent-purple]/10',
        ghost:
          'text-[--color-text-muted] hover:bg-[--color-bg-card] hover:text-[--color-text]',
        danger:
          'bg-[--color-danger] text-white hover:scale-105 active:scale-95',
        success:
          'bg-[--color-success] text-white hover:scale-105 active:scale-95',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
