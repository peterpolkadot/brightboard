'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CurriculumOutcome, SlidePlanItem } from '@/types'
import type { Json } from '@/types/database'

interface CreatedSlide {
  id: string
  position: number
  title: string
  slide_type: string
  content: Json
  image_url: string | null
  status: string
}

interface Props {
  project: { id: string; title: string; subject: string; curriculum_code: string; resource_type: string }
  curriculum?: CurriculumOutcome
  onPlanApproved: (slides: CreatedSlide[]) => void
}

export function SlidePlanReview({ project, curriculum, onPlanApproved }: Props) {
  const [plan, setPlan] = useState<SlidePlanItem[] | null>(null)
  const [createdSlides, setCreatedSlides] = useState<CreatedSlide[]>([])
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generatePlan() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          curriculumCode: project.curriculum_code,
          subject: project.subject,
          curriculum,
        }),
      })

      if (!res.ok) throw new Error('Failed to generate plan')
      const data = await res.json()
      setPlan(data.plan)
      setCreatedSlides(data.slides ?? [])
    } catch {
      setError('Could not generate slide plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function moveUp(index: number) {
    if (!plan || index === 0) return
    const newPlan = [...plan]
    ;[newPlan[index - 1], newPlan[index]] = [newPlan[index], newPlan[index - 1]]
    setPlan(newPlan.map((p, i) => ({ ...p, position: i + 1 })))
  }

  function moveDown(index: number) {
    if (!plan || index === plan.length - 1) return
    const newPlan = [...plan]
    ;[newPlan[index], newPlan[index + 1]] = [newPlan[index + 1], newPlan[index]]
    setPlan(newPlan.map((p, i) => ({ ...p, position: i + 1 })))
  }

  function removeSlide(index: number) {
    if (!plan) return
    setPlan(plan.filter((_, i) => i !== index).map((p, i) => ({ ...p, position: i + 1 })))
  }

  async function approvePlan() {
    if (!plan) return
    setApproving(true)
    setError(null)

    try {
      const res = await fetch('/api/generate/plan', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, plan }),
      })

      if (!res.ok) throw new Error('Failed to save approved plan')
      const data = await res.json()
      onPlanApproved(data.slides ?? createdSlides)
    } catch {
      setError('Could not save your approved slide plan. Please try again.')
    } finally {
      setApproving(false)
    }
  }

  const SLIDE_TYPE_ICONS: Record<string, string> = {
    title: '🌟',
    overview: '📋',
    content: '📖',
    fact: '💡',
    lifecycle: '🔄',
    activity: '✋',
    summary: '🎯',
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-stone-900 mb-1">Slide plan</h2>
          <p className="text-stone-500 font-medium text-sm">
            Review and approve the slide plan before generating your full slide deck.
          </p>
        </div>
        <Button onClick={generatePlan} disabled={loading} variant={plan ? 'outline' : 'default'}>
          {loading ? <><Spinner size="sm" /> Generating…</> : plan ? '↺ Regenerate' : '✨ Generate plan'}
        </Button>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium mb-6">
          {error}
        </div>
      )}

      {loading && !plan && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Spinner size="lg" />
          <p className="text-stone-500 font-medium">Generating slide plan…</p>
        </div>
      )}

      {!plan && !loading && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <p className="text-stone-500 font-medium mb-2">Ready to generate your slide plan</p>
          <p className="text-stone-400 text-sm">
            The AI will create a structured plan for your <strong className="text-stone-600">{curriculum?.title}</strong> slide deck.
          </p>
        </div>
      )}

      {plan && (
        <>
          <div className="space-y-3 mb-8">
            {plan.map((slide, i) => (
              <div key={slide.position} className="flex items-center gap-3 bg-amber-50 rounded-2xl border border-amber-100 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-400 text-white font-black text-sm">
                  {slide.position}
                </div>
                <span className="text-xl">{SLIDE_TYPE_ICONS[slide.slideType] ?? '📄'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-900 text-sm truncate">{slide.title}</p>
                  <p className="text-xs text-stone-500 font-medium truncate">{slide.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => moveUp(i)} disabled={i === 0} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-200 disabled:opacity-30 transition-colors text-stone-600 text-sm">↑</button>
                  <button onClick={() => moveDown(i)} disabled={i === plan.length - 1} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-amber-200 disabled:opacity-30 transition-colors text-stone-600 text-sm">↓</button>
                  <button onClick={() => removeSlide(i)} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-100 transition-colors text-red-400 text-sm">✕</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500 font-medium">
              {plan.length} slides · Reorder or remove slides before approving
            </p>
            <Button size="lg" onClick={approvePlan} disabled={approving}>
              {approving ? <><Spinner size="sm" /> Saving…</> : 'Approve plan → Generate slides'}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
