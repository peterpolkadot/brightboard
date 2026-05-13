'use client'

import { useCreateProjectStore } from '@/stores/create-project'
import { Button } from '@/components/ui/button'
import type { ResourceType } from '@/types'

const RESOURCE_TYPES = [
  {
    id: 'slide_deck' as ResourceType,
    label: 'Slide Deck',
    icon: '🎨',
    description: 'A multi-slide presentation designed for displaying on a classroom screen. Each slide is generated and approved individually.',
    features: ['8–12 slides', 'Title + content + activity + summary', 'Export as PDF or image pack'],
    color: 'from-amber-400 to-orange-400',
    border: 'border-amber-200',
  },
  {
    id: 'infographic' as ResourceType,
    label: 'Infographic',
    icon: '🖼️',
    description: 'A single-page visual resource your students can refer to. Perfect for lifecycles, processes, and key concepts.',
    features: ['1 page, print-ready', 'Minimal text, maximum visuals', 'Export as PDF or image'],
    color: 'from-teal-400 to-cyan-400',
    border: 'border-teal-200',
  },
  {
    id: 'lesson_plan' as ResourceType,
    label: 'Lesson Plan',
    icon: '📋',
    description: 'A complete lesson plan aligned to your chosen curriculum outcome, written in practical classroom language.',
    features: ['Learning intention & success criteria', 'Activities, discussion prompts & assessment', 'Export as PDF'],
    color: 'from-violet-400 to-purple-400',
    border: 'border-violet-200',
  },
]

export function StepResourceType() {
  const { setResourceType, setStep } = useCreateProjectStore()

  return (
    <div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">Select resource type</h2>
      <p className="text-stone-500 font-medium mb-8">What would you like to create?</p>

      <div className="grid sm:grid-cols-3 gap-5">
        {RESOURCE_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setResourceType(type.id)}
            className={`text-left rounded-3xl border-2 ${type.border} p-6 bg-white hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer group`}
          >
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${type.color} text-3xl shadow-md mb-5`}>
              {type.icon}
            </div>
            <h3 className="text-lg font-black text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
              {type.label}
            </h3>
            <p className="text-sm text-stone-500 font-medium leading-relaxed mb-4">{type.description}</p>
            <ul className="space-y-1.5">
              {type.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-xs font-semibold text-stone-600">
                  <span className="text-teal-500 mt-0.5">✓</span>
                  {f}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={() => setStep(3)}>← Back</Button>
      </div>
    </div>
  )
}
