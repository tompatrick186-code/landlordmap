import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KanbanBoard } from '@/components/maintenance/KanbanBoard'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata = { title: 'Maintenance' }

export default async function MaintenancePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) redirect('/onboarding')

  const [{ data: maintenance }, { data: properties }, { data: tenants }] = await Promise.all([
    supabase
      .from('maintenance_requests')
      .select('*')
      .eq('organisation_id', orgMember.organisation_id)
      .order('reported_at', { ascending: false }),
    supabase
      .from('properties')
      .select('id, title, address')
      .eq('organisation_id', orgMember.organisation_id),
    supabase
      .from('tenants')
      .select('id, first_name, last_name, property_id')
      .eq('organisation_id', orgMember.organisation_id),
  ])

  const maint = maintenance || []
  const urgentCount = maint.filter((m) => m.priority === 'urgent' && m.status !== 'resolved').length

  return (
    <div className="p-6 flex flex-col h-full gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {maint.filter((m) => m.status !== 'resolved').length} open issues
            {urgentCount > 0 && (
              <span className="ml-1 text-red-500 font-medium">· {urgentCount} urgent</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard
          initialRequests={maint}
          properties={properties || []}
          tenants={tenants || []}
        />
      </div>
    </div>
  )
}
