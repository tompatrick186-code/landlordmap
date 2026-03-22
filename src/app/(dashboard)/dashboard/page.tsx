import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Wrench, MessageSquare, AlertTriangle, Calendar } from 'lucide-react'
import { formatDateShort, daysUntil } from '@/lib/utils'

export const metadata = { title: 'Dashboard' }

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) redirect('/onboarding')

  const orgId = orgMember.organisation_id

  const [
    { data: properties },
    { data: tenants },
    { data: maintenance },
    { data: documents },
  ] = await Promise.all([
    supabase.from('properties').select('*').eq('organisation_id', orgId),
    supabase.from('tenants').select('*').eq('organisation_id', orgId).eq('status', 'active'),
    supabase.from('maintenance_requests').select('*').eq('organisation_id', orgId).neq('status', 'resolved'),
    supabase.from('documents').select('*').eq('organisation_id', orgId),
  ])

  const props = properties || []
  const tens = tenants || []
  const maint = maintenance || []
  const docs = documents || []

  const totalProperties = props.length
  const occupiedCount = props.filter((p) => p.status === 'occupied').length
  const vacantCount = props.filter((p) => p.status === 'vacant').length
  const occupancyPercent = totalProperties > 0 ? Math.round((occupiedCount / totalProperties) * 100) : 0
  const monthlyRent = tens.reduce((sum, t) => sum + (t.rent_amount || 0), 0)

  // Expiring leases
  const expiringLeases = tens.filter((t) => {
    const days = daysUntil(t.lease_end)
    return days >= 0 && days <= 60
  })

  // Expiring documents
  const expiringDocs = docs.filter((d) => {
    if (!d.expiry_date) return false
    const days = daysUntil(d.expiry_date)
    return days >= 0 && days <= 30
  })

  return (
    <div className="p-6 space-y-6">
      {/* Alerts */}
      {(expiringLeases.length > 0 || expiringDocs.length > 0) && (
        <div className="space-y-3">
          {expiringDocs.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-400">
                <span className="font-semibold">{expiringDocs.length} document{expiringDocs.length !== 1 ? 's' : ''}</span>{' '}
                expiring within 30 days.{' '}
                <Link href="/documents" className="underline hover:no-underline">
                  Review documents →
                </Link>
              </p>
            </div>
          )}
          {expiringLeases.length > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3">
              <Calendar className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                <span className="font-semibold">{expiringLeases.length} lease{expiringLeases.length !== 1 ? 's' : ''}</span>{' '}
                expiring in the next 60 days.{' '}
                <Link href="/tenants" className="underline hover:no-underline">
                  View tenants →
                </Link>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      <StatsBar
        totalProperties={totalProperties}
        occupancyPercent={occupancyPercent}
        vacantCount={vacantCount}
        openMaintenance={maint.length}
        monthlyRent={monthlyRent}
      />

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/properties/new">
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add property
          </Button>
        </Link>
        <Link href="/maintenance">
          <Button size="sm" variant="secondary" className="gap-2">
            <Wrench className="h-4 w-4" />
            Log maintenance
          </Button>
        </Link>
        <Link href="/tenants">
          <Button size="sm" variant="secondary" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Message tenant
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityFeed items={[]} />
            </CardContent>
          </Card>
        </div>

        {/* Open maintenance */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Open maintenance</CardTitle>
                <Link href="/maintenance">
                  <Badge variant="secondary" className="text-xs cursor-pointer hover:opacity-80">
                    View all
                  </Badge>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {maint.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No open issues</p>
              ) : (
                <div className="space-y-2">
                  {maint.slice(0, 5).map((m) => {
                    const prop = props.find((p) => p.id === m.property_id)
                    return (
                      <div
                        key={m.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span
                          className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                            m.priority === 'urgent'
                              ? 'bg-red-500'
                              : m.priority === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {m.title}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{prop?.title || 'Unknown property'}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring leases */}
          {expiringLeases.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Leases expiring soon</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {expiringLeases.slice(0, 4).map((t) => {
                    const days = daysUntil(t.lease_end)
                    return (
                      <div key={t.id} className="flex items-center justify-between py-1.5">
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {t.first_name} {t.last_name}
                          </p>
                          <p className="text-xs text-slate-500">{formatDateShort(t.lease_end)}</p>
                        </div>
                        <Badge variant={days <= 30 ? 'destructive' : 'warning'} className="text-xs">
                          {days}d
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
