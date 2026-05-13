import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateSlideContent, generateImage } from '@/lib/ai/generate'
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
    const { projectId, slideId, curriculum }: { projectId: string; slideId: string; curriculum: CurriculumOutcome } = body

    // Fetch slide
    const { data: slide } = await supabase
      .from('slides')
      .select('*')
      .eq('id', slideId)
      .single()

    if (!slide) return NextResponse.json({ error: 'Slide not found' }, { status: 404 })

    // Generate content
    const content = await generateSlideContent(
      { title: slide.title, slide_type: slide.slide_type },
      curriculum
    )

    // Optionally generate image
    let imageUrl: string | null = null
    if (content.imagePrompt) {
      imageUrl = await generateImage(content.imagePrompt)
    }

    // Update slide in database
    const { data: updatedSlide } = await supabase
      .from('slides')
      .update({
        content: toJson(content),
        image_url: imageUrl,
        status: 'pending',
      })
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

    const { data: slide } = await supabase
      .from('slides')
      .update({ status })
      .eq('id', slideId)
      .select()
      .single()

    // Check if all slides are approved; if so, mark project complete
    if (status === 'approved' && slide) {
      const { data: allSlides } = await supabase
        .from('slides')
        .select('status')
        .eq('project_id', slide.project_id)

      if (allSlides?.every(s => s.status === 'approved')) {
        await supabase
          .from('projects')
          .update({ status: 'complete' })
          .eq('id', slide.project_id)
      }
    }

    return NextResponse.json({ slide })
  } catch (err) {
    console.error('[generate/slide PATCH]', err)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }
}
