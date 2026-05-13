'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'

interface OpenRouterModel {
  id: string
  name: string
  context_length: number
  architecture?: {
    input_modalities?: string[]
    output_modalities?: string[]
  }
  pricing: {
    prompt: string
    completion: string
    request?: string
    image?: string
  }
}

interface Props {
  settings: Record<string, unknown>
}

const DEFAULT_IMAGE_MODEL = 'google/gemini-3.1-flash-image-preview'

export function SettingsTab({ settings }: Props) {
  const [models, setModels] = useState<OpenRouterModel[]>([])
  const [imageModels, setImageModels] = useState<OpenRouterModel[]>([])
  const [loadingModels, setLoadingModels] = useState(false)
  const [activeModel, setActiveModel] = useState<string>(
    typeof settings.active_model === 'string'
      ? settings.active_model
      : 'anthropic/claude-sonnet-4-5'
  )
  const [activeImageModel, setActiveImageModel] = useState<string>(
    typeof settings.active_image_model === 'string'
      ? settings.active_image_model
      : DEFAULT_IMAGE_MODEL
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  async function fetchModels() {
    setLoadingModels(true)
    setError(null)
    try {
      const [textRes, imageRes] = await Promise.all([
        fetch('/api/admin/models'),
        fetch('/api/admin/models?output_modalities=image'),
      ])
      if (!textRes.ok || !imageRes.ok) throw new Error('Failed to fetch models')
      const textData = await textRes.json()
      const imageData = await imageRes.json()
      setModels(textData.models ?? [])
      setImageModels(imageData.models ?? [])
    } catch {
      setError('Could not load models from OpenRouter.')
    } finally {
      setLoadingModels(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchModels()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  async function saveSetting(key: string, value: string) {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    if (!res.ok) throw new Error(`Failed to save ${key}`)
  }

  async function saveModels() {
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      await saveSetting('active_model', activeModel)
      if (activeImageModel) await saveSetting('active_image_model', activeImageModel)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Could not save model settings.')
    } finally {
      setSaving(false)
    }
  }

  const selectedModel = models.find(m => m.id === activeModel)
  const selectedImageModel = imageModels.find(m => m.id === activeImageModel)
  const filtered = models.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  )

  function fmtCost(val?: string) {
    if (!val) return 'n/a'
    const n = parseFloat(val)
    if (isNaN(n) || n === 0) return 'free'
    return `$${(n * 1_000_000).toFixed(2)}/M`
  }

  const providers = [...new Set(filtered.map(m => m.id.split('/')[0]))].sort()

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-stone-900 mb-1">Slide Content Model</h2>
            <p className="text-sm text-stone-500 font-medium">
              This model designs slide plans, slide copy, lesson plans, and infographic content JSON.
            </p>
          </div>
          <Button onClick={saveModels} disabled={saving} variant={saved ? 'sky' : 'default'} size="sm">
            {saving ? <><Spinner size="sm" /> Saving...</> : saved ? 'Saved' : 'Save'}
          </Button>
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
            <span className="text-stone-500 font-medium">Loading models from OpenRouter...</span>
          </div>
        )}

        {selectedModel && (
          <div className="mb-5 bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black text-amber-700 uppercase tracking-wide mb-1">Active slide content model</p>
                <p className="font-black text-stone-900">{selectedModel.name}</p>
                <p className="text-xs font-mono text-stone-500 mt-0.5">{selectedModel.id}</p>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                <Badge variant="info">{(selectedModel.context_length / 1000).toFixed(0)}K ctx</Badge>
                <Badge variant="success">in {fmtCost(selectedModel.pricing.prompt)}</Badge>
                <Badge variant="warning">out {fmtCost(selectedModel.pricing.completion)}</Badge>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search text models..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-2xl border-2 border-amber-200 bg-white px-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:border-amber-400 focus:outline-none"
          />
        </div>

        {!loadingModels && (
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
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
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-black text-stone-900 mb-1">Image Generation Model</h2>
            <p className="text-sm text-stone-500 font-medium">
              This separate image-capable model creates the artwork for slide previews and infographic resources.
            </p>
          </div>
          <Badge variant="success">{imageModels.length} image models</Badge>
        </div>

        {selectedImageModel && (
          <div className="mb-5 bg-teal-50 rounded-2xl border border-teal-200 p-4">
            <p className="text-xs font-black text-teal-700 uppercase tracking-wide mb-1">Active image model</p>
            <p className="font-black text-stone-900">{selectedImageModel.name}</p>
            <p className="text-xs font-mono text-stone-500 mt-0.5">{selectedImageModel.id}</p>
            <div className="flex gap-2 flex-wrap mt-3">
              <Badge variant="info">{(selectedImageModel.context_length / 1000).toFixed(0)}K ctx</Badge>
              <Badge variant="success">image {fmtCost(selectedImageModel.pricing.image)}</Badge>
              <Badge variant="warning">request {fmtCost(selectedImageModel.pricing.request)}</Badge>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {imageModels.map(model => (
            <button
              key={model.id}
              onClick={() => setActiveImageModel(model.id)}
              className={`w-full text-left rounded-2xl border-2 px-4 py-3 transition-all duration-150 ${
                activeImageModel === model.id
                  ? 'border-teal-400 bg-teal-50 shadow-sm'
                  : 'border-stone-100 hover:border-teal-200 hover:bg-teal-50/50'
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
                  <span className="text-xs bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                    image {fmtCost(model.pricing.image)}
                  </span>
                </div>
              </div>
            </button>
          ))}
          {imageModels.length === 0 && !loadingModels && (
            <p className="text-center text-stone-400 font-medium py-8">
              No image-capable models loaded. Add an OpenRouter API key and refresh.
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-stone-400 font-medium">
            {models.length} text models · {imageModels.length} image models
          </p>
          <Button variant="ghost" size="sm" onClick={fetchModels} disabled={loadingModels}>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  )
}
