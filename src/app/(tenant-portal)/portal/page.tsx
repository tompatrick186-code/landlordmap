import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateShort, daysUntil } from '@/lib/utils'
import { MapPin, Calendar, PoundSterling, Bed, Bath, AlertTriangle } from 'lucide-react'

export const metadata = { title: 'My Tenancy | Tenant Portal' }

export default async function PortalPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Find tenant by email
  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('email', user.email!)
    .eq('status', 'active')
    .single()

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <AlertTriangle className="h-10 w-10 text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tenancy found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your landlord needs to add your email address to your tenant record.
        </p>
      </div>
    )
  }

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', tenant.property_id)
    .single()

  const leaseEndDays = daysUntil(tenant.lease_end)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Hello, {tenant.first_name}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Here&apos;s your tenancy summary
        </p>
      </div>

      {/* Property */}
      {property && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              Your property
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <h2 className="font-semibold text-slate-900 dark:text-white text-lg mb-1">
              {property.title}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{property.address}</p>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Bed className="h-4 w-4" />
                {property.bedrooms} bedrooms
              </span>
              <span className="flex items-center gap-1.5">
                <Bath className="h-4 w-4" />
                {property.bathrooms} bathrooms
              </span>
              {property.epc_rating && (
                <span className="font-medium">EPC {property.epc_rating}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lease details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <PoundSterling className="h-4 w-4 text-emerald-500" />
              <span className="text-xs text-slate-500">Monthly rent</span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(tenant.rent_amount)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-slate-500">Lease start</span>
            </div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">
              {formatDateShort(tenant.lease_start)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-slate-500">Lease end</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {formatDateShort(tenant.lease_end)}
              </p>
              {leaseEndDays < 60 && leaseEndDays >= 0 && (
                <Badge variant="warning" className="text-xs">{leaseEndDays}d</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deposit */}
      {tenant.deposit_amount && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-slate-500 mb-1">Security deposit held</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(tenant.deposit_amount)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your deposit is protected in a government-approved scheme. Ask your landlord for scheme details.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
