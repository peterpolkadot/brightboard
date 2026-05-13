export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { isAdminEmail } from '@/lib/admin/auth'
import { Button } from '@/components/ui/button'
import { getSubjectOptions } from '@/data/curriculum'
import { FolderManager } from '@/components/dashboard/folder-manager'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: projects }, { data: folders }] = await Promise.all([
    supabase
      .from('bb_projects')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('bb_folders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true }),
  ])

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'Teacher'
  const admin = isAdminEmail(user.email)
  const subjectCoverage = getSubjectOptions().slice(0, 8)

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} isAdmin={admin} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-stone-900">
              Good morning, {firstName}! 👋
            </h1>
            <p className="text-stone-500 font-medium mt-1">Your classroom resources</p>
          </div>
          <Link href="/create">
            <Button size="lg">+ Create new resource</Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total projects', value: projects?.length ?? 0, icon: '📁', color: 'bg-amber-50 border-amber-200' },
            { label: 'Slide decks', value: projects?.filter(p => p.resource_type === 'slide_deck').length ?? 0, icon: '🎨', color: 'bg-sky-50 border-sky-200' },
            { label: 'Infographics', value: projects?.filter(p => p.resource_type === 'infographic').length ?? 0, icon: '🖼️', color: 'bg-teal-50 border-teal-200' },
            { label: 'Lesson plans', value: projects?.filter(p => p.resource_type === 'lesson_plan').length ?? 0, icon: '📋', color: 'bg-violet-50 border-violet-200' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-4 ${stat.color} bg-white`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-stone-900">{stat.value}</div>
              <div className="text-xs font-semibold text-stone-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {!projects || projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-8">
            <FolderManager initialFolders={folders ?? []} initialProjects={projects} />

            <aside className="bg-white rounded-3xl border border-amber-100 shadow-card p-5">
              <h2 className="font-black text-stone-900 mb-1">Curriculum coverage</h2>
              <p className="text-xs font-semibold text-stone-400 mb-4">
                {subjectCoverage.reduce((sum, subject) => sum + subject.count, 0)} outcomes across featured Foundation subjects.
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                {subjectCoverage.map(subject => (
                  <div key={subject.id} className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 border border-amber-100 px-3 py-2">
                    <span className="text-sm font-bold text-stone-700 truncate">{subject.label}</span>
                    <span className="text-xs font-black text-amber-700">{subject.count}</span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        )}
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-7xl mb-6 animate-float inline-block">🌟</div>
      <h2 className="text-2xl font-black text-stone-900 mb-3">No resources yet</h2>
      <p className="text-stone-500 font-medium mb-8 max-w-sm mx-auto">
        Create your first curriculum-aligned resource in minutes. Your Foundation students will love it.
      </p>
      <Link href="/create">
        <Button size="lg">Create your first resource →</Button>
      </Link>
    </div>
  )
}
