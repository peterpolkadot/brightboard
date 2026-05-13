import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlideContent, generateImage } from '@/lib/ai/generate'
import type { CurriculumOutcome } from '@/types'
import type { Json } from '@/types/database'

function toJson<T>(val: T): Json {
  return val as unknown as Json
}

function buildFallbackImagePrompt(
  slide: { title: string; slide_type: string },
  curriculum: CurriculumOutcome
) {
  return [
    `Create a bright cartoon classroom illustration for an Australian Foundation class.`,
    `Slide title: "${slide.title}".`,
    `Slide type: ${slide.slide_type}.`,
    `Curriculum: ${curriculum.code} - ${curriculum.title}.`,
    `Use warm colours, large simple shapes, clear educational visuals, no tiny text, child-friendly and premium.`,
  ].join(' ')
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { projectId, slideId, curriculum }: { projectId: string; slideId: string; curriculum: CurriculumOutcome } = body

    const { data: project } = await supabase
      .from('bb_projects')
      .select('id')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    const { data: slide } = await supabase
      .from('bb_slides')
      .select('*')
      .eq('id', slideId)
      .eq('project_id', projectId)
      .single()
    if (!slide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 })

    const content = await generateSlideContent(
      { title: slide.title, slide_type: slide.slide_type },
      curriculum,
      { projectId, userId: user.id }
    )

    const imagePrompt = content.imagePrompt?.trim()
      ? content.imagePrompt
      : buildFallbackImagePrompt({ title: slide.title, slide_type: slide.slide_type }, curriculum)

    const imageUrl = await generateImage(imagePrompt, { projectId, userId: user.id })
    const contentWithImagePrompt = { ...content, imagePrompt }

    const { data: updatedSlide } = await supabase
      .from('bb_slides')
      .update({ content: toJson(contentWithImagePrompt), image_url: imageUrl, status: 'pending' })
      .eq('id', slideId)
      .select()
      .single()

    return NextResponse.json({ slide: updatedSlide })
  } catch (err) {
    console.error('[generate/slide]', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { slideId, status } = await req.json()

    const { data: existingSlide } = await supabase
      .from('bb_slides')
      .select('id, project_id')
      .eq('id', slideId)
      .single()
    if (!existingSlide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 })

    const { data: project } = await supabase
      .from('bb_projects')
      .select('id')
      .eq('id', existingSlide.project_id)
      .eq('user_id', user.id)
      .single()
    if (!project) return NextResponse.json({ error: 'Slide not found' }, { status: 404 })

    const { data: slide } = await supabase
      .from('bb_slides')
      .update({ status })
      .eq('id', slideId)
      .select()
      .single()

    if (status === 'approved' && slide) {
      const { data: allSlides } = await supabase
        .from('bb_slides')
        .select('status')
        .eq('project_id', slide.project_id)

      if (allSlides?.every(s => s.status === 'approved')) {
        await supabase.from('bb_projects').update({ status: 'complete' }).eq('id', slide.project_id)
      }
    }

    return NextResponse.json({ slide })
  } catch (err) {
    console.error('[generate/slide PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
