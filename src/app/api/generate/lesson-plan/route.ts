import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLessonPlan } from '@/lib/ai/generate'
import type { CurriculumOutcome } from '@/types'
import type { Json } from '@/types/database'

function toJson<T>(val: T): Json {
  return val as unknown as Json
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, curriculum }: { projectId: string; curriculum: CurriculumOutcome } = await req.json()

    const lessonPlan = await generateLessonPlan(curriculum, { projectId, userId: user.id })

    const { data: existing } = await supabase
      .from('resources')
      .select('id')
      .eq('project_id', projectId)
      .eq('resource_type', 'lesson_plan')
      .single()

    if (existing) {
      await supabase.from('resources').update({ content: toJson(lessonPlan) }).eq('id', existing.id)
    } else {
      await supabase.from('resources').insert({ project_id: projectId, resource_type: 'lesson_plan', content: toJson(lessonPlan) })
    }

    await supabase.from('projects').update({ status: 'complete' }).eq('id', projectId)

    return NextResponse.json({ lessonPlan })
  } catch (err) {
    console.error('[generate/lesson-plan]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
