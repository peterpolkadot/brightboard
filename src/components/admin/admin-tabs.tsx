'use client'

import { useState } from 'react'
import { UsageTab } from './usage-tab'
import { UsersTab } from './users-tab'
import { SettingsTab } from './settings-tab'
import { cn } from '@/lib/utils'

interface Props {
  profiles: {
    id: string
    email: string
    full_name: string | null
    school: string | null
    created_at: string
  }[]
  authUsers: {
    id: string
    email: string
    full_name: string | null
    created_at: string
    last_sign_in_at: string | null
  }[]
  projects: {
    id: string
    user_id: string
    title: string
    resource_type: string
    subject: string
    status: string
    created_at: string
  }[]
  usageLogs: {
    id: string
    task: string
    model: string
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    cost_usd: number | null
    created_at: string
  }[]
  settings: Record<string, unknown>
}

const TABS = [
  { id: 'usage', label: '📊 Usage & Costs' },
  { id: 'users', label: '👥 Users' },
  { id: 'settings', label: '⚙️ Settings' },
]

export function AdminTabs({ profiles, authUsers, projects, usageLogs, settings }: Props) {
  const [tab, setTab] = useState('usage')

  return (
    <div>
      <div className="flex gap-2 mb-8 bg-white rounded-2xl border border-amber-100 p-1.5 w-fit shadow-card">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              'px-5 py-2 rounded-xl text-sm font-bold transition-all',
              tab === t.id
                ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
                : 'text-stone-500 hover:text-stone-800 hover:bg-amber-50'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'usage'    && <UsageTab usageLogs={usageLogs} />}
      {tab === 'users'    && <UsersTab profiles={profiles} authUsers={authUsers} projects={projects} />}
      {tab === 'settings' && <SettingsTab settings={settings} />}
    </div>
  )
}
