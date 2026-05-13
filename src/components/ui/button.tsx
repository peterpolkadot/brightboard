import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        coral: 'bg-gradient-to-r from-red-400 to-rose-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        sky: 'bg-gradient-to-r from-teal-400 to-cyan-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        violet: 'bg-gradient-to-r from-violet-400 to-purple-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        outline: 'border-2 border-amber-300 bg-white text-amber-700 hover:bg-amber-50 hover:border-amber-400',
        ghost: 'text-stone-600 hover:bg-amber-100 hover:text-stone-800',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        secondary: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
        link: 'text-amber-600 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-11 px-6 py-2 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-13 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
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
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

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
