export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin/auth'
import { Nav } from '@/components/nav'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface UsageSummary {
  total_calls: number
  total_tokens: number
  total_cost_usd: number
  by_task: { task: string; calls: number; tokens: number; cost: number }[]
  by_model: { model: string; calls: number; tokens: number; cost: number }[]
}

function computeSummary(logs: {
  task: string
  model: string
  total_tokens: number
  cost_usd: number | null
}[]): UsageSummary {
  const byTask: Record<string, { calls: number; tokens: number; cost: number }> = {}
  const byModel: Record<string, { calls: number; tokens: number; cost: number }> = {}
  let totalCost = 0
  let totalTokens = 0

  for (const log of logs) {
    const cost = log.cost_usd ?? 0
    totalCost += cost
    totalTokens += log.total_tokens

    byTask[log.task] = byTask[log.task] ?? { calls: 0, tokens: 0, cost: 0 }
    byTask[log.task].calls++
    byTask[log.task].tokens += log.total_tokens
    byTask[log.task].cost += cost

    byModel[log.model] = byModel[log.model] ?? { calls: 0, tokens: 0, cost: 0 }
    byModel[log.model].calls++
    byModel[log.model].tokens += log.total_tokens
    byModel[log.model].cost += cost
  }

  return {
    total_calls: logs.length,
    total_tokens: totalTokens,
    total_cost_usd: totalCost,
    by_task: Object.entries(byTask).map(([task, v]) => ({ task, ...v })).sort((a, b) => b.calls - a.calls),
    by_model: Object.entries(byModel).map(([model, v]) => ({ model, ...v })),
  }
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !isAdminEmail(user.email)) redirect('/dashboard')

  // Fetch all data in parallel
  const [profilesRes, projectsRes, usageRes] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name, school, created_at').order('created_at', { ascending: false }),
    supabase.from('projects').select('id, user_id, title, resource_type, subject, status, created_at').order('created_at', { ascending: false }),
    supabase.from('usage_logs').select('*').order('created_at', { ascending: false }),
  ])

  const profiles = profilesRes.data ?? []
  const projects = projectsRes.data ?? []
  const usageLogs = usageRes.data ?? []
  const summary = computeSummary(usageLogs)

  const TASK_LABELS: Record<string, string> = {
    slide_plan: 'Slide Plan',
    slide_content: 'Slide Content',
    lesson_plan: 'Lesson Plan',
    infographic: 'Infographic',
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
            🔒 Admin only
          </div>
          <h1 className="text-3xl font-black text-stone-900">Admin Dashboard</h1>
          <p className="text-stone-500 font-medium mt-1">Users, projects, and AI usage</p>
        </div>

        {/* Top-level stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total users', value: profiles.length, icon: '👥', color: 'bg-violet-50 border-violet-200' },
            { label: 'Total projects', value: projects.length, icon: '📁', color: 'bg-amber-50 border-amber-200' },
            { label: 'AI calls', value: summary.total_calls.toLocaleString(), icon: '🤖', color: 'bg-teal-50 border-teal-200' },
            {
              label: 'Est. cost (USD)',
              value: summary.total_cost_usd > 0 ? `$${summary.total_cost_usd.toFixed(4)}` : '—',
              icon: '💰',
              color: 'bg-green-50 border-green-200',
            },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-4 bg-white ${stat.color}`}>
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-2xl font-black text-stone-900">{stat.value}</div>
              <div className="text-xs font-semibold text-stone-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* Usage by task */}
          <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
            <h2 className="text-lg font-black text-stone-900 mb-4">AI Usage by Task</h2>
            {summary.by_task.length === 0 ? (
              <p className="text-stone-400 font-medium text-sm">No AI calls yet.</p>
            ) : (
              <div className="space-y-3">
                {summary.by_task.map(row => (
                  <div key={row.task} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-stone-700">{TASK_LABELS[row.task] ?? row.task}</span>
                      <Badge variant="secondary">{row.calls} calls</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-700">{row.tokens.toLocaleString()} tokens</div>
                      {row.cost > 0 && (
                        <div className="text-xs text-stone-400">${row.cost.toFixed(4)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage by model */}
          <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
            <h2 className="text-lg font-black text-stone-900 mb-4">AI Usage by Model</h2>
            {summary.by_model.length === 0 ? (
              <p className="text-stone-400 font-medium text-sm">No AI calls yet.</p>
            ) : (
              <div className="space-y-3">
                {summary.by_model.map(row => (
                  <div key={row.model} className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-stone-600">{row.model}</span>
                      <div className="text-xs text-stone-400">{row.calls} calls</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-700">{row.tokens.toLocaleString()} tokens</div>
                      {row.cost > 0 && <div className="text-xs text-stone-400">${row.cost.toFixed(4)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6 mb-8">
          <h2 className="text-lg font-black text-stone-900 mb-4">Users ({profiles.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100">
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Name</th>
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Email</th>
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">School</th>
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Projects</th>
                  <th className="text-left font-black text-stone-500 pb-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-stone-400 font-medium">No users yet.</td></tr>
                )}
                {profiles.map(profile => {
                  const userProjects = projects.filter(p => p.user_id === profile.id)
                  return (
                    <tr key={profile.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors">
                      <td className="py-3 pr-4 font-bold text-stone-800">{profile.full_name ?? '—'}</td>
                      <td className="py-3 pr-4 text-stone-600 font-medium">{profile.email}</td>
                      <td className="py-3 pr-4 text-stone-500">{profile.school ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <Badge variant="secondary">{userProjects.length}</Badge>
                      </td>
                      <td className="py-3 text-stone-400 font-medium">{formatDate(profile.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent AI calls */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
          <h2 className="text-lg font-black text-stone-900 mb-4">Recent AI Calls</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100">
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Task</th>
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Model</th>
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Tokens</th>
                  <th className="text-left font-black text-stone-500 pb-3 pr-4">Cost</th>
                  <th className="text-left font-black text-stone-500 pb-3">When</th>
                </tr>
              </thead>
              <tbody>
                {usageLogs.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-stone-400 font-medium">No AI calls logged yet.</td></tr>
                )}
                {usageLogs.slice(0, 50).map(log => (
                  <tr key={log.id} className="border-b border-amber-50 hover:bg-amber-50/50 transition-colors">
                    <td className="py-2.5 pr-4">
                      <Badge variant="info">{TASK_LABELS[log.task] ?? log.task}</Badge>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-stone-500">{log.model.split('/').pop()}</td>
                    <td className="py-2.5 pr-4 font-bold text-stone-700">{log.total_tokens.toLocaleString()}</td>
                    <td className="py-2.5 pr-4 text-stone-500">
                      {log.cost_usd != null && log.cost_usd > 0 ? `$${log.cost_usd.toFixed(5)}` : '—'}
                    </td>
                    <td className="py-2.5 text-stone-400 text-xs">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
