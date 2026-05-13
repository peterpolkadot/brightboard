import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

async function getOwnedFolder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  folderId: string,
  userId: string
) {
  const { data } = await supabase
    .from('bb_folders')
    .select('id')
    .eq('id', folderId)
    .eq('user_id', userId)
    .single()
  return data
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const folder = await getOwnedFolder(supabase, id, user.id)
  if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })

  const { name, color } = await req.json()
  const updates: { name?: string; color?: string } = {}
  if (typeof name === 'string' && name.trim()) updates.name = name.trim().slice(0, 80)
  if (typeof color === 'string' && color.trim()) updates.color = color

  const { data, error } = await supabase
    .from('bb_folders')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ folder: data })
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const folder = await getOwnedFolder(supabase, id, user.id)
  if (!folder) return NextResponse.json({ error: 'Folder not found' }, { status: 404 })

  await supabase
    .from('bb_projects')
    .update({ folder_id: null })
    .eq('folder_id', id)
    .eq('user_id', user.id)

  const { error } = await supabase
    .from('bb_folders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
