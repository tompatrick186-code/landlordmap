import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDateShort, getStatusColor, daysUntil } from '@/lib/utils'
import { Users, ChevronRight } from 'lucide-react'

export const metadata = { title: 'Tenants' }

export default async function TenantsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) redirect('/onboarding')

  const [{ data: tenants }, { data: properties }] = await Promise.all([
    supabase
      .from('tenants')
      .select('*')
      .eq('organisation_id', orgMember.organisation_id)
      .order('created_at', { ascending: false }),
    supabase
      .from('properties')
      .select('id, title')
      .eq('organisation_id', orgMember.organisation_id),
  ])

  const tens = tenants || []
  const props = properties || []

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Tenants</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {tens.filter((t) => t.status === 'active').length} active ·{' '}
            {tens.filter((t) => t.status === 'notice_given').length} notice given
          </p>
        </div>
      </div>

      {tens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No tenants yet
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add a tenant to a property to see them here.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead>Lease end</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tens.map((tenant) => {
                const property = props.find((p) => p.id === tenant.property_id)
                const leaseEndDays = daysUntil(tenant.lease_end)
                const isExpiringSoon = leaseEndDays >= 0 && leaseEndDays <= 60

                return (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {tenant.first_name} {tenant.last_name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {property?.title || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(tenant.rent_amount)}/mo
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {formatDateShort(tenant.lease_end)}
                        </span>
                        {isExpiringSoon && (
                          <Badge variant="warning" className="text-[10px]">
                            {leaseEndDays}d
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getStatusColor(tenant.status)
                        )}
                      >
                        {tenant.status.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/tenants/${tenant.id}`}>
                        <ChevronRight className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
