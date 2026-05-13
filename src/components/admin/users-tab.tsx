'use client'

import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface Profile {
  id: string
  email: string
  full_name: string | null
  school: string | null
  created_at: string
}

interface AuthUser {
  id: string
  email: string
  full_name: string | null
  created_at: string
  last_sign_in_at: string | null
}

interface Project {
  id: string
  user_id: string
  resource_type: string
  status: string
}

interface UserUsage {
  calls: number
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: number
  last_call_at: string | null
}

export function UsersTab({
  profiles,
  authUsers,
  projects,
  usageByUser,
}: {
  profiles: Profile[]
  authUsers: AuthUser[]
  projects: Project[]
  usageByUser: Record<string, UserUsage>
}) {
  const profileById = new Map(profiles.map(profile => [profile.id, profile]))
  const users = authUsers.length > 0
    ? authUsers.map(authUser => {
        const profile = profileById.get(authUser.id)
        return {
          id: authUser.id,
          email: authUser.email || profile?.email || '',
          full_name: profile?.full_name ?? authUser.full_name,
          school: profile?.school ?? null,
          created_at: authUser.created_at || profile?.created_at || new Date().toISOString(),
          last_sign_in_at: authUser.last_sign_in_at,
          hasProfile: Boolean(profile),
        }
      })
    : profiles.map(profile => ({
        ...profile,
        last_sign_in_at: null,
        hasProfile: true,
      }))

  const totals = users.reduce((acc, user) => {
    const usage = usageByUser[user.id]
    acc.cost += usage?.cost_usd ?? 0
    acc.calls += usage?.calls ?? 0
    acc.tokens += usage?.total_tokens ?? 0
    return acc
  }, { cost: 0, calls: 0, tokens: 0 })

  const formatCost = (cost: number) => `$${cost.toFixed(5)}`

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-green-200 bg-white p-4">
          <div className="text-xs font-black text-stone-400 uppercase tracking-wide">User cost</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{formatCost(totals.cost)}</div>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-white p-4">
          <div className="text-xs font-black text-stone-400 uppercase tracking-wide">User AI calls</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{totals.calls.toLocaleString()}</div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white p-4">
          <div className="text-xs font-black text-stone-400 uppercase tracking-wide">User tokens</div>
          <div className="text-2xl font-black text-stone-900 mt-1">{totals.tokens.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-stone-900">Brightboard Users</h2>
            <p className="text-xs font-semibold text-stone-400">Costs are summed from bb_usage_logs on each admin page load.</p>
          </div>
          <Badge variant="secondary">{users.length} total</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-100">
                {['Name', 'Email', 'Projects', 'AI Calls', 'Tokens', 'Cost', 'Last AI Call', 'Profile', 'Last Sign In', 'Joined'].map(h => (
                  <th key={h} className="text-left font-black text-stone-500 pb-3 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={10} className="py-8 text-center text-stone-400 font-medium">No users yet.</td></tr>
              )}
              {users.map(p => {
                const count = projects.filter(pr => pr.user_id === p.id).length
                const usage = usageByUser[p.id] ?? {
                  calls: 0,
                  prompt_tokens: 0,
                  completion_tokens: 0,
                  total_tokens: 0,
                  cost_usd: 0,
                  last_call_at: null,
                }
                return (
                  <tr key={p.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                    <td className="py-3 pr-4 font-bold text-stone-800">{p.full_name ?? '-'}</td>
                    <td className="py-3 pr-4 text-stone-600 font-medium">{p.email}</td>
                    <td className="py-3 pr-4"><Badge variant="secondary">{count}</Badge></td>
                    <td className="py-3 pr-4 text-stone-600 font-bold">{usage.calls.toLocaleString()}</td>
                    <td className="py-3 pr-4 text-stone-600">{usage.total_tokens.toLocaleString()}</td>
                    <td className="py-3 pr-4 font-black text-stone-800">{formatCost(usage.cost_usd)}</td>
                    <td className="py-3 pr-4 text-stone-400">{usage.last_call_at ? formatDate(usage.last_call_at) : '-'}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={p.hasProfile ? 'success' : 'warning'}>
                        {p.hasProfile ? 'Profile' : 'Auth only'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-stone-400">{p.last_sign_in_at ? formatDate(p.last_sign_in_at) : '-'}</td>
                    <td className="py-3 text-stone-400">{formatDate(p.created_at)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
