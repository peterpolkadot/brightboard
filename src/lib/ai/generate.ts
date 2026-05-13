// AI generation utilities — currently scaffolded with structured mock data
// Replace with real Anthropic/OpenAI API calls by adding ANTHROPIC_API_KEY to .env.local

import type { CurriculumOutcome, SlidePlanItem, SlideContent, LessonPlan, InfographicContent } from '@/types'
import {
  buildSlidePlanPrompt,
  buildSlideContentPrompt,
  buildLessonPlanPrompt,
  buildInfographicPrompt,
} from './prompts'

// ─── Shared call function ────────────────────────────────────────────────────

async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey || apiKey === 'your_anthropic_api_key') {
    throw new Error('ANTHROPIC_API_KEY not configured. Add it to .env.local to enable generation.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic API error: ${err}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// ─── Mock fallbacks (used when no API key) ───────────────────────────────────

function mockSlidePlan(curriculum: CurriculumOutcome): SlidePlanItem[] {
  return [
    { position: 1, title: curriculum.title, slideType: 'title', description: 'Title slide introducing the topic' },
    { position: 2, title: 'What We Will Learn', slideType: 'overview', description: 'Overview of learning goals for this lesson' },
    ...curriculum.concepts.slice(0, 4).map((concept, i) => ({
      position: i + 3,
      title: concept.charAt(0).toUpperCase() + concept.slice(1),
      slideType: 'content' as const,
      description: `Exploring the concept of ${concept}`,
    })),
    { position: curriculum.concepts.slice(0, 4).length + 3, title: 'Let\'s Try It!', slideType: 'activity', description: 'Hands-on activity for students' },
    { position: curriculum.concepts.slice(0, 4).length + 4, title: 'What Did We Learn?', slideType: 'summary', description: 'Key takeaways and review' },
  ]
}

function mockSlideContent(slide: { title: string; slide_type: string }, curriculum: CurriculumOutcome): SlideContent {
  const isTitle = slide.slide_type === 'title'
  const isActivity = slide.slide_type === 'activity'
  const isSummary = slide.slide_type === 'summary'

  return {
    title: slide.title,
    body: isTitle
      ? `Foundation ${curriculum.subject.charAt(0).toUpperCase() + curriculum.subject.slice(1)} · ${curriculum.code}`
      : isActivity
      ? 'Work with a partner to explore this idea!'
      : isSummary
      ? 'Let\'s remember what we learned today.'
      : curriculum.description.split('.')[0] + '.',
    bullets: isTitle || isSummary
      ? undefined
      : curriculum.learningGoals.slice(0, 3).map(g => g.replace(/^[A-Z]/, c => c)),
    imagePrompt: `Bright, colourful cartoon illustration for an Australian Foundation classroom showing ${slide.title.toLowerCase()}. Child-friendly, warm colours, simple shapes, educational, no text in image.`,
    notes: `Teacher note: Discuss with students and encourage observations.`,
    slideType: slide.slide_type as SlideContent['slideType'],
  }
}

function mockLessonPlan(curriculum: CurriculumOutcome): LessonPlan {
  return {
    learningIntention: `We are learning to ${curriculum.learningGoals[0]?.toLowerCase() ?? 'explore ' + curriculum.title.toLowerCase()}.`,
    successCriteria: curriculum.learningGoals.map(g => `I can ${g.toLowerCase().replace(/^[A-Z]/, c => c.toLowerCase())}`),
    materialsNeeded: ['Picture books related to topic', 'Sorting cards', 'Drawing paper and crayons', 'Interactive whiteboard'],
    activities: [
      { name: 'Warm-up Discussion', duration: '10 minutes', description: 'Gather students on the mat. Ask what they already know about the topic. Show visual stimulus (picture or video clip).' },
      { name: 'Whole Class Teaching', duration: '15 minutes', description: `Introduce key vocabulary: ${curriculum.vocabulary.slice(0, 4).join(', ')}. Use slides to guide discussion. Ask questions throughout.` },
      { name: 'Hands-on Activity', duration: '15 minutes', description: 'Students complete a sorting or sequencing activity in pairs. Teacher circulates and checks for understanding.' },
      { name: 'Share and Reflect', duration: '10 minutes', description: 'Students share one thing they learned. Return to success criteria — thumbs up/middle/down self-assessment.' },
    ],
    discussionPrompts: [
      `What do you know about ${curriculum.title.toLowerCase()}?`,
      `Can you think of an example of ${curriculum.keywords[0]}?`,
      `Why is this important to learn about?`,
      `What was the most interesting thing you discovered today?`,
    ],
    assessmentIdeas: [
      'Observe student sorting/sequencing activity for accuracy',
      'Listen to oral explanations during share time',
      'Collect student drawings with labels as evidence',
    ],
    extensionIdeas: [
      `Research ${curriculum.title.toLowerCase()} further at home with a family member`,
      'Create a labelled diagram or mini-book about the topic',
    ],
    curriculumAlignment: `${curriculum.code} — ${curriculum.title} (${curriculum.strand})`,
  }
}

function mockInfographic(curriculum: CurriculumOutcome): InfographicContent {
  return {
    title: curriculum.title,
    subtitle: `Foundation ${curriculum.subject.charAt(0).toUpperCase() + curriculum.subject.slice(1)} · ${curriculum.code}`,
    layout: curriculum.concepts.length > 3 ? 'grid' : 'lifecycle',
    colorScheme: 'bright cartoon classroom',
    sections: curriculum.concepts.slice(0, 5).map((concept, i) => ({
      label: concept.charAt(0).toUpperCase() + concept.slice(1),
      content: (curriculum.description.split('.')[0]?.slice(0, 60) ?? concept) + '…',
      imagePrompt: `Bright cartoon illustration of ${concept} for Foundation classroom`,
    })),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateSlidePlan(curriculum: CurriculumOutcome): Promise<SlidePlanItem[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key') {
    return mockSlidePlan(curriculum)
  }

  const prompt = buildSlidePlanPrompt(curriculum)
  const text = await callAI(prompt)
  const parsed = JSON.parse(text)
  return parsed.plan
}

export async function generateSlideContent(
  slide: { title: string; slide_type: string },
  curriculum: CurriculumOutcome
): Promise<SlideContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key') {
    return mockSlideContent(slide, curriculum)
  }

  const prompt = buildSlideContentPrompt(slide, curriculum)
  const text = await callAI(prompt)
  return JSON.parse(text)
}

export async function generateLessonPlan(curriculum: CurriculumOutcome): Promise<LessonPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key') {
    return mockLessonPlan(curriculum)
  }

  const prompt = buildLessonPlanPrompt(curriculum)
  const text = await callAI(prompt)
  return JSON.parse(text)
}

export async function generateInfographic(curriculum: CurriculumOutcome): Promise<InfographicContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key') {
    return mockInfographic(curriculum)
  }

  const prompt = buildInfographicPrompt(curriculum)
  const text = await callAI(prompt)
  return JSON.parse(text)
}

export async function generateImage(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'your_openai_api_key') {
    return null
  }

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: `${prompt}. Style: bright, colourful, cartoon, child-friendly, Australian classroom, educational, warm and inviting, Foundation year appropriate.`,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
    }),
  })

  if (!response.ok) return null
  const data = await response.json()
  return data.data?.[0]?.url ?? null
}
