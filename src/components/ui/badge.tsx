import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-semibold text-xs px-3 py-1 border',
  {
    variants: {
      variant: {
        default: 'bg-amber-100 text-amber-800 border-amber-200',
        secondary: 'bg-stone-100 text-stone-700 border-stone-200',
        success: 'bg-green-100 text-green-700 border-green-200',
        warning: 'bg-orange-100 text-orange-700 border-orange-200',
        info: 'bg-sky-100 text-sky-700 border-sky-200',
        violet: 'bg-violet-100 text-violet-700 border-violet-200',
        coral: 'bg-red-100 text-red-700 border-red-200',
        outline: 'bg-transparent border-current',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
