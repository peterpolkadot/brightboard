import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlidePlan } from '@/lib/ai/generate'
import { getCurriculumByCode } from '@/data/curriculum'
import type { CurriculumOutcome } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { projectId, curriculumCode, curriculum: curriculumOverride } = body

    const curriculum: CurriculumOutcome | undefined = curriculumOverride ?? getCurriculumByCode(curriculumCode)
    if (!curriculum) return NextResponse.json({ error: 'Curriculum outcome not found' }, { status: 400 })

    const plan = await generateSlidePlan(curriculum, { projectId, userId: user.id })

    await supabase.from('bb_slides').delete().eq('project_id', projectId)

    await supabase.from('bb_slides').insert(
      plan.map(item => ({
        project_id: projectId,
        position: item.position,
        title: item.title,
        slide_type: item.slideType,
        content: { description: item.description },
        status: 'pending' as const,
      }))
    )

    await supabase.from('bb_projects').update({ status: 'generating' }).eq('id', projectId)

    return NextResponse.json({ plan })
  } catch (err) {
    console.error('[generate/plan]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
