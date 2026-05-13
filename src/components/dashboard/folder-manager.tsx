'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'

interface Folder {
  id: string
  name: string
  color: string
  created_at: string
}

interface Project {
  id: string
  title: string
  subject: string
  resource_type: string
  status: string
  thumbnail_url: string | null
  folder_id: string | null
  updated_at: string
}

interface Props {
  initialFolders: Folder[]
  initialProjects: Project[]
}

const RESOURCE_LABELS: Record<string, string> = {
  slide_deck: 'Slide Deck',
  infographic: 'Infographic',
  lesson_plan: 'Lesson Plan',
}

const RESOURCE_ICONS: Record<string, string> = {
  slide_deck: '🎨',
  infographic: '🖼️',
  lesson_plan: '📋',
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'warning',
  generating: 'info',
  complete: 'success',
}

const FOLDER_COLORS = ['#F79009', '#14B8A6', '#8B5CF6', '#EC4899', '#22C55E', '#0EA5E9']

export function FolderManager({ initialFolders, initialProjects }: Props) {
  const [folders, setFolders] = useState(initialFolders)
  const [projects, setProjects] = useState(initialProjects)
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderColor, setNewFolderColor] = useState(FOLDER_COLORS[0])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')

  const filteredProjects = useMemo(() => {
    if (selectedFolderId === null) return projects
    if (selectedFolderId === 'unfiled') return projects.filter(project => !project.folder_id)
    return projects.filter(project => project.folder_id === selectedFolderId)
  }, [projects, selectedFolderId])

  async function createFolder() {
    if (!newFolderName.trim()) return
    const res = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName, color: newFolderColor }),
    })
    if (!res.ok) return
    const data = await res.json()
    setFolders(prev => [...prev, data.folder])
    setNewFolderName('')
  }

  async function updateFolder(folderId: string, updates: { name?: string; color?: string }) {
    const res = await fetch(`/api/folders/${folderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) return
    const data = await res.json()
    setFolders(prev => prev.map(folder => folder.id === folderId ? data.folder : folder))
    setEditingId(null)
  }

  async function deleteFolder(folderId: string) {
    const res = await fetch(`/api/folders/${folderId}`, { method: 'DELETE' })
    if (!res.ok) return
    setFolders(prev => prev.filter(folder => folder.id !== folderId))
    setProjects(prev => prev.map(project => project.folder_id === folderId ? { ...project, folder_id: null } : project))
    if (selectedFolderId === folderId) setSelectedFolderId(null)
  }

  async function moveProject(projectId: string, folderId: string | null) {
    const res = await fetch('/api/projects/folder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, folderId }),
    })
    if (!res.ok) return
    const data = await res.json()
    setProjects(prev => prev.map(project => project.id === projectId ? data.project : project))
  }

  function countFor(folderId: string | null) {
    return projects.filter(project => project.folder_id === folderId).length
  }

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">
      <aside className="bg-white rounded-3xl border border-amber-100 shadow-card p-5">
        <h2 className="font-black text-stone-900 mb-4">Folders</h2>

        <div className="space-y-2 mb-5">
          <FolderButton
            active={selectedFolderId === null}
            label="All resources"
            count={projects.length}
            color="#F79009"
            onClick={() => setSelectedFolderId(null)}
          />
          <FolderButton
            active={selectedFolderId === 'unfiled'}
            label="Unfiled"
            count={countFor(null)}
            color="#A8A29E"
            onClick={() => setSelectedFolderId('unfiled')}
          />
          {folders.map(folder => (
            <div key={folder.id} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-2">
              {editingId === folder.id ? (
                <div className="space-y-2">
                  <input
                    value={editingName}
                    onChange={event => setEditingName(event.target.value)}
                    className="w-full h-9 rounded-xl border border-amber-200 px-3 text-sm font-bold focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateFolder(folder.id, { name: editingName })}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <FolderButton
                    active={selectedFolderId === folder.id}
                    label={folder.name}
                    count={countFor(folder.id)}
                    color={folder.color}
                    onClick={() => setSelectedFolderId(folder.id)}
                  />
                  <div className="flex items-center justify-between gap-2 mt-2 px-2">
                    <div className="flex gap-1">
                      {FOLDER_COLORS.map(color => (
                        <button
                          key={color}
                          aria-label={`Set folder color ${color}`}
                          onClick={() => updateFolder(folder.id, { color })}
                          className="h-5 w-5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingId(folder.id)
                          setEditingName(folder.name)
                        }}
                        className="text-xs font-bold text-stone-500 hover:text-stone-800"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => deleteFolder(folder.id)}
                        className="text-xs font-bold text-red-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-amber-100 pt-4">
          <label className="block text-xs font-black uppercase tracking-wide text-stone-400 mb-2">New folder</label>
          <input
            value={newFolderName}
            onChange={event => setNewFolderName(event.target.value)}
            placeholder="e.g. Science Term 1"
            className="w-full h-10 rounded-2xl border border-amber-200 px-3 text-sm font-bold focus:outline-none focus:border-amber-400 mb-3"
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex gap-1">
              {FOLDER_COLORS.map(color => (
                <button
                  key={color}
                  aria-label={`Choose folder color ${color}`}
                  onClick={() => setNewFolderColor(color)}
                  className={`h-6 w-6 rounded-full border-2 ${newFolderColor === color ? 'border-stone-800' : 'border-white'} shadow-sm`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <Button size="sm" onClick={createFolder}>Create</Button>
          </div>
        </div>
      </aside>

      <section>
        <div className="flex items-center justify-between gap-4 mb-5">
          <h2 className="text-xl font-black text-stone-800">Recent projects</h2>
          <Badge variant="secondary">{filteredProjects.length} shown</Badge>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-3xl border border-amber-100 shadow-card p-10 text-center">
            <div className="text-5xl mb-3">📁</div>
            <p className="font-black text-stone-800">No resources in this folder yet</p>
            <p className="text-sm font-medium text-stone-400 mt-1">Move a project here from another folder.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                folders={folders}
                onMove={moveProject}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function FolderButton({
  active,
  label,
  count,
  color,
  onClick,
}: {
  active: boolean
  label: string
  count: number
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
        active ? 'bg-white shadow-sm' : 'hover:bg-white/70'
      }`}
    >
      <span className="flex items-center gap-2 min-w-0">
        <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="font-bold text-sm text-stone-700 truncate">{label}</span>
      </span>
      <span className="text-xs font-black text-stone-400">{count}</span>
    </button>
  )
}

function ProjectCard({
  project,
  folders,
  onMove,
}: {
  project: Project
  folders: Folder[]
  onMove: (projectId: string, folderId: string | null) => void
}) {
  return (
    <div className="group bg-white rounded-3xl border border-amber-100 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-1 overflow-hidden">
      <Link href={`/project/${project.id}`}>
        <div className="aspect-video bg-gradient-to-br from-amber-50 via-yellow-50 to-sky-50 flex items-center justify-center relative">
          {project.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">{RESOURCE_ICONS[project.resource_type] ?? '📄'}</span>
          )}
          <div className="absolute top-3 right-3">
            <Badge variant={STATUS_VARIANT[project.status] ?? 'secondary'}>{project.status}</Badge>
          </div>
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/project/${project.id}`}>
          <h3 className="font-black text-stone-900 text-sm leading-tight line-clamp-2 mb-2">{project.title}</h3>
        </Link>
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant="secondary">{RESOURCE_LABELS[project.resource_type]}</Badge>
          <Badge variant="secondary">{project.subject}</Badge>
        </div>
        <select
          value={project.folder_id ?? ''}
          onChange={event => onMove(project.id, event.target.value || null)}
          className="w-full h-9 rounded-xl border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-stone-700 focus:outline-none focus:border-amber-400"
        >
          <option value="">Unfiled</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
        <p className="text-xs text-stone-400 font-medium mt-3">Updated {formatDate(project.updated_at)}</p>
      </div>
    </div>
  )
}
