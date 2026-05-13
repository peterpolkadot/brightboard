import type { CurriculumOutcome, SlidePlanItem } from '@/types'

export function buildSlidePlanPrompt(curriculum: CurriculumOutcome): string {
  return `You are an expert Australian Foundation (ages 5–6) curriculum designer.

Create a slide deck plan for the following curriculum outcome:

Curriculum code: ${curriculum.code}
Title: ${curriculum.title}
Strand: ${curriculum.strand}
Description: ${curriculum.description}
Key concepts: ${curriculum.concepts.join(', ')}
Vocabulary: ${curriculum.vocabulary.join(', ')}
Learning goals: ${curriculum.learningGoals.join('; ')}

Requirements:
- 8–10 slides total
- Include: title slide, overview slide, 4–6 content/concept slides, 1 activity slide, 1 summary slide
- Each slide must be appropriate for 5–6 year olds (Foundation level)
- Visual-first: minimal text, maximum engagement
- Slide types available: title, overview, content, fact, lifecycle, activity, summary

Respond with valid JSON only, no markdown:
{
  "plan": [
    {
      "position": 1,
      "title": "slide title",
      "slideType": "title|overview|content|fact|lifecycle|activity|summary",
      "description": "brief description of what this slide covers"
    }
  ]
}`
}

export function buildSlideContentPrompt(
  slide: { title: string; slide_type: string },
  curriculum: CurriculumOutcome
): string {
  return `You are an expert Australian Foundation (ages 5–6) teacher and educational content designer.

Generate the content for this slide:

Slide title: ${slide.title}
Slide type: ${slide.slide_type}

Curriculum context:
- Code: ${curriculum.code}
- Topic: ${curriculum.title}
- Description: ${curriculum.description}
- Keywords: ${curriculum.keywords.join(', ')}
- Vocabulary: ${curriculum.vocabulary.join(', ')}

Foundation pedagogy rules:
- Use simple vocabulary (5–6 year old level)
- Maximum 20 words per text element
- Bullet points: max 3, each max 8 words
- Avoid long paragraphs
- Use engaging, warm, classroom-friendly language
- Activity slides: describe a hands-on activity students can do
- Summary slides: 2–3 key takeaways only

Also generate an image prompt for this slide that will produce a colourful, cartoon-style educational illustration suitable for an Australian Foundation classroom.

Respond with valid JSON only, no markdown:
{
  "title": "slide title",
  "body": "main text (max 20 words, or empty string)",
  "bullets": ["bullet 1 max 8 words", "bullet 2", "bullet 3"],
  "imagePrompt": "detailed image generation prompt for a bright cartoon classroom style illustration",
  "notes": "teacher notes",
  "slideType": "${slide.slide_type}"
}`
}

export function buildLessonPlanPrompt(curriculum: CurriculumOutcome): string {
  return `You are an expert Australian Foundation (ages 5–6) classroom teacher writing a practical lesson plan.

Create a complete lesson plan for:

Curriculum code: ${curriculum.code}
Title: ${curriculum.title}
Strand: ${curriculum.strand}
Description: ${curriculum.description}
Learning goals: ${curriculum.learningGoals.join('; ')}
Keywords: ${curriculum.keywords.join(', ')}

Requirements:
- Practical, classroom-ready language
- No bureaucratic jargon
- Foundation-appropriate activities (5–6 year olds)
- Include hands-on, visual, and discussion elements
- 3–4 activities of varying duration
- Total lesson: approximately 50–60 minutes

Respond with valid JSON only, no markdown:
{
  "learningIntention": "We are learning to... (simple, child-friendly language)",
  "successCriteria": ["I can... statement 1", "I can... statement 2", "I can... statement 3"],
  "materialsNeeded": ["item 1", "item 2", "item 3"],
  "activities": [
    {
      "name": "Activity name",
      "duration": "10 minutes",
      "description": "What teacher and students do"
    }
  ],
  "discussionPrompts": ["Question 1?", "Question 2?", "Question 3?"],
  "assessmentIdeas": ["Observation idea", "Product idea"],
  "extensionIdeas": ["Extension for fast finishers", "Home connection"],
  "curriculumAlignment": "${curriculum.code} — ${curriculum.title}"
}`
}

export function buildInfographicPrompt(curriculum: CurriculumOutcome): string {
  return `You are an expert Foundation educator designing a visual infographic resource for 5–6 year olds.

Create an infographic content plan for:

Curriculum code: ${curriculum.code}
Title: ${curriculum.title}
Description: ${curriculum.description}
Concepts: ${curriculum.concepts.join(', ')}

Requirements:
- Single page visual resource
- Minimal text per section (max 15 words each)
- 4–6 sections maximum
- Use simple, engaging labels
- Choose layout: lifecycle (for processes), grid (for facts/comparisons), flow (for sequences)
- Must print cleanly at A4

Respond with valid JSON only, no markdown:
{
  "title": "Infographic title",
  "subtitle": "Optional subtitle",
  "layout": "lifecycle|grid|flow|comparison",
  "colorScheme": "bright and warm",
  "sections": [
    {
      "label": "Section label",
      "content": "Brief content (max 15 words)",
      "imagePrompt": "Image prompt for this section's illustration"
    }
  ]
}`
}
