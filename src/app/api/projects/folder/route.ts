import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, folderId } = await req.json() as { projectId?: string; folderId?: string | null }
  if (!projectId) return NextResponse.json({ error: 'Project id is required' }, { status: 400 })

  const { data: project } = await supabase
    .from('bb_projects')
    .select('id')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()
  if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

  if (folderId) {
    const { data: folder } = await supabase
      .from('bb_folders')
      .select('id')
      .eq('id', folderId)
      .eq('user_id', user.id)
      .single()
    if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('bb_projects')
    .update({ folder_id: folderId ?? null })
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ project: data })
}
