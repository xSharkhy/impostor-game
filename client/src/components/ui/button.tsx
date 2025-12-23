import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * GUÍA DE USO DE VARIANTES:
 *
 * ESTÁNDAR:
 * - default     : Acción principal (blanco sobre negro, estilo Vercel)
 * - secondary   : Acción secundaria con borde
 * - outline     : Acción terciaria, solo borde
 * - ghost       : Acción mínima, sin fondo ni borde
 * - link        : Estilo de enlace
 * - danger      : Acciones destructivas (eliminar, expulsar)
 * - success     : Confirmaciones positivas
 *
 * PARTY/NEON (usar con moderación):
 * - neon            : CTAs importantes del juego (cyan glow)
 * - neon-pink       : Acciones relacionadas con impostor
 * - neon-outline    : CTAs secundarios con glow (cyan)
 * - neon-outline-pink: CTAs secundarios con glow (pink)
 * - gradient        : Solo para momentos de celebración
 */
const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2',
    'whitespace-nowrap rounded-lg',
    'text-sm font-medium',
    'transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // Primary - White on black (Vercel style)
        default: [
          'bg-text-primary text-bg-primary',
          'hover:bg-text-primary/90',
          'shadow-sm',
        ],
        // Secondary - Subtle background
        secondary: [
          'bg-bg-elevated text-text-primary',
          'border border-border',
          'hover:bg-bg-tertiary hover:border-border-hover',
        ],
        // Outline - Transparent with border
        outline: [
          'bg-transparent text-text-primary',
          'border border-border',
          'hover:bg-bg-elevated hover:border-border-hover',
        ],
        // Ghost - No background
        ghost: [
          'bg-transparent text-text-secondary',
          'hover:bg-bg-elevated hover:text-text-primary',
        ],
        // Link style
        link: [
          'bg-transparent text-neon-cyan',
          'underline-offset-4 hover:underline',
          'p-0 h-auto',
        ],
        // Danger
        danger: [
          'bg-danger text-white',
          'hover:bg-danger/90',
          'shadow-sm',
        ],
        // Success
        success: [
          'bg-success text-white',
          'hover:bg-success/90',
          'shadow-sm',
        ],
        // === PARTY / GLOW VARIANTS ===
        // Neon Cyan (Crew)
        neon: [
          'bg-neon-cyan text-black font-semibold',
          'shadow-[0_0_15px_rgba(0,240,255,0.3)]',
          'hover:shadow-[0_0_25px_rgba(0,240,255,0.5)]',
          'hover:bg-neon-cyan/90',
        ],
        // Neon Pink (Impostor)
        'neon-pink': [
          'bg-neon-pink text-white font-semibold',
          'shadow-[0_0_15px_rgba(255,45,106,0.3)]',
          'hover:shadow-[0_0_25px_rgba(255,45,106,0.5)]',
          'hover:bg-neon-pink/90',
        ],
        // Neon outline (fills on hover for better contrast)
        'neon-outline': [
          'bg-transparent text-neon-cyan',
          'border border-neon-cyan/50',
          'hover:border-neon-cyan',
          'hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]',
          'hover:bg-neon-cyan hover:text-black',
        ],
        'neon-outline-pink': [
          'bg-transparent text-neon-pink',
          'border border-neon-pink/50',
          'hover:border-neon-pink',
          'hover:shadow-[0_0_20px_rgba(255,45,106,0.4)]',
          'hover:bg-neon-pink hover:text-white',
        ],
        // Gradient party button
        gradient: [
          'bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink',
          'text-white font-semibold',
          'shadow-lg',
          'hover:opacity-90',
          'bg-[length:200%_200%]',
          'animate-gradient',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs rounded-md',
        default: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10 p-0',
        'icon-sm': 'h-8 w-8 p-0 rounded-md',
        'icon-lg': 'h-12 w-12 p-0',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
