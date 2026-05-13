'use client'

import { useState } from 'react'
import { useCreateProjectStore } from '@/stores/create-project'
import { Button } from '@/components/ui/button'
import type { CurriculumOutcome, ResourceType } from '@/types'

interface Props {
  onFinish: () => Promise<void>
  curriculumOutcome?: CurriculumOutcome
  resourceType?: ResourceType
}

const VISUAL_STYLES = [
  {
    id: 'bright_cartoon_classroom' as const,
    label: 'Bright Cartoon Classroom',
    icon: '🌈',
    description: "Brightboard's signature style. Colourful, warm, cartoon-inspired visuals that Foundation students love.",
    traits: ['Colourful & warm', 'Cartoon illustrations', 'Large bold text', 'Australian classroom feel'],
    preview: ['🌟', '🦋', '🌿', '🌈'],
    available: true,
  },
  {
    id: 'pastel_minimal',
    label: 'Pastel Minimal',
    subtitle: 'Coming soon',
    icon: '🍦',
    description: 'Clean pastel tones with minimal illustration. Gentle and focused.',
    traits: ['Coming in Stage 2'],
    preview: [],
    available: false,
  },
  {
    id: 'bold_primary',
    label: 'Bold Primary',
    subtitle: 'Coming soon',
    icon: '🎯',
    description: 'High-contrast primary colours for maximum classroom visibility.',
    traits: ['Coming in Stage 2'],
    preview: [],
    available: false,
  },
]

const RESOURCE_LABELS: Record<string, string> = {
  slide_deck: 'Slide Deck',
  infographic: 'Infographic',
  lesson_plan: 'Lesson Plan',
}

export function StepVisualStyle({ onFinish, curriculumOutcome, resourceType }: Props) {
  const { visualStyle, setVisualStyle, setStep } = useCreateProjectStore()
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    if (!visualStyle) return
    setLoading(true)
    await onFinish()
    setLoading(false)
  }

  return (
    <div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">Choose visual style</h2>
      <p className="text-stone-500 font-medium mb-8">
        Select the visual style for your {resourceType ? RESOURCE_LABELS[resourceType].toLowerCase() : 'resource'}.
      </p>

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {VISUAL_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => style.available && setVisualStyle(style.id as 'bright_cartoon_classroom')}
            disabled={!style.available}
            className={`
              relative text-left rounded-3xl border-2 p-6 transition-all duration-200
              ${!style.available ? 'opacity-50 cursor-not-allowed bg-stone-50 border-stone-100' :
                visualStyle === style.id
                  ? 'border-amber-400 bg-amber-50 shadow-glow cursor-pointer'
                  : 'border-amber-100 bg-white hover:border-amber-300 hover:shadow-card cursor-pointer'}
            `}
          >
            {style.available && visualStyle === style.id && (
              <div className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-white text-xs font-black">
                ✓
              </div>
            )}
            {!style.available && (
              <span className="absolute top-4 right-4 text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                Soon
              </span>
            )}

            <div className="flex gap-2 mb-4 text-3xl">
              {style.available ? style.preview.map((p, i) => <span key={i}>{p}</span>) : <span className="text-3xl">{style.icon}</span>}
            </div>
            <h3 className="font-black text-stone-900 mb-1">{style.label}</h3>
            {(style as { subtitle?: string }).subtitle && (
              <p className="text-xs font-bold text-stone-400 mb-2">{(style as { subtitle?: string }).subtitle}</p>
            )}
            <p className="text-sm text-stone-500 font-medium mb-3">{style.description}</p>
            <ul className="space-y-1">
              {style.traits.map(t => (
                <li key={t} className="text-xs font-semibold text-stone-600 flex items-center gap-1">
                  <span className="text-amber-400">✦</span> {t}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Summary */}
      {curriculumOutcome && resourceType && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 mb-6">
          <h4 className="font-black text-stone-800 mb-3">Your resource summary</h4>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <div className="flex gap-2">
              <span className="text-stone-400 font-semibold">Year level:</span>
              <span className="font-bold text-stone-700">Foundation</span>
            </div>
            <div className="flex gap-2">
              <span className="text-stone-400 font-semibold">Resource:</span>
              <span className="font-bold text-stone-700">{RESOURCE_LABELS[resourceType]}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-stone-400 font-semibold">Code:</span>
              <span className="font-bold text-stone-700 font-mono">{curriculumOutcome.code}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-stone-400 font-semibold">Topic:</span>
              <span className="font-bold text-stone-700">{curriculumOutcome.title}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setStep(4)}>← Back</Button>
        <Button
          size="lg"
          disabled={!visualStyle || loading}
          onClick={handleGenerate}
        >
          {loading ? 'Creating project…' : 'Create resource →'}
        </Button>
      </div>
    </div>
  )
}
