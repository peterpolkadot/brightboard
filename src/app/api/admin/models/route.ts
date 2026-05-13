import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/auth'

export interface OpenRouterModel {
  id: string
  name: string
  description?: string
  context_length: number
  architecture?: {
    input_modalities?: string[]
    output_modalities?: string[]
  }
  pricing: {
    prompt: string   // cost per token in USD (string, e.g. "0.000003")
    completion: string
    request?: string
    image?: string
  }
  top_provider?: { max_completion_tokens: number }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'No API key' }, { status: 500 })

  const modality = req.nextUrl.searchParams.get('output_modalities')
  const url = new URL('https://openrouter.ai/api/v1/models')
  if (modality) url.searchParams.set('output_modalities', modality)

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: 300 }, // cache for 5 minutes
  })

  if (!res.ok) return NextResponse.json({ error: 'OpenRouter error' }, { status: 502 })

  const data = await res.json()
  // Return only the fields we need, sorted by name
  const models: OpenRouterModel[] = (data.data ?? [])
    .map((m: OpenRouterModel) => ({
      id: m.id,
      name: m.name,
      context_length: m.context_length,
      architecture: m.architecture,
      pricing: m.pricing,
    }))
    .sort((a: OpenRouterModel, b: OpenRouterModel) => a.name.localeCompare(b.name))

  return NextResponse.json({ models })
}
