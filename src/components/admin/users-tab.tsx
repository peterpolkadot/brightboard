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

interface Project {
  id: string
  user_id: string
  resource_type: string
  status: string
}

export function UsersTab({ profiles, projects }: { profiles: Profile[]; projects: Project[] }) {
  return (
    <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-black text-stone-900">Users</h2>
        <Badge variant="secondary">{profiles.length} total</Badge>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-100">
              {['Name', 'Email', 'School', 'Projects', 'Joined'].map(h => (
                <th key={h} className="text-left font-black text-stone-500 pb-3 pr-4 last:pr-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 && (
              <tr><td colSpan={5} className="py-8 text-center text-stone-400 font-medium">No users yet.</td></tr>
            )}
            {profiles.map(p => {
              const count = projects.filter(pr => pr.user_id === p.id).length
              return (
                <tr key={p.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                  <td className="py-3 pr-4 font-bold text-stone-800">{p.full_name ?? '—'}</td>
                  <td className="py-3 pr-4 text-stone-600 font-medium">{p.email}</td>
                  <td className="py-3 pr-4 text-stone-500">{p.school ?? '—'}</td>
                  <td className="py-3 pr-4"><Badge variant="secondary">{count}</Badge></td>
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
