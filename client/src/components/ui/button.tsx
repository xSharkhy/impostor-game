import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[--color-accent-cyan] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-[--color-text] text-[--color-bg-primary] hover:bg-[--color-text]/90',
        primary:
          'bg-[--color-accent-pink] text-white hover:bg-[--color-accent-pink]/90',
        secondary:
          'bg-[--color-bg-card] text-[--color-text] hover:bg-[--color-bg-card]/80',
        outline:
          'border border-[--color-bg-card] bg-transparent text-[--color-text] hover:bg-[--color-bg-card] hover:text-[--color-text]',
        ghost:
          'text-[--color-text-muted] hover:bg-[--color-bg-card] hover:text-[--color-text]',
        link: 'text-[--color-accent-cyan] underline-offset-4 hover:underline',
        danger:
          'bg-[--color-danger] text-white hover:bg-[--color-danger]/90',
        success:
          'bg-[--color-success] text-white hover:bg-[--color-success]/90',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
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
