'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { CurriculumOutcome, InfographicContent } from '@/types'
import type { Json } from '@/types/database'

interface Resource {
  id: string
  resource_type: string
  content: Json
  image_url: string | null
  pdf_url: string | null
}

interface Props {
  project: { id: string; title: string; curriculum_code: string; subject: string }
  curriculum?: CurriculumOutcome
  resource?: Resource
}

export function InfographicView({ project, curriculum, resource }: Props) {
  const [infographic, setInfographic] = useState<InfographicContent | null>(
    resource ? (resource.content as unknown as InfographicContent) : null
  )
  const [imageUrl, setImageUrl] = useState<string | null>(resource?.image_url ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function generateInfographic() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate/infographic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, curriculum }),
      })
      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()
      setInfographic(data.infographic)
      setImageUrl(data.imageUrl ?? null)
    } catch {
      setError('Could not generate infographic. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-card">
      <div className="p-8 border-b border-amber-100 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-stone-900 mb-1">Infographic</h2>
          <p className="text-stone-500 font-medium text-sm">{curriculum?.title}</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={generateInfographic} disabled={loading} variant={infographic ? 'outline' : 'default'}>
            {loading ? <><Spinner size="sm" /> Generating…</> : infographic ? '↺ Regenerate' : '✨ Generate infographic'}
          </Button>
          {infographic && (
            <Button variant="sky" disabled title="Export coming soon">📄 Export PDF</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="m-8 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">{error}</div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Spinner size="lg" />
          <p className="text-stone-500 font-medium">Generating infographic…</p>
        </div>
      )}

      {!infographic && !loading && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🖼️</div>
          <p className="text-stone-500 font-medium">Click &quot;Generate infographic&quot; to create your visual resource.</p>
        </div>
      )}

      {infographic && (
        <div className="p-8">
          {/* Infographic preview */}
          {imageUrl ? (
            <div className="rounded-2xl overflow-hidden border border-amber-100 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={infographic.title} className="w-full" />
            </div>
          ) : (
            <InfographicPreview infographic={infographic} />
          )}
        </div>
      )}
    </div>
  )
}

function InfographicPreview({ infographic }: { infographic: InfographicContent }) {
  const sectionColors = [
    'bg-amber-50 border-amber-200',
    'bg-teal-50 border-teal-200',
    'bg-violet-50 border-violet-200',
    'bg-sky-50 border-sky-200',
    'bg-rose-50 border-rose-200',
    'bg-emerald-50 border-emerald-200',
  ]

  return (
    <div className="bg-gradient-to-br from-amber-50 to-sky-50 rounded-2xl border border-amber-200 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-stone-900 mb-2">{infographic.title}</h2>
        {infographic.subtitle && (
          <p className="text-stone-500 font-medium">{infographic.subtitle}</p>
        )}
      </div>

      <div className={`grid gap-4 ${infographic.sections.length <= 2 ? 'grid-cols-2' : infographic.sections.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {infographic.sections.map((section, i) => (
          <div key={i} className={`rounded-2xl border-2 p-5 ${sectionColors[i % sectionColors.length]}`}>
            <div className="text-3xl mb-3 text-center">
              {['🥚', '🐛', '🫘', '🦋', '🌿', '⭐'][i % 6]}
            </div>
            <h3 className="font-black text-stone-900 text-center mb-2">{section.label}</h3>
            <p className="text-sm text-stone-600 font-medium text-center leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-stone-400 font-semibold">Foundation · Australian Curriculum · Brightboard</p>
      </div>
    </div>
  )
}
