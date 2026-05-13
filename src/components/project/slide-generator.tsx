'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import type { CurriculumOutcome, SlideContent } from '@/types'
import type { Json } from '@/types/database'

interface Slide {
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
  initialSlides: Slide[]
}

const SLIDE_BG_GRADIENTS = [
  'from-sky-100 to-teal-50',
  'from-amber-50 to-yellow-100',
  'from-violet-50 to-purple-100',
  'from-teal-50 to-emerald-100',
  'from-orange-50 to-amber-100',
  'from-rose-50 to-pink-100',
]

export function SlideGenerator({ project, curriculum, initialSlides }: Props) {
  const [slides, setSlides] = useState<Slide[]>(initialSlides)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const pendingIndex = initialSlides.findIndex(s => s.status !== 'approved')
    return pendingIndex >= 0 ? pendingIndex : 0
  })
  const [generatingSlide, setGeneratingSlide] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  const currentSlide = slides[currentIndex]
  const allApproved = slides.length > 0 && slides.every(s => s.status === 'approved')

  async function generateSlide(slideId: string) {
    setGeneratingSlide(true)

    try {
      const res = await fetch('/api/generate/slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          slideId,
          curriculum,
        }),
      })

      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()

      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, ...data.slide } : s))
    } catch {
      console.error('Slide generation failed')
    } finally {
      setGeneratingSlide(false)
    }
  }

  async function approveSlide(slideId: string) {
    const res = await fetch(`/api/generate/slide`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slideId, status: 'approved' }),
    })

    if (res.ok) {
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, status: 'approved' } : s))
      if (currentIndex < slides.length - 1) {
        setCurrentIndex(currentIndex + 1)
      }
    }
  }

  async function exportPDF() {
    setExportLoading(true)
    const res = await fetch(`/api/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id }),
    })
    if (res.ok) {
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project.title}.pdf`
      a.click()
    }
    setExportLoading(false)
  }

  const slideContent = currentSlide?.content as unknown as SlideContent | undefined
  const gradient = SLIDE_BG_GRADIENTS[currentIndex % SLIDE_BG_GRADIENTS.length]

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-stone-900">Generating slides</h2>
          <span className="text-sm font-bold text-stone-500">
            {slides.filter(s => s.status === 'approved').length} / {slides.length} approved
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(i)}
              className={`
                flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all
                ${i === currentIndex ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md scale-110' :
                  slide.status === 'approved' ? 'bg-teal-100 text-teal-700' :
                  'bg-stone-100 text-stone-500 hover:bg-amber-100'}
              `}
              title={slide.title}
            >
              {slide.status === 'approved' ? '✓' : i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Current slide */}
      {currentSlide && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-card overflow-hidden">
          {/* Slide header */}
          <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-stone-400">Slide {currentIndex + 1}</span>
              <Badge variant={currentSlide.status === 'approved' ? 'success' : 'warning'}>
                {currentSlide.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              {currentIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(currentIndex - 1)}>←</Button>
              )}
              {currentIndex < slides.length - 1 && (
                <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(currentIndex + 1)}>→</Button>
              )}
            </div>
          </div>

          {/* Slide preview */}
          <div className={`slide-preview bg-gradient-to-br ${gradient} flex items-center justify-center p-8 relative`}>
            {generatingSlide ? (
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-stone-500 font-bold">Generating slide…</p>
              </div>
            ) : slideContent ? (
              <SlidePreview content={slideContent} slideType={currentSlide.slide_type} imageUrl={currentSlide.image_url} />
            ) : (
              <div className="text-center">
                <div className="text-5xl mb-4">✨</div>
                <p className="text-stone-500 font-bold mb-2">Slide not yet generated</p>
                <p className="text-stone-400 text-sm font-medium">{currentSlide.title}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black text-stone-900">{currentSlide.title}</h3>
              <p className="text-sm text-stone-500 font-medium capitalize">{currentSlide.slide_type} slide</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => generateSlide(currentSlide.id)}
                disabled={generatingSlide}
              >
                {generatingSlide ? <Spinner size="sm" /> : '↺'} {slideContent ? 'Regenerate' : 'Generate'}
              </Button>
              {slideContent && currentSlide.status !== 'approved' && (
                <Button
                  variant="sky"
                  onClick={() => approveSlide(currentSlide.id)}
                  disabled={generatingSlide}
                >
                  ✓ Approve &amp; continue
                </Button>
              )}
              {currentSlide.status === 'approved' && currentIndex < slides.length - 1 && (
                <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
                  Next slide →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All done */}
      {allApproved && (
        <div className="bg-gradient-to-r from-teal-400 to-cyan-400 rounded-3xl p-8 text-center text-white">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-black mb-2">All slides approved!</h2>
          <p className="text-white/80 font-medium mb-6">
            Your slide deck is ready. Export it to use in your classroom.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              className="bg-white text-teal-700 hover:bg-teal-50"
              size="lg"
              onClick={exportPDF}
              disabled={exportLoading}
            >
              {exportLoading ? <Spinner size="sm" /> : '📄'} Download PDF
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white/20"
              disabled
              title="Coming in Stage 2"
            >
              📦 Full Resource Pack (coming soon)
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SlidePreview({ content, slideType, imageUrl }: { content: SlideContent; slideType: string; imageUrl: string | null }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
      {slideType === 'title' ? (
        <>
          <div className="text-5xl mb-4">🌟</div>
          <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-3 leading-tight">{content.title}</h1>
          {content.body && <p className="text-lg text-stone-600 font-medium">{content.body}</p>}
        </>
      ) : (
        <>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-4 leading-tight">{content.title}</h2>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={content.title} className="max-h-48 object-contain mb-4 rounded-2xl" />
          )}
          {content.body && (
            <p className="text-base text-stone-600 font-medium mb-4 leading-relaxed max-w-lg">{content.body}</p>
          )}
          {content.bullets && content.bullets.length > 0 && (
            <ul className="text-left space-y-2 max-w-md">
              {content.bullets.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-semibold text-stone-700">
                  <span className="text-amber-500 mt-0.5 shrink-0">●</span>
                  {b}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
