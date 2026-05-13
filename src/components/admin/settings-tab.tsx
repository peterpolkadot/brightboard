'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

interface OpenRouterModel {
  id: string
  name: string
  context_length: number
  pricing: { prompt: string; completion: string }
}

interface Props {
  settings: Record<string, unknown>
}

export function SettingsTab({ settings }: Props) {
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [activeModel, setActiveModel] = useState<string>(
    typeof settings.active_model === 'string'
      ? settings.active_model
      : 'anthropic/claude-sonnet-4-5'
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function fetchModels() {
    setLoadingModels(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/models')
      if (!res.ok) throw new Error('Failed to fetch models')
      const data = await res.json()
      setModels(data.models ?? [])
    } catch {
      setError('Could not load models from OpenRouter.')
    } finally {
      setLoadingModels(false)
    }
  }

  useEffect(() => { fetchModels() }, [])

  async function saveModel() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'active_model', value: activeModel }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const selectedModel = models.find(m => m.id === activeModel)
  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  function fmtCost(val: string) {
    const n = parseFloat(val)
    if (isNaN(n) || n === 0) return 'free'
    // OpenRouter pricing is per token; show per 1M tokens
    return `$${(n * 1_000_000).toFixed(2)}/M`
  }

  // Group models by provider
  const providers = [...new Set(filtered.map(m => m.id.split('/')[0]))].sort()

  return (
    <div className="space-y-8">
      {/* Active model card */}
      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-stone-900 mb-1">Active AI Model</h2>
            <p className="text-sm text-stone-500 font-medium">
              This model is used for all content generation. Changes take effect immediately for new requests.
            </p>
          </div>
          <Button onClick={saveModel} disabled={saving} variant={saved ? 'sky' : 'default'} size="sm">
            {saving ? <><Spinner size="sm" /> Saving…</> : saved ? '✓ Saved' : 'Save'}
          </Button>
        </div>

        {selectedModel && (
          <div className="mb-5 bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black text-stone-900">{selectedModel.name}</p>
                <p className="text-xs font-mono text-stone-500 mt-0.5">{selectedModel.id}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Badge variant="info">
                  {(selectedModel.context_length / 1000).toFixed(0)}K ctx
                </Badge>
                <Badge variant="success">
                  in {fmtCost(selectedModel.pricing.prompt)}
                </Badge>
                <Badge variant="warning">
                  out {fmtCost(selectedModel.pricing.completion)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {!selectedModel && (
          <div className="mb-5 bg-stone-50 rounded-2xl border border-stone-200 p-4 text-sm font-mono text-stone-600">
            {activeModel}
          </div>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search models…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-2xl border-2 border-amber-200 bg-white px-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {error && (
          <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-medium mb-4">
            {error}
            <button onClick={fetchModels} className="ml-3 underline font-bold">Retry</button>
          </div>
        )}

        {loadingModels && (
          <div className="flex items-center gap-3 py-6 justify-center">
            <Spinner size="md" />
            <span className="text-stone-500 font-medium">Loading models from OpenRouter…</span>
          </div>
        )}

        {/* Model list grouped by provider */}
        {!loadingModels && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {providers.map(provider => {
              const providerModels = filtered.filter(m => m.id.startsWith(provider + '/'))
              return (
                <div key={provider}>
                  <p className="text-xs font-black text-stone-400 uppercase tracking-wide mb-2 px-1">{provider}</p>
                  <div className="space-y-1.5">
                    {providerModels.map(model => (
                      <button
                        key={model.id}
                        onClick={() => setActiveModel(model.id)}
                        className={`w-full text-left rounded-2xl border-2 px-4 py-3 transition-all duration-150 ${
                          activeModel === model.id
                            ? 'border-amber-400 bg-amber-50 shadow-sm'
                            : 'border-stone-100 hover:border-amber-200 hover:bg-amber-50/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="font-bold text-stone-800 text-sm">{model.name}</span>
                            <span className="ml-2 text-xs font-mono text-stone-400 truncate">{model.id}</span>
                          </div>
                          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
                            <span className="text-xs bg-stone-100 text-stone-600 font-semibold px-2 py-0.5 rounded-full">
                              {(model.context_length / 1000).toFixed(0)}K
                            </span>
                            <span className="text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                              {fmtCost(model.pricing.prompt)}
                            </span>
                            <span className="text-xs bg-orange-50 text-orange-700 font-semibold px-2 py-0.5 rounded-full">
                              {fmtCost(model.pricing.completion)}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && !loadingModels && (
              <p className="text-center text-stone-400 font-medium py-8">No models match your search.</p>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-stone-400 font-medium">
            {models.length} models available · Pricing per 1M tokens
          </p>
          <Button variant="ghost" size="sm" onClick={fetchModels} disabled={loadingModels}>
            ↺ Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}
