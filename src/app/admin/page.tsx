export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminEmail } from '@/lib/admin/auth'
import { Nav } from '@/components/nav'
import { AdminTabs } from '@/components/admin/admin-tabs'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')
  const serviceSupabase = createAdminClient()
  const adminSupabase = serviceSupabase ?? supabase
  const authUsersPromise = serviceSupabase
    ? serviceSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
    : Promise.resolve(null)

  const [profilesRes, projectsRes, usageRes, settingsRes, authUsersRes] = await Promise.all([
    adminSupabase.from('bb_profiles').select('id, email, full_name, school, created_at').order('created_at', { ascending: false }),
    adminSupabase.from('bb_projects').select('id, user_id, title, resource_type, subject, status, created_at').order('created_at', { ascending: false }),
    adminSupabase.from('bb_usage_logs').select('*').order('created_at', { ascending: false }),
    adminSupabase.from('bb_admin_settings').select('*'),
    authUsersPromise,
  ])

  const settings: Record<string, unknown> = {}
  for (const row of settingsRes.data ?? []) {
    settings[row.key] = row.value
  }
  const brightboardUserIds = new Set<string>()
  for (const profile of profilesRes.data ?? []) brightboardUserIds.add(profile.id)
  for (const project of projectsRes.data ?? []) brightboardUserIds.add(project.user_id)
  for (const log of usageRes.data ?? []) {
    if (log.user_id) brightboardUserIds.add(log.user_id)
  }
  const brightboardAuthUsers = authUsersRes?.data?.users
    ?.filter(authUser => brightboardUserIds.has(authUser.id))
    .map(authUser => ({
      id: authUser.id,
      email: authUser.email ?? '',
      full_name: typeof authUser.user_metadata?.full_name === 'string' ? authUser.user_metadata.full_name : null,
      created_at: authUser.created_at,
      last_sign_in_at: authUser.last_sign_in_at ?? null,
    })) ?? []
  const usageByUser: Record<string, {
    calls: number
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    cost_usd: number
    last_call_at: string | null
  }> = {}
  for (const log of usageRes.data ?? []) {
    if (!log.user_id) continue
    usageByUser[log.user_id] ??= {
      calls: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      cost_usd: 0,
      last_call_at: null,
    }
    usageByUser[log.user_id].calls += 1
    usageByUser[log.user_id].prompt_tokens += log.prompt_tokens ?? 0
    usageByUser[log.user_id].completion_tokens += log.completion_tokens ?? 0
    usageByUser[log.user_id].total_tokens += log.total_tokens ?? 0
    usageByUser[log.user_id].cost_usd += Number(log.cost_usd ?? 0)
    const lastCallAt = usageByUser[log.user_id].last_call_at
    if (!lastCallAt || log.created_at > lastCallAt) {
      usageByUser[log.user_id].last_call_at = log.created_at
    }
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
          authUsers={brightboardAuthUsers}
          projects={projectsRes.data ?? []}
          usageByUser={usageByUser}
          usageLogs={usageRes.data ?? []}
          settings={settings}
        />
      </main>
    </div>
  )
}
