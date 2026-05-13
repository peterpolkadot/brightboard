'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SlidePlanReview } from './slide-plan-review'
import { SlideGenerator } from './slide-generator'
import { LessonPlanView } from './lesson-plan-view'
import { InfographicView } from './infographic-view'
import type { CurriculumOutcome } from '@/types'
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

interface Resource {
  id: string
  resource_type: string
  content: Json
  image_url: string | null
  pdf_url: string | null
}

interface Project {
  id: string
  title: string
  year_level: string
  subject: string
  curriculum_code: string
  resource_type: string
  visual_style: string
  status: string
  thumbnail_url: string | null
}

interface Props {
  project: Project
  slides: Slide[]
  resources: Resource[]
  curriculum?: CurriculumOutcome
}

const RESOURCE_ICONS: Record<string, string> = {
  slide_deck: '🎨',
  infographic: '🖼️',
  lesson_plan: '📋',
}

const STATUS_BADGE: Record<string, 'warning' | 'info' | 'success'> = {
  draft: 'warning',
  generating: 'info',
  complete: 'success',
}

export function ProjectHub({ project, slides, resources, curriculum }: Props) {
  const [phase, setPhase] = useState<'plan' | 'generate' | 'done'>(
    slides.length === 0 ? 'plan' : slides.some(s => s.status !== 'approved') ? 'generate' : 'done'
  )

  const icon = RESOURCE_ICONS[project.resource_type] ?? '📄'

  return (
    <div>
      {/* Project header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
        <div className="flex items-center gap-3 flex-1">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 text-3xl shadow-md">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={STATUS_BADGE[project.status] ?? 'default'}>{project.status}</Badge>
              <Badge variant="secondary">{project.subject}</Badge>
              <span className="text-xs font-mono font-bold text-stone-400">{project.curriculum_code}</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900">{project.title}</h1>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">← Dashboard</Button>
        </Link>
      </div>

      {/* Curriculum outcome card */}
      {curriculum && (
        <div className="bg-white rounded-2xl border border-amber-100 p-5 mb-8">
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-wide mb-2">Curriculum Outcome</h3>
          <p className="font-bold text-stone-800 mb-1">{curriculum.title}</p>
          <p className="text-sm text-stone-500 font-medium">{curriculum.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {curriculum.keywords.slice(0, 8).map(k => (
              <span key={k} className="text-xs bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200">{k}</span>
            ))}
          </div>
        </div>
      )}

      {/* Main content area */}
      {project.resource_type === 'slide_deck' && (
        <>
          {phase === 'plan' && (
            <SlidePlanReview
              project={project}
              curriculum={curriculum}
              onPlanApproved={() => setPhase('generate')}
            />
          )}
          {(phase === 'generate' || phase === 'done') && (
            <SlideGenerator
              project={project}
              curriculum={curriculum}
              initialSlides={slides}
            />
          )}
        </>
      )}

      {project.resource_type === 'lesson_plan' && (
        <LessonPlanView
          project={project}
          curriculum={curriculum}
          resource={resources.find(r => r.resource_type === 'lesson_plan')}
        />
      )}

      {project.resource_type === 'infographic' && (
        <InfographicView
          project={project}
          curriculum={curriculum}
          resource={resources.find(r => r.resource_type === 'infographic')}
        />
      )}
    </div>
  )
}
