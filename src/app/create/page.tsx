export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Nav } from '@/components/nav'
import { CreateWizard } from '@/components/create/create-wizard'

export default async function CreatePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-amber-50">
      <Nav user={user} />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10">
        <CreateWizard />
      </main>
    </div>
  )
}
