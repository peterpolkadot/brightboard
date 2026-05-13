'use client'

import { useCreateProjectStore } from '@/stores/create-project'
import { Button } from '@/components/ui/button'

const SUBJECTS = [
  {
    id: 'science' as const,
    label: 'Science',
    icon: '🔬',
    description: 'Biological, Physical, and Earth & Space sciences aligned to the Australian Curriculum.',
    topics: ['Living things', 'Lifecycles', 'Properties of objects', 'Weather & seasons', 'Forces'],
    color: 'from-teal-400 to-cyan-400',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    primary: true,
  },
  {
    id: 'english' as const,
    label: 'English',
    icon: '📚',
    description: 'Language, literacy, and literature outcomes for Foundation learners.',
    topics: ['Phonics', 'Text structure', 'Narrative', 'Oral language'],
    color: 'from-violet-400 to-purple-400',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    primary: true,
  },
]

export function StepSubject() {
  const { setSubject, setStep } = useCreateProjectStore()

  return (
    <div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">Select subject</h2>
      <p className="text-stone-500 font-medium mb-8">Which subject area are you creating content for?</p>

      <div className="grid sm:grid-cols-2 gap-6">
        {SUBJECTS.map(subject => (
          <button
            key={subject.id}
            onClick={() => setSubject(subject.id)}
            className={`text-left rounded-3xl border-2 p-6 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1 cursor-pointer bg-white ${subject.border}`}
          >
            <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.color} text-3xl shadow-md mb-5`}>
              {subject.icon}
            </div>
            <h3 className="text-xl font-black text-stone-900 mb-2">{subject.label}</h3>
            <p className="text-stone-500 font-medium text-sm mb-4 leading-relaxed">{subject.description}</p>
            <div className="flex flex-wrap gap-2">
              {subject.topics.map(t => (
                <span key={t} className={`text-xs font-semibold px-2 py-1 rounded-full ${subject.bg} text-stone-600`}>
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>← Back</Button>
      </div>
    </div>
  )
}
