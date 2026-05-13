'use client'

import { cn } from '@/lib/utils'

interface Step {
  num: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center flex-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full font-black text-sm transition-all duration-300',
                currentStep === step.num
                  ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md scale-110'
                  : currentStep > step.num
                  ? 'bg-teal-400 text-white'
                  : 'bg-amber-100 text-stone-400'
              )}
            >
              {currentStep > step.num ? '✓' : step.num}
            </div>
            <span
              className={cn(
                'text-xs font-bold hidden sm:block',
                currentStep === step.num ? 'text-amber-600' : currentStep > step.num ? 'text-teal-600' : 'text-stone-400'
              )}
            >
              {step.label}
            </span>
          </div>

          {i < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-0.5 mx-2 transition-colors duration-300',
                currentStep > step.num ? 'bg-teal-300' : 'bg-amber-100'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
