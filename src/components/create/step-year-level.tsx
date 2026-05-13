'use client'

import { useCreateProjectStore } from '@/stores/create-project'

const YEAR_LEVELS = [
  {
    id: 'foundation' as const,
    label: 'Foundation',
    subtitle: 'Age 5–6 · Prep / Kindy',
    icon: '🌱',
    description: 'The first year of formal schooling. Visual-first, play-based learning.',
    color: 'from-amber-400 to-orange-400',
    available: true,
  },
  {
    id: 'year1' as const,
    label: 'Year 1',
    subtitle: 'Coming soon',
    icon: '🌿',
    description: 'Year 1 curriculum support — coming in Stage 2.',
    color: 'from-stone-300 to-stone-300',
    available: false,
  },
  {
    id: 'year2' as const,
    label: 'Year 2',
    subtitle: 'Coming soon',
    icon: '🌳',
    description: 'Year 2 curriculum support — coming in Stage 2.',
    color: 'from-stone-300 to-stone-300',
    available: false,
  },
]

export function StepYearLevel() {
  const { setYearLevel } = useCreateProjectStore()

  return (
    <div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">Select year level</h2>
      <p className="text-stone-500 font-medium mb-8">Which year level are you creating for?</p>

      <div className="grid sm:grid-cols-3 gap-4">
        {YEAR_LEVELS.map(level => (
          <button
            key={level.id}
            onClick={() => level.available && setYearLevel(level.id as 'foundation')}
            disabled={!level.available}
            className={`
              relative text-left rounded-3xl border-2 p-6 transition-all duration-200 group
              ${level.available
                ? 'border-amber-100 hover:border-amber-300 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer bg-white'
                : 'border-stone-100 bg-stone-50 cursor-not-allowed opacity-60'
              }
            `}
          >
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${level.color} text-2xl shadow-sm mb-4`}>
              {level.icon}
            </div>
            <h3 className="font-black text-stone-900 mb-1">{level.label}</h3>
            <p className="text-xs font-bold text-stone-400 mb-2">{level.subtitle}</p>
            <p className="text-sm text-stone-500 font-medium">{level.description}</p>
            {!level.available && (
              <span className="absolute top-4 right-4 text-xs font-bold text-stone-400 bg-stone-100 px-2 py-1 rounded-full">
                Soon
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
