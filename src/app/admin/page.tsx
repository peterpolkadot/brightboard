export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/auth'
import { Nav } from '@/components/nav'
import { AdminTabs } from '@/components/admin/admin-tabs'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  const [profilesRes, projectsRes, usageRes, settingsRes] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, school, created_at').order('created_at', { ascending: false }),
    supabase.from('projects').select('id, user_id, title, resource_type, subject, status, created_at').order('created_at', { ascending: false }),
    supabase.from('usage_logs').select('*').order('created_at', { ascending: false }),
    supabase.from('admin_settings').select('*'),
  ])

  const settings: Record<string, unknown> = {}
  for (const row of settingsRes.data ?? []) {
    settings[row.key] = row.value
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} isAdmin />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            🔒 Admin only
          </div>
          <h1 className="text-3xl font-black text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 font-medium mt-1">Users, usage, and platform settings</p>
        </div>

        <AdminTabs
          profiles={profilesRes.data ?? []}
          projects={projectsRes.data ?? []}
          usageLogs={usageRes.data ?? []}
          settings={settings}
        />
      </main>
    </div>
  )
}
