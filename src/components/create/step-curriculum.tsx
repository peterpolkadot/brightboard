'use client'

import { useCreateProjectStore } from '@/stores/create-project'
import { getCurriculumBySubject } from '@/data/curriculum'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const STRAND_COLORS: Record<string, string> = {
  'Biological Sciences': 'info',
  'Physical Sciences': 'violet',
  'Earth and Space Sciences': 'success',
  'Language': 'warning',
  'Literature': 'coral',
  'Literacy': 'default',
}

export function StepCurriculum() {
  const { subject, setCurriculum, setStep } = useCreateProjectStore()
  const outcomes = getCurriculumBySubject(subject ?? 'Science')

  const strands = [...new Set(outcomes.map(o => o.strand))]

  return (
    <div>
      <h2 className="text-2xl font-black text-stone-900 mb-2">Select curriculum outcome</h2>
      <p className="text-stone-500 font-medium mb-8">
        Choose the specific Australian Curriculum outcome your resource will target.
        {subject ? ` Showing ${outcomes.length} Foundation outcomes for ${subject}.` : ''}
      </p>

      <div className="space-y-6">
        {strands.map(strand => (
          <div key={strand}>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={(STRAND_COLORS[strand] as 'info' | 'violet' | 'success' | 'warning' | 'coral' | 'default') ?? 'default'}>
                {strand}
              </Badge>
            </div>

            <div className="space-y-3">
              {outcomes
                .filter(o => o.strand === strand)
                .map(outcome => (
                  <button
                    key={outcome.code}
                    onClick={() => setCurriculum(outcome.code, outcome)}
                    className="w-full text-left bg-white rounded-2xl border-2 border-amber-100 hover:border-amber-300 hover:shadow-card transition-all duration-200 p-5 group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-black text-amber-600 font-mono">{outcome.code}</span>
                          <span className="text-xs text-stone-400 font-semibold">{outcome.subStrand}</span>
                        </div>
                        <h4 className="font-black text-stone-900 mb-1 group-hover:text-amber-700 transition-colors">
                          {outcome.title}
                        </h4>
                        <p className="text-sm text-stone-500 font-medium leading-relaxed line-clamp-2">
                          {outcome.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {outcome.keywords.slice(0, 5).map(k => (
                            <span key={k} className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="shrink-0 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                        →
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Button variant="ghost" size="sm" onClick={() => setStep(2)}>← Back</Button>
      </div>
    </div>
  )
}
