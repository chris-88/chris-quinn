import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap select-none',
    'font-mono text-sm tracking-wide uppercase rounded-md',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:translate-y-px',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-bg font-semibold shadow-[0_0_0_1px_rgba(163,230,53,0.35),0_8px_24px_-12px_rgba(163,230,53,0.55)] hover:bg-accent-hover hover:shadow-[0_0_0_1px_rgba(163,230,53,0.6),0_10px_28px_-10px_rgba(163,230,53,0.7)]',
        outline:
          'border border-line bg-surface/60 text-fg hover:border-fg/40 hover:bg-surface',
        ghost: 'text-muted hover:text-fg hover:bg-surface/80',
      },
      size: {
        default: 'h-10 px-4',
        lg: 'h-12 px-6 text-[0.95rem]',
        sm: 'h-8 px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button ref={ref} type={type} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  ),
)
Button.displayName = 'Button'
