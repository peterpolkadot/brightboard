'use client'

import { useCreateProjectStore } from '@/stores/create-project'
import { Button } from '@/components/ui/button'
import { getSubjectOptions } from '@/data/curriculum'

const SUBJECT_COLORS = [
  { color: 'from-teal-400 to-cyan-400', bg: 'bg-teal-50', border: 'border-teal-200' },
  { color: 'from-violet-400 to-purple-400', bg: 'bg-violet-50', border: 'border-violet-200' },
  { color: 'from-amber-400 to-orange-400', bg: 'bg-amber-50', border: 'border-amber-200' },
  { color: 'from-emerald-400 to-teal-400', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { color: 'from-rose-400 to-pink-400', bg: 'bg-rose-50', border: 'border-rose-200' },
]

const SUBJECT_ICONS: Record<string, string> = {
  English: '📚',
  Mathematics: '🔢',
  Science: '🔬',
  'Health and Physical Education': '🏃',
  'HASS F-6': '🗺️',
  Dance: '🎵',
  Drama: '🎭',
  Music: '🎶',
  'Visual Arts': '🎨',
  Technologies: '💡',
}

const FEATURED_SUBJECTS = new Set([
  'Science',
  'English',
  'Mathematics',
  'HASS F-6',
  'Health and Physical Education',
])

export function StepSubject() {
  const { setSubject, setStep } = useCreateProjectStore()
  const subjects = getSubjectOptions()
  const featured = subjects.filter(subject => FEATURED_SUBJECTS.has(subject.id))
  const other = subjects.filter(subject => !FEATURED_SUBJECTS.has(subject.id))

  return (
    <div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">Select subject</h2>
      <p className="text-stone-500 font-medium mb-8">Which subject area are you creating content for?</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {featured.map((subject, index) => {
          const style = SUBJECT_COLORS[index % SUBJECT_COLORS.length]
          return (
            <button
              key={subject.id}
              onClick={() => setSubject(subject.id)}
              className={`text-left rounded-3xl border-2 p-6 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer bg-white ${style.border}`}
            >
              <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${style.color} text-3xl shadow-md mb-5`}>
                {SUBJECT_ICONS[subject.label] ?? '✨'}
              </div>
              <h3 className="text-xl font-black text-stone-900 mb-2">{subject.label}</h3>
              <p className="text-stone-500 font-medium text-sm mb-4 leading-relaxed">
                {subject.count} Foundation curriculum outcomes available.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${style.bg} text-stone-600`}>
                  Australian Curriculum
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {other.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-black uppercase tracking-wide text-stone-400 mb-3">More Foundation subjects</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {other.map(subject => (
              <button
                key={subject.id}
                onClick={() => setSubject(subject.id)}
                className="text-left rounded-2xl border border-amber-100 bg-white p-4 hover:border-amber-300 hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-stone-800">{subject.label}</span>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                    {subject.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 text-center">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← Back</Button>
      </div>
    </div>
  )
}
