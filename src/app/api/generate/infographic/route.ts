import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInfographic, generateImage } from '@/lib/ai/generate'
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

    const body = await req.json()
    const { projectId, curriculum }: { projectId: string; curriculum: CurriculumOutcome } = body

    const infographic = await generateInfographic(curriculum)

    const imagePrompt = `A beautiful, colourful educational infographic for Australian Foundation students (ages 5-6) about "${infographic.title}". ${infographic.layout} layout. Sections: ${infographic.sections.map(s => s.label).join(', ')}. Bright cartoon classroom style, warm colours, child-friendly illustrations, large readable labels, print-ready A4 format.`
    const imageUrl = await generateImage(imagePrompt)

    const { data: existing } = await supabase
      .from('resources')
      .select('id')
      .eq('project_id', projectId)
      .eq('resource_type', 'infographic')
      .single()

    if (existing) {
      await supabase
        .from('resources')
        .update({ content: toJson(infographic), image_url: imageUrl })
        .eq('id', existing.id)
    } else {
      await supabase.from('resources').insert({
        project_id: projectId,
        resource_type: 'infographic',
        content: toJson(infographic),
        image_url: imageUrl,
      })
    }

    await supabase.from('projects').update({ status: 'complete' }).eq('id', projectId)

    return NextResponse.json({ infographic, imageUrl })
  } catch (err) {
    console.error('[generate/infographic]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
