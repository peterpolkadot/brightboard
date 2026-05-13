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

export function UsersTab({
  profiles,
  authUsers,
  projects,
}: {
  profiles: Profile[]
  authUsers: AuthUser[]
  projects: Project[]
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

  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-black text-stone-900">Brightboard Users</h2>
          <p className="text-xs font-semibold text-stone-400">Only users with Brightboard profiles, projects, or usage.</p>
        </div>
        <Badge variant="secondary">{users.length} total</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-100">
              {['Name', 'Email', 'School', 'Projects', 'Profile', 'Last sign in', 'Joined'].map(h => (
                <th key={h} className="text-left font-black text-stone-500 pb-3 pr-4 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr><td colSpan={7} className="py-8 text-center text-stone-400 font-medium">No users yet.</td></tr>
            )}
            {users.map(p => {
              const count = projects.filter(pr => pr.user_id === p.id).length
              return (
                <tr key={p.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                  <td className="py-3 pr-4 font-bold text-stone-800">{p.full_name ?? '-'}</td>
                  <td className="py-3 pr-4 text-stone-600 font-medium">{p.email}</td>
                  <td className="py-3 pr-4 text-stone-500">{p.school ?? '-'}</td>
                  <td className="py-3 pr-4"><Badge variant="secondary">{count}</Badge></td>
                  <td className="py-3 pr-4">
                    <Badge variant={p.hasProfile ? 'success' : 'warning'}>
                      {p.hasProfile ? 'Profile' : 'Auth only'}
                    </Badge>
                  </td>
                  <td className="py-3 pr-4 text-stone-400">
                    {p.last_sign_in_at ? formatDate(p.last_sign_in_at) : '-'}
                  </td>
                  <td className="py-3 text-stone-400">{formatDate(p.created_at)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
