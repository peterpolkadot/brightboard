'use client'

import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface UsageLog {
  id: string
  task: string
  model: string
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  cost_usd: number | null
  created_at: string
}

const TASK_LABELS: Record<string, string> = {
  slide_plan: 'Slide Plan',
  slide_content: 'Slide Content',
  lesson_plan: 'Lesson Plan',
  infographic: 'Infographic',
}

function summarise(logs: UsageLog[]) {
  const byTask: Record<string, { calls: number; tokens: number; cost: number }> = {}
  const byModel: Record<string, { calls: number; tokens: number; cost: number }> = {}
  let totalCost = 0
  let totalTokens = 0

  for (const log of logs) {
    const cost = log.cost_usd ?? 0
    totalCost += cost
    totalTokens += log.total_tokens

    byTask[log.task] ??= { calls: 0, tokens: 0, cost: 0 }
    byTask[log.task].calls++
    byTask[log.task].tokens += log.total_tokens
    byTask[log.task].cost += cost

    byModel[log.model] ??= { calls: 0, tokens: 0, cost: 0 }
    byModel[log.model].calls++
    byModel[log.model].tokens += log.total_tokens
    byModel[log.model].cost += cost
  }

  return {
    totalCalls: logs.length,
    totalTokens,
    totalCost,
    byTask: Object.entries(byTask).map(([task, v]) => ({ task, ...v })).sort((a, b) => b.calls - a.calls),
    byModel: Object.entries(byModel).map(([model, v]) => ({ model, ...v })),
  }
}

export function UsageTab({ usageLogs }: { usageLogs: UsageLog[] }) {
  const s = summarise(usageLogs)

  return (
    <div className="space-y-8">
      {/* Top stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total AI calls', value: s.totalCalls.toLocaleString(), icon: '🤖', color: 'bg-teal-50 border-teal-200' },
          { label: 'Total tokens', value: s.totalTokens.toLocaleString(), icon: '🔢', color: 'bg-violet-50 border-violet-200' },
          { label: 'Est. cost (USD)', value: s.totalCost > 0 ? `$${s.totalCost.toFixed(4)}` : '—', icon: '💰', color: 'bg-green-50 border-green-200' },
          { label: 'Avg tokens/call', value: s.totalCalls > 0 ? Math.round(s.totalTokens / s.totalCalls).toLocaleString() : '—', icon: '📈', color: 'bg-amber-50 border-amber-200' },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl border p-4 bg-white ${stat.color}`}>
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-black text-stone-900">{stat.value}</div>
            <div className="text-xs font-semibold text-stone-500">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* By task */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
          <h2 className="text-lg font-black text-stone-900 mb-4">By Task</h2>
          {s.byTask.length === 0
            ? <p className="text-stone-400 text-sm font-medium">No AI calls yet.</p>
            : <div className="space-y-3">
                {s.byTask.map(row => (
                  <div key={row.task} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-stone-700">{TASK_LABELS[row.task] ?? row.task}</span>
                      <Badge variant="secondary">{row.calls}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-700">{row.tokens.toLocaleString()} tokens</div>
                      {row.cost > 0 && <div className="text-xs text-stone-400">${row.cost.toFixed(4)}</div>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>

        {/* By model */}
        <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
          <h2 className="text-lg font-black text-stone-900 mb-4">By Model</h2>
          {s.byModel.length === 0
            ? <p className="text-stone-400 text-sm font-medium">No AI calls yet.</p>
            : <div className="space-y-3">
                {s.byModel.map(row => (
                  <div key={row.model} className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-stone-600">{row.model.split('/').pop()}</span>
                      <div className="text-xs text-stone-400">{row.calls} calls</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-700">{row.tokens.toLocaleString()} tokens</div>
                      {row.cost > 0 && <div className="text-xs text-stone-400">${row.cost.toFixed(4)}</div>}
                    </div>
                  </div>
                ))}
              </div>
          }
        </div>
      </div>

      {/* Recent calls log */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
        <h2 className="text-lg font-black text-stone-900 mb-4">Recent AI Calls</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-100">
                {['Task', 'Model', 'Prompt', 'Completion', 'Total', 'Cost', 'When'].map(h => (
                  <th key={h} className="text-left font-black text-stone-500 pb-3 pr-4 last:pr-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usageLogs.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-stone-400 font-medium">No calls yet.</td></tr>
              )}
              {usageLogs.slice(0, 100).map(log => (
                <tr key={log.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                  <td className="py-2.5 pr-4"><Badge variant="info">{TASK_LABELS[log.task] ?? log.task}</Badge></td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-stone-500">{log.model.split('/').pop()}</td>
                  <td className="py-2.5 pr-4 text-stone-600">{log.prompt_tokens.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-stone-600">{log.completion_tokens.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 font-bold text-stone-700">{log.total_tokens.toLocaleString()}</td>
                  <td className="py-2.5 pr-4 text-stone-500">{log.cost_usd != null && log.cost_usd > 0 ? `$${log.cost_usd.toFixed(5)}` : '—'}</td>
                  <td className="py-2.5 text-stone-400 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
