import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlidePlan } from '@/lib/ai/generate'
import { getCurriculumByCode } from '@/data/curriculum'
import type { CurriculumOutcome, SlidePlanItem } from '@/types'
import type { Json } from '@/types/database'

function toJson<T>(val: T): Json {
  return val as unknown as Json
}

function normalizePlan(plan: SlidePlanItem[]): SlidePlanItem[] {
  return plan.map((item, index) => ({ ...item, position: index + 1 }))
}

async function getOwnedProject(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
) {
  const { data: project } = await supabase
    .from('bb_projects')
    .select('id, user_id, curriculum_code')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single()

  return project
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { projectId, curriculumCode, curriculum: curriculumOverride } = body
    const project = await getOwnedProject(supabase, projectId, user.id)
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const curriculum: CurriculumOutcome | undefined = curriculumOverride ?? getCurriculumByCode(curriculumCode ?? project.curriculum_code)
    if (!curriculum) return NextResponse.json({ error: 'Curriculum outcome not found' }, { status: 400 })

    const plan = await generateSlidePlan(curriculum, { projectId, userId: user.id })

    await supabase.from('bb_slides').delete().eq('project_id', projectId)

    await supabase.from('bb_slides').insert(
      plan.map(item => ({
        project_id: projectId,
        position: item.position,
        title: item.title,
        slide_type: item.slideType,
        content: toJson({ description: item.description }),
        status: 'pending' as const,
      }))
    )

    await supabase.from('bb_projects').update({ status: 'generating' }).eq('id', projectId)

    const { data: slides } = await supabase
      .from('bb_slides')
      .select('*')
      .eq('project_id', projectId)
      .order('position')

    return NextResponse.json({ plan, slides: slides ?? [] })
  } catch (err) {
    console.error('[generate/plan]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { projectId, plan } = await req.json() as { projectId: string; plan: SlidePlanItem[] }
    const project = await getOwnedProject(supabase, projectId, user.id)
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    if (!Array.isArray(plan) || plan.length === 0) {
      return NextResponse.json({ error: 'Plan is required' }, { status: 400 })
    }

    const approvedPlan = normalizePlan(plan)

    await supabase.from('bb_slides').delete().eq('project_id', projectId)
    await supabase.from('bb_slides').insert(
      approvedPlan.map(item => ({
        project_id: projectId,
        position: item.position,
        title: item.title,
        slide_type: item.slideType,
        content: toJson({ description: item.description }),
        status: 'pending' as const,
      }))
    )

    await supabase.from('bb_projects').update({ status: 'generating' }).eq('id', projectId)

    const { data: slides } = await supabase
      .from('bb_slides')
      .select('*')
      .eq('project_id', projectId)
      .order('position')

    return NextResponse.json({ plan: approvedPlan, slides: slides ?? [] })
  } catch (err) {
    console.error('[generate/plan PATCH]', err)
    return NextResponse.json({ error: 'Plan update failed' }, { status: 500 })
  }
}
