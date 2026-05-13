import { create } from 'zustand'
import type { CreateProjectState, YearLevel, Subject, ResourceType, VisualStyle, CurriculumOutcome } from '@/types'

interface CreateProjectStore extends CreateProjectState {
  setStep: (step: number) => void
  setYearLevel: (yearLevel: YearLevel) => void
  setSubject: (subject: Subject) => void
  setCurriculum: (code: string, outcome: CurriculumOutcome) => void
  setResourceType: (type: ResourceType) => void
  setVisualStyle: (style: VisualStyle) => void
  reset: () => void
}

const initialState: CreateProjectState = {
  step: 1,
  yearLevel: undefined,
  subject: undefined,
  curriculumCode: undefined,
  curriculumOutcome: undefined,
  resourceType: undefined,
  visualStyle: undefined,
}

export const useCreateProjectStore = create<CreateProjectStore>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setYearLevel: (yearLevel) => set({ yearLevel, step: 2 }),
  setSubject: (subject) => set({ subject, step: 3 }),
  setCurriculum: (code, outcome) => set({ curriculumCode: code, curriculumOutcome: outcome, step: 4 }),
  setResourceType: (resourceType) => set({ resourceType, step: 5 }),
  setVisualStyle: (visualStyle) => set({ visualStyle }),
  reset: () => set(initialState),
}))
