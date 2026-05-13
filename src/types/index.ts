export type YearLevel = 'foundation'

export type Subject = 'science' | 'english'

export type ResourceType = 'slide_deck' | 'infographic' | 'lesson_plan'

export type VisualStyle = 'bright_cartoon_classroom'

export interface CurriculumOutcome {
  code: string
  title: string
  strand: string
  subStrand: string
  description: string
  concepts: string[]
  keywords: string[]
  vocabulary: string[]
  learningGoals: string[]
  subject: Subject
  yearLevel: YearLevel
}

export interface SlideContent {
  title: string
  body: string
  bullets?: string[]
  imagePrompt?: string
  imageUrl?: string
  notes?: string
  slideType: 'title' | 'overview' | 'content' | 'activity' | 'summary' | 'fact' | 'lifecycle'
}

export interface SlidePlanItem {
  position: number
  title: string
  slideType: SlideContent['slideType']
  description: string
}

export interface LessonPlan {
  learningIntention: string
  successCriteria: string[]
  materialsNeeded: string[]
  activities: {
    name: string
    duration: string
    description: string
  }[]
  discussionPrompts: string[]
  assessmentIdeas: string[]
  extensionIdeas: string[]
  curriculumAlignment: string
}

export interface InfographicContent {
  title: string
  subtitle: string
  sections: {
    label: string
    content: string
    imagePrompt: string
  }[]
  layout: 'lifecycle' | 'grid' | 'flow' | 'comparison'
  colorScheme: string
}

export interface Project {
  id: string
  title: string
  yearLevel: YearLevel
  subject: Subject
  curriculumCode: string
  resourceType: ResourceType
  visualStyle: VisualStyle
  status: 'draft' | 'generating' | 'complete'
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateProjectState {
  step: number
  yearLevel?: YearLevel
  subject?: Subject
  curriculumCode?: string
  curriculumOutcome?: CurriculumOutcome
  resourceType?: ResourceType
  visualStyle?: VisualStyle
}
