'use client'

import { useRouter } from 'next/navigation'
import { useCreateProjectStore } from '@/stores/create-project'
import { StepIndicator } from './step-indicator'
import { StepYearLevel } from './step-year-level'
import { StepSubject } from './step-subject'
import { StepCurriculum } from './step-curriculum'
import { StepResourceType } from './step-resource-type'
import { StepVisualStyle } from './step-visual-style'
import { createClient } from '@/lib/supabase/client'

const STEPS = [
  { num: 1, label: 'Year Level' },
  { num: 2, label: 'Subject' },
  { num: 3, label: 'Curriculum' },
  { num: 4, label: 'Resource Type' },
  { num: 5, label: 'Visual Style' },
]

export function CreateWizard() {
  const { step, yearLevel, subject, curriculumOutcome, resourceType, visualStyle, reset } = useCreateProjectStore()
  const router = useRouter()

  async function handleFinish() {
    const supabase = createClient()
    if (!yearLevel || !subject || !curriculumOutcome || !resourceType || !visualStyle) return

    const title = `${curriculumOutcome.title} — ${resourceType.replace('_', ' ')}`

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user!.id,
        title,
        year_level: yearLevel,
        subject,
        curriculum_code: curriculumOutcome.code,
        resource_type: resourceType,
        visual_style: visualStyle,
        status: 'draft',
      })
      .select()
      .single()

    if (error || !data) {
      console.error(error)
      return
    }

    reset()
    router.push(`/project/${data.id}`)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 mb-2">Create a new resource</h1>
        <p className="text-stone-500 font-medium">Follow the steps below to generate your classroom resource.</p>
      </div>

      <StepIndicator steps={STEPS} currentStep={step} />

      <div className="mt-8 bg-white rounded-3xl border border-amber-100 shadow-card p-8">
        {step === 1 && <StepYearLevel />}
        {step === 2 && <StepSubject />}
        {step === 3 && <StepCurriculum />}
        {step === 4 && <StepResourceType />}
        {step === 5 && (
          <StepVisualStyle
            onFinish={handleFinish}
            curriculumOutcome={curriculumOutcome}
            resourceType={resourceType}
          />
        )}
      </div>
    </div>
  )
}
