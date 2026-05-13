'use client'

import { useState } from 'react'
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
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const W = 297
      const H = 210
      const COLORS = [
        [254, 243, 199], [224, 242, 254], [237, 233, 254],
        [209, 250, 229], [254, 226, 226], [255, 247, 237],
      ]

      slides.forEach((slide, i) => {
        if (i > 0) doc.addPage()
        const content = slide.content as unknown as SlideContent
        const bg = COLORS[i % COLORS.length]

        // Background
        doc.setFillColor(bg[0], bg[1], bg[2])
        doc.rect(0, 0, W, H, 'F')

        // Slide number chip
        doc.setFillColor(247, 144, 9)
        doc.roundedRect(10, 10, 12, 8, 2, 2, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(String(i + 1), 16, 15.5, { align: 'center' })

        if (slide.slide_type === 'title') {
          // Centred title layout
          doc.setTextColor(28, 25, 23)
          doc.setFontSize(32)
          doc.setFont('helvetica', 'bold')
          const titleLines = doc.splitTextToSize(content?.title ?? slide.title, 220)
          doc.text(titleLines, W / 2, H / 2 - 10, { align: 'center' })
          if (content?.body) {
            doc.setFontSize(14)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(87, 83, 78)
            doc.text(doc.splitTextToSize(content.body, 200), W / 2, H / 2 + 18, { align: 'center' })
          }
        } else {
          // Heading
          doc.setTextColor(28, 25, 23)
          doc.setFontSize(22)
          doc.setFont('helvetica', 'bold')
          const titleLines = doc.splitTextToSize(content?.title ?? slide.title, 260)
          doc.text(titleLines, W / 2, 40, { align: 'center' })

          let y = 40 + titleLines.length * 10

          // Body
          if (content?.body) {
            doc.setFontSize(13)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(87, 83, 78)
            const bodyLines = doc.splitTextToSize(content.body, 240)
            doc.text(bodyLines, W / 2, y + 8, { align: 'center' })
            y += bodyLines.length * 7 + 10
          }

          // Bullets
          if (content?.bullets?.length) {
            doc.setFontSize(12)
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(28, 25, 23)
            const startX = W / 2 - 90
            content.bullets.forEach(bullet => {
              doc.setFillColor(247, 144, 9)
              doc.circle(startX - 3, y + 3.5, 1.5, 'F')
              const lines = doc.splitTextToSize(bullet, 180)
              doc.text(lines, startX + 2, y + 5)
              y += lines.length * 6 + 3
            })
          }
        }

        // Footer
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(168, 162, 158)
        doc.text(project.title, W / 2, H - 6, { align: 'center' })
      })

      doc.save(`${project.title}.pdf`)
    } catch (err) {
      console.error('PDF export failed', err)
    } finally {
      setExportLoading(false)
    }
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
