'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CurriculumOutcome, LessonPlan } from '@/types'
import type { Json } from '@/types/database'

interface Resource {
  id: string
  resource_type: string
  content: Json
  pdf_url: string | null
}

interface Props {
  project: { id: string; title: string; curriculum_code: string; subject: string }
  curriculum?: CurriculumOutcome
  resource?: Resource
}

export function LessonPlanView({ project, curriculum, resource }: Props) {
  const [plan, setPlan] = useState<LessonPlan | null>(
    resource ? (resource.content as unknown as LessonPlan) : null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generatePlan() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, curriculum }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setPlan(data.lessonPlan)
    } catch {
      setError('Could not generate lesson plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-card">
      <div className="p-8 border-b border-amber-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-stone-900 mb-1">Lesson Plan</h2>
          <p className="text-stone-500 font-medium text-sm">{curriculum?.title}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generatePlan} disabled={loading} variant={plan ? 'outline' : 'default'}>
            {loading ? <><Spinner size="sm" /> Generating…</> : plan ? '↺ Regenerate' : '✨ Generate plan'}
          </Button>
          {plan && (
            <Button variant="sky" disabled title="Export PDF coming soon">📄 Export PDF</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="m-8 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="lg" />
          <p className="text-stone-500 font-medium">Generating lesson plan…</p>
        </div>
      )}

      {!plan && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-stone-500 font-medium">Click &quot;Generate plan&quot; to create your curriculum-aligned lesson plan.</p>
        </div>
      )}

      {plan && (
        <div className="p-8 space-y-8">
          <Section icon="🎯" title="Learning Intention">
            <p className="text-stone-700 font-medium leading-relaxed">{plan.learningIntention}</p>
          </Section>

          <Section icon="✅" title="Success Criteria">
            <ul className="space-y-2">
              {plan.successCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-stone-700 font-medium">
                  <span className="text-teal-500 mt-0.5 shrink-0">✓</span> {c}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon="🧰" title="Materials Needed">
            <ul className="flex flex-wrap gap-2">
              {plan.materialsNeeded.map((m, i) => (
                <li key={i} className="bg-amber-50 border border-amber-200 text-amber-800 text-sm font-semibold px-3 py-1 rounded-full">
                  {m}
                </li>
              ))}
            </ul>
          </Section>

          <Section icon="🏃" title="Classroom Activities">
            <div className="space-y-4">
              {plan.activities.map((a, i) => (
                <div key={i} className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-stone-900">{a.name}</h4>
                    <span className="text-xs font-bold text-stone-400 bg-white border border-amber-200 px-2 py-1 rounded-full">{a.duration}</span>
                  </div>
                  <p className="text-sm text-stone-600 font-medium leading-relaxed">{a.description}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section icon="💬" title="Discussion Prompts">
            <ul className="space-y-2">
              {plan.discussionPrompts.map((p, i) => (
                <li key={i} className="flex items-start gap-2 text-stone-700 font-medium text-sm">
                  <span className="text-violet-400 shrink-0">❓</span> {p}
                </li>
              ))}
            </ul>
          </Section>

          <div className="grid sm:grid-cols-2 gap-6">
            <Section icon="📊" title="Assessment Ideas">
              <ul className="space-y-2">
                {plan.assessmentIdeas.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-700 font-medium text-sm">
                    <span className="text-teal-500 shrink-0">●</span> {a}
                  </li>
                ))}
              </ul>
            </Section>
            <Section icon="🚀" title="Extension Ideas">
              <ul className="space-y-2">
                {plan.extensionIdeas.map((e, i) => (
                  <li key={i} className="flex items-start gap-2 text-stone-700 font-medium text-sm">
                    <span className="text-amber-500 shrink-0">★</span> {e}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 text-sm text-stone-500 font-medium">
            <strong className="text-stone-700">Curriculum alignment: </strong>{plan.curriculumAlignment}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="font-black text-stone-800">{title}</h3>
      </div>
      {children}
    </div>
  )
}
