'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const [slides, setSlides] = useState<Slide[]>(initialSlides)
  const [currentIndex, setCurrentIndex] = useState(() => {
    const pendingIndex = initialSlides.findIndex(s => s.status !== 'approved')
    return pendingIndex >= 0 ? pendingIndex : 0
  })
  const [generatingSlide, setGeneratingSlide] = useState(false)
  const [approvingSlide, setApprovingSlide] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const safeCurrentIndex = Math.min(Math.max(currentIndex, 0), Math.max(slides.length - 1, 0))
  const currentSlide = slides[safeCurrentIndex]
  const slideContent = getGeneratedSlideContent(currentSlide)
  const allApproved = slides.length > 0 && slides.every(s => s.status === 'approved')
  const gradient = SLIDE_BG_GRADIENTS[safeCurrentIndex % SLIDE_BG_GRADIENTS.length]

  async function generateSlide(slideId: string) {
    setGeneratingSlide(true)
    setError(null)

    try {
      const res = await fetch('/api/generate/slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, slideId, curriculum }),
      })

      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Generation failed')
      const data = await res.json()
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, ...data.slide } : s))
      router.refresh()
    } catch (err) {
      console.error('Slide generation failed', err)
      setError(err instanceof Error ? err.message : 'Slide generation failed. Please try again.')
    } finally {
      setGeneratingSlide(false)
    }
  }

  async function approveSlide(slideId: string) {
    setApprovingSlide(true)
    setError(null)

    try {
      const res = await fetch('/api/generate/slide', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideId, status: 'approved' }),
      })

      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Could not approve slide')

      let nextIndex = currentIndex
      setSlides(prev => {
        const updated = prev.map(s => s.id === slideId ? { ...s, status: 'approved' } : s)
        const firstPending = updated.findIndex(s => s.status !== 'approved')
        nextIndex = firstPending >= 0 ? firstPending : Math.min(safeCurrentIndex, updated.length - 1)
        return updated
      })
      setCurrentIndex(nextIndex)
      router.refresh()
    } catch (err) {
      console.error('Slide approval failed', err)
      setError(err instanceof Error ? err.message : 'Could not approve slide. Please try again.')
    } finally {
      setApprovingSlide(false)
    }
  }

  async function exportPDF() {
    const exportSlides = slides.filter(slide => getGeneratedSlideContent(slide) || slide.status === 'approved')
    if (exportSlides.length === 0) {
      setError('Generate at least one slide before exporting.')
      return
    }

    setExportLoading(true)
    setError(null)
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297
      const H = 210
      const COLORS = [
        [254, 243, 199], [224, 242, 254], [237, 233, 254],
        [209, 250, 229], [254, 226, 226], [255, 247, 237],
      ]

      exportSlides.forEach((slide, i) => {
        if (i > 0) doc.addPage()
        const content = getGeneratedSlideContent(slide)
        const title = content?.title ?? slide.title
        const body = content?.body ?? ''
        const bullets = content?.bullets ?? []
        const bg = COLORS[i % COLORS.length]

        doc.setFillColor(bg[0], bg[1], bg[2])
        doc.rect(0, 0, W, H, 'F')
        doc.setFillColor(247, 144, 9)
        doc.roundedRect(10, 10, 12, 8, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(String(i + 1), 16, 15.5, { align: 'center' })

        doc.setTextColor(28, 25, 23)
        doc.setFontSize(slide.slide_type === 'title' ? 32 : 22)
        doc.setFont('helvetica', 'bold')
        const titleY = slide.slide_type === 'title' ? H / 2 - 10 : 40
        const titleLines = doc.splitTextToSize(title, slide.slide_type === 'title' ? 220 : 260)
        doc.text(titleLines, W / 2, titleY, { align: 'center' })

        let y = titleY + titleLines.length * 10
        if (body) {
          doc.setFontSize(slide.slide_type === 'title' ? 14 : 13)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(87, 83, 78)
          const bodyLines = doc.splitTextToSize(body, 220)
          doc.text(bodyLines, W / 2, y + 10, { align: 'center' })
          y += bodyLines.length * 7 + 16
        }

        if (bullets.length) {
          doc.setFontSize(12)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(28, 25, 23)
          const startX = W / 2 - 90
          bullets.forEach(bullet => {
            doc.setFillColor(247, 144, 9)
            doc.circle(startX - 3, y + 3.5, 1.5, 'F')
            const lines = doc.splitTextToSize(bullet, 180)
            doc.text(lines, startX + 2, y + 5)
            y += lines.length * 6 + 3
          })
        }

        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(168, 162, 158)
        doc.text(project.title, W / 2, H - 6, { align: 'center' })
      })

      doc.save(`${project.title}.pdf`)
    } catch (err) {
      console.error('PDF export failed', err)
      setError('PDF export failed. Please try again.')
    } finally {
      setExportLoading(false)
    }
  }

  function goToNextNeedsWork() {
    const nextNeedsWork = slides.findIndex((slide, index) => index > safeCurrentIndex && slide.status !== 'approved')
    setCurrentIndex(nextNeedsWork >= 0 ? nextNeedsWork : Math.min(safeCurrentIndex + 1, slides.length - 1))
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-stone-900">Generating slides</h2>
          <span className="text-sm font-bold text-stone-500">
            {slides.filter(s => s.status === 'approved').length} / {slides.length} approved
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {slides.map((slide, i) => {
            const generated = Boolean(getGeneratedSlideContent(slide))
            return (
              <button
                key={slide.id}
                onClick={() => setCurrentIndex(i)}
                className={`
                  flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all
                  ${i === safeCurrentIndex ? 'bg-gradient-to-br from-amber-400 to-orange-400 text-white shadow-md scale-110' :
                    slide.status === 'approved' ? 'bg-teal-100 text-teal-700' :
                    generated ? 'bg-sky-100 text-sky-700 hover:bg-sky-200' :
                    'bg-stone-100 text-stone-500 hover:bg-amber-100'}
                `}
                title={slide.title}
              >
                {slide.status === 'approved' ? '✓' : generated ? '•' : i + 1}
              </button>
            )
          })}
        </div>
      </div>

      {currentSlide && (
        <div className="bg-white rounded-3xl border border-amber-100 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-stone-400">Slide {safeCurrentIndex + 1}</span>
              <Badge variant={currentSlide.status === 'approved' ? 'success' : slideContent ? 'info' : 'warning'}>
                {currentSlide.status === 'approved' ? 'approved' : slideContent ? 'generated' : 'not generated'}
              </Badge>
            </div>
            <div className="flex gap-2">
              {safeCurrentIndex > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}>←</Button>
              )}
              {safeCurrentIndex < slides.length - 1 && (
                <Button variant="ghost" size="sm" onClick={() => setCurrentIndex(i => Math.min(slides.length - 1, i + 1))}>→</Button>
              )}
            </div>
          </div>

          <div className={`slide-preview bg-gradient-to-br ${gradient} flex items-center justify-center p-8 relative`}>
            {generatingSlide ? (
              <div className="flex flex-col items-center gap-4">
                <Spinner size="lg" />
                <p className="text-stone-500 font-bold">Generating slide...</p>
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

          <div className="px-6 py-4 bg-amber-50 border-t border-amber-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div>
              <h3 className="font-black text-stone-900">{currentSlide.title}</h3>
              <p className="text-sm text-stone-500 font-medium capitalize">{currentSlide.slide_type} slide</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => generateSlide(currentSlide.id)}
                disabled={generatingSlide || approvingSlide}
              >
                {generatingSlide ? <Spinner size="sm" /> : '↻'} {slideContent ? 'Regenerate' : 'Generate'}
              </Button>
              {slideContent && currentSlide.status !== 'approved' && (
                <Button
                  variant="sky"
                  onClick={() => approveSlide(currentSlide.id)}
                  disabled={generatingSlide || approvingSlide}
                >
                  {approvingSlide ? <Spinner size="sm" /> : '✓'} Approve &amp; continue
                </Button>
              )}
              {currentSlide.status === 'approved' && safeCurrentIndex < slides.length - 1 && (
                <Button onClick={goToNextNeedsWork}>Next slide →</Button>
              )}
            </div>
          </div>
        </div>
      )}

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

function getGeneratedSlideContent(slide?: Slide): SlideContent | null {
  if (!slide?.content || typeof slide.content !== 'object' || Array.isArray(slide.content)) return null
  const content = slide.content as unknown as Partial<SlideContent>
  if (typeof content.title !== 'string' || content.title.trim().length === 0) return null
  return {
    title: content.title,
    body: typeof content.body === 'string' ? content.body : '',
    bullets: Array.isArray(content.bullets) ? content.bullets.filter((b): b is string => typeof b === 'string') : undefined,
    imagePrompt: typeof content.imagePrompt === 'string' ? content.imagePrompt : undefined,
    imageUrl: typeof content.imageUrl === 'string' ? content.imageUrl : undefined,
    notes: typeof content.notes === 'string' ? content.notes : undefined,
    slideType: content.slideType ?? (slide.slide_type as SlideContent['slideType']),
  }
}

function SlidePreview({ content, slideType, imageUrl }: { content: SlideContent; slideType: string; imageUrl: string | null }) {
  const bullets = content.bullets ?? []

  if (slideType === 'title') {
    return (
      <div className="w-full h-full grid md:grid-cols-[1fr_0.9fr] items-center gap-8 max-w-4xl mx-auto text-left">
        <div>
          <div className="inline-flex items-center rounded-full bg-white/80 border border-amber-200 px-3 py-1 text-xs font-black text-amber-700 mb-4">
            Brightboard
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-stone-900 mb-4 leading-tight">{content.title}</h1>
          {content.body && <p className="text-lg text-stone-600 font-bold leading-relaxed">{content.body}</p>}
        </div>
        <VisualPanel imageUrl={imageUrl} title={content.title} />
      </div>
    )
  }

  if (slideType === 'activity') {
    return (
      <div className="w-full h-full grid md:grid-cols-[0.85fr_1fr] items-center gap-8 max-w-4xl mx-auto">
        <VisualPanel imageUrl={imageUrl} title={content.title} />
        <div className="text-left">
          <span className="inline-flex rounded-full bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1 text-xs font-black mb-4">
            Class Activity
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-4 leading-tight">{content.title}</h2>
          {content.body && <p className="text-lg text-stone-600 font-bold mb-5 leading-relaxed">{content.body}</p>}
          <BulletList bullets={bullets} />
        </div>
      </div>
    )
  }

  if (slideType === 'lifecycle' || content.title.toLowerCase().includes('cycle')) {
    return (
      <div className="w-full h-full max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mb-3 leading-tight">{content.title}</h2>
        {content.body && <p className="text-base text-stone-600 font-bold mb-6">{content.body}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(bullets.length ? bullets : ['First', 'Next', 'Then', 'Finally']).slice(0, 4).map((item, index) => (
            <div key={item} className="bg-white/85 border border-amber-100 rounded-2xl p-4 shadow-sm">
              <div className="text-3xl mb-2">{['🥚', '🐛', '🌿', '🦋'][index] ?? '✨'}</div>
              <p className="text-sm font-black text-stone-800">{item}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mb-4 leading-tight">{content.title}</h2>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={content.title} className="max-h-48 object-contain mb-4 rounded-2xl shadow-sm" />
      )}
      {content.body && (
        <p className="text-base text-stone-600 font-medium mb-4 leading-relaxed max-w-lg">{content.body}</p>
      )}
      <BulletList bullets={bullets} />
    </div>
  )
}

function VisualPanel({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  return (
    <div className="bg-white/80 border border-white rounded-3xl p-4 shadow-card">
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={title} className="w-full aspect-[4/3] object-contain rounded-2xl" />
      ) : (
        <div className="aspect-[4/3] rounded-2xl bg-amber-50 flex items-center justify-center text-6xl">✨</div>
      )}
    </div>
  )
}

function BulletList({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) return null
  return (
    <ul className="text-left space-y-2 max-w-md">
      {bullets.map((bullet, index) => (
        <li key={`${bullet}-${index}`} className="flex items-start gap-2 text-sm font-semibold text-stone-700">
          <span className="text-amber-500 mt-0.5 shrink-0">●</span>
          {bullet}
        </li>
      ))}
    </ul>
  )
}
