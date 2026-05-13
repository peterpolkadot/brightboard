import type { CurriculumOutcome, SlidePlanItem, SlideContent, LessonPlan, InfographicContent } from '@/types'
import {
  buildSlidePlanPrompt,
  buildSlideContentPrompt,
  buildLessonPlanPrompt,
  buildInfographicPrompt,
} from './prompts'

// ─── OpenRouter call ─────────────────────────────────────────────────────────

interface OpenRouterUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface OpenRouterResult {
  text: string
  usage: OpenRouterUsage
  model: string
  cost_usd: number | null
}

async function callOpenRouter(prompt: string, taskLabel: string): Promise<OpenRouterResult> {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL ?? 'anthropic/claude-sonnet-4-5'

  if (!apiKey || apiKey === 'your_openrouter_api_key') {
    throw new Error('OPENROUTER_API_KEY not configured.')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'Brightboard',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter API error (${response.status}): ${err}`)
  }

  const data = await response.json()
  const text: string = data.choices?.[0]?.message?.content ?? ''
  const usage: OpenRouterUsage = data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }

  // OpenRouter returns cost in the usage object (in USD per million tokens, varies by model)
  // We store it as a raw value; the dashboard will display it
  const cost_usd: number | null = data.usage?.cost ?? null

  return { text, usage, model: data.model ?? model, cost_usd }
}

// ─── Usage logging ────────────────────────────────────────────────────────────

export interface UsageLog {
  project_id?: string
  user_id?: string
  task: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: number | null
}

export async function logUsage(log: UsageLog) {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.from('usage_logs').insert({
      project_id: log.project_id ?? null,
      user_id: log.user_id ?? null,
      task: log.task,
      model: log.model,
      prompt_tokens: log.prompt_tokens,
      completion_tokens: log.completion_tokens,
      total_tokens: log.total_tokens,
      cost_usd: log.cost_usd,
    })
  } catch {
    // Non-fatal — don't break generation if logging fails
    console.warn('[usage_log] Failed to log usage')
  }
}

// ─── Mock fallbacks ───────────────────────────────────────────────────────────

function mockSlidePlan(curriculum: CurriculumOutcome): SlidePlanItem[] {
  return [
    { position: 1, title: curriculum.title, slideType: 'title', description: 'Title slide introducing the topic' },
    { position: 2, title: 'What We Will Learn', slideType: 'overview', description: 'Overview of learning goals' },
    ...curriculum.concepts.slice(0, 4).map((concept, i) => ({
      position: i + 3,
      title: concept.charAt(0).toUpperCase() + concept.slice(1),
      slideType: 'content' as const,
      description: `Exploring the concept of ${concept}`,
    })),
    { position: curriculum.concepts.slice(0, 4).length + 3, title: "Let's Try It!", slideType: 'activity', description: 'Hands-on activity' },
    { position: curriculum.concepts.slice(0, 4).length + 4, title: 'What Did We Learn?', slideType: 'summary', description: 'Key takeaways' },
  ]
}

function mockSlideContent(slide: { title: string; slide_type: string }, curriculum: CurriculumOutcome): SlideContent {
  const isTitle = slide.slide_type === 'title'
  const isActivity = slide.slide_type === 'activity'
  return {
    title: slide.title,
    body: isTitle
      ? `Foundation ${curriculum.subject} · ${curriculum.code}`
      : isActivity
      ? 'Work with a partner to explore this idea!'
      : curriculum.description.split('.')[0] + '.',
    bullets: isTitle ? undefined : curriculum.learningGoals.slice(0, 3),
    imagePrompt: `Bright cartoon illustration for Australian Foundation classroom: ${slide.title}`,
    notes: 'Discuss with students and encourage observations.',
    slideType: slide.slide_type as SlideContent['slideType'],
  }
}

function mockLessonPlan(curriculum: CurriculumOutcome): LessonPlan {
  return {
    learningIntention: `We are learning to ${curriculum.learningGoals[0]?.toLowerCase() ?? 'explore ' + curriculum.title.toLowerCase()}.`,
    successCriteria: curriculum.learningGoals.map(g => `I can ${g.toLowerCase()}`),
    materialsNeeded: ['Picture books', 'Sorting cards', 'Drawing paper and crayons', 'Interactive whiteboard'],
    activities: [
      { name: 'Warm-up Discussion', duration: '10 minutes', description: 'Gather on the mat. Ask what students already know.' },
      { name: 'Whole Class Teaching', duration: '15 minutes', description: `Introduce vocabulary: ${curriculum.vocabulary.slice(0, 4).join(', ')}.` },
      { name: 'Hands-on Activity', duration: '15 minutes', description: 'Students complete a sorting or sequencing activity in pairs.' },
      { name: 'Share and Reflect', duration: '10 minutes', description: 'Students share one thing they learned. Self-assessment.' },
    ],
    discussionPrompts: [
      `What do you know about ${curriculum.title.toLowerCase()}?`,
      `Can you think of an example of ${curriculum.keywords[0]}?`,
      'What was the most interesting thing you discovered?',
    ],
    assessmentIdeas: ['Observe sorting activity for accuracy', 'Listen to oral explanations during share time'],
    extensionIdeas: ['Research at home with a family member', 'Create a labelled diagram'],
    curriculumAlignment: `${curriculum.code} — ${curriculum.title} (${curriculum.strand})`,
  }
}

function mockInfographic(curriculum: CurriculumOutcome): InfographicContent {
  return {
    title: curriculum.title,
    subtitle: `Foundation ${curriculum.subject} · ${curriculum.code}`,
    layout: curriculum.concepts.length > 3 ? 'grid' : 'lifecycle',
    colorScheme: 'bright cartoon classroom',
    sections: curriculum.concepts.slice(0, 5).map(concept => ({
      label: concept.charAt(0).toUpperCase() + concept.slice(1),
      content: (curriculum.description.split('.')[0]?.slice(0, 60) ?? concept) + '…',
      imagePrompt: `Bright cartoon illustration of ${concept} for Foundation classroom`,
    })),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

async function getAIText(
  prompt: string,
  task: string,
  context?: { projectId?: string; userId?: string }
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey || apiKey === 'your_openrouter_api_key') return ''

  const result = await callOpenRouter(prompt, task)

  // Fire-and-forget usage log
  logUsage({
    project_id: context?.projectId,
    user_id: context?.userId,
    task,
    model: result.model,
    prompt_tokens: result.usage.prompt_tokens,
    completion_tokens: result.usage.completion_tokens,
    total_tokens: result.usage.total_tokens,
    cost_usd: result.cost_usd,
  })

  return result.text
}

function stripJsonFences(text: string): string {
  return text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
}

export async function generateSlidePlan(
  curriculum: CurriculumOutcome,
  context?: { projectId?: string; userId?: string }
): Promise<SlidePlanItem[]> {
  const text = await getAIText(buildSlidePlanPrompt(curriculum), 'slide_plan', context)
  if (!text) return mockSlidePlan(curriculum)
  try {
    return JSON.parse(stripJsonFences(text)).plan
  } catch {
    return mockSlidePlan(curriculum)
  }
}

export async function generateSlideContent(
  slide: { title: string; slide_type: string },
  curriculum: CurriculumOutcome,
  context?: { projectId?: string; userId?: string }
): Promise<SlideContent> {
  const text = await getAIText(buildSlideContentPrompt(slide, curriculum), 'slide_content', context)
  if (!text) return mockSlideContent(slide, curriculum)
  try {
    return JSON.parse(stripJsonFences(text))
  } catch {
    return mockSlideContent(slide, curriculum)
  }
}

export async function generateLessonPlan(
  curriculum: CurriculumOutcome,
  context?: { projectId?: string; userId?: string }
): Promise<LessonPlan> {
  const text = await getAIText(buildLessonPlanPrompt(curriculum), 'lesson_plan', context)
  if (!text) return mockLessonPlan(curriculum)
  try {
    return JSON.parse(stripJsonFences(text))
  } catch {
    return mockLessonPlan(curriculum)
  }
}

export async function generateInfographic(
  curriculum: CurriculumOutcome,
  context?: { projectId?: string; userId?: string }
): Promise<InfographicContent> {
  const text = await getAIText(buildInfographicPrompt(curriculum), 'infographic', context)
  if (!text) return mockInfographic(curriculum)
  try {
    return JSON.parse(stripJsonFences(text))
  } catch {
    return mockInfographic(curriculum)
  }
}

export async function generateImage(_prompt: string): Promise<string | null> {
  // Image generation placeholder — wire up DALL-E or Replicate here
  return null
}
