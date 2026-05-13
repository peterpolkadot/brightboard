export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { isAdminEmail } from '@/lib/admin/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

const RESOURCE_LABELS: Record<string, string> = {
  slide_deck: 'Slide Deck',
  infographic: 'Infographic',
  lesson_plan: 'Lesson Plan',
}

const RESOURCE_ICONS: Record<string, string> = {
  slide_deck: '🎨',
  infographic: '🖼️',
  lesson_plan: '📋',
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'warning',
  generating: 'info',
  complete: 'success',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('bb_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  const firstName = user.user_metadata?.full_name?.split(' ')[0] ?? 'Teacher'
  const admin = isAdminEmail(user.email)

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} isAdmin={admin} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
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

        {/* Stats */}
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

        {/* Projects grid */}
        {!projects || projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            <h2 className="text-xl font-black text-stone-800 mb-5">Recent projects</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <Link key={project.id} href={`/project/${project.id}`}>
                  <div className="group bg-white rounded-3xl border border-amber-100 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 overflow-hidden cursor-pointer">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-gradient-to-br from-amber-50 via-yellow-50 to-sky-50 flex items-center justify-center relative">
                      {project.thumbnail_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl">{RESOURCE_ICONS[project.resource_type] ?? '📄'}</span>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge variant={STATUS_VARIANT[project.status] ?? 'secondary'}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-black text-stone-900 text-sm leading-tight line-clamp-2">
                          {project.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{RESOURCE_LABELS[project.resource_type]}</Badge>
                        <Badge variant="secondary">{project.subject}</Badge>
                      </div>
                      <p className="text-xs text-stone-400 font-medium mt-3">
                        Updated {formatDate(project.updated_at)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
