export const dynamic = 'force-dynamic'

import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { ProjectHub } from '@/components/project/project-hub'
import { getCurriculumByCode } from '@/data/curriculum'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  const { data: slides } = await supabase
    .from('slides')
    .select('*')
    .eq('project_id', id)
    .order('position')

  const { data: resources } = await supabase
    .from('resources')
    .select('*')
    .eq('project_id', id)

  const curriculum = getCurriculumByCode(project.curriculum_code)

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <ProjectHub
          project={project}
          slides={slides ?? []}
          resources={resources ?? []}
          curriculum={curriculum}
        />
      </main>
    </div>
  )
}
