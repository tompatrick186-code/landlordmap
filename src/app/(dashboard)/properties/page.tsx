import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PropertyGrid } from '@/components/properties/PropertyGrid'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid } from 'lucide-react'

export const metadata = { title: 'Properties' }

export default async function PropertiesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) redirect('/onboarding')

  const [{ data: properties }, { data: tenants }] = await Promise.all([
    supabase
      .from('properties')
      .select('*')
      .eq('organisation_id', orgMember.organisation_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tenants')
      .select('*')
      .eq('organisation_id', orgMember.organisation_id)
      .eq('status', 'active'),
  ])

  const props = properties || []
  const tens = tenants || []

  const statusCounts = {
    all: props.length,
    occupied: props.filter((p) => p.status === 'occupied').length,
    vacant: props.filter((p) => p.status === 'vacant').length,
    maintenance: props.filter((p) => p.status === 'maintenance').length,
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Properties</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {statusCounts.all} propert{statusCounts.all !== 1 ? 'ies' : 'y'} ·{' '}
            {statusCounts.occupied} occupied · {statusCounts.vacant} vacant
          </p>
        </div>
        <Link href="/properties/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add property
          </Button>
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {[
          { label: `All (${statusCounts.all})`, value: '' },
          { label: `Occupied (${statusCounts.occupied})`, value: 'occupied' },
          { label: `Vacant (${statusCounts.vacant})`, value: 'vacant' },
          { label: `Maintenance (${statusCounts.maintenance})`, value: 'maintenance' },
        ].map((filter) => (
          <Link
            key={filter.value}
            href={filter.value ? `/properties?status=${filter.value}` : '/properties'}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors"
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <PropertyGrid properties={props} tenants={tens} />
    </div>
  )
}
