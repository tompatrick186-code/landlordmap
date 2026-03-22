import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, formatCurrency, formatDateShort, getStatusColor, daysUntil } from '@/lib/utils'
import { ArrowLeft, Mail, Phone, Calendar, Building2, PoundSterling, Wrench, FileText } from 'lucide-react'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('tenants').select('first_name, last_name').eq('id', params.id).single()
  return { title: data ? `${data.first_name} ${data.last_name}` : 'Tenant' }
}

export default async function TenantDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!tenant) notFound()

  const [{ data: property }, { data: payments }, { data: maintenance }, { data: documents }] =
    await Promise.all([
      supabase.from('properties').select('*').eq('id', tenant.property_id).single(),
      supabase.from('rent_payments').select('*').eq('tenant_id', params.id).order('paid_at', { ascending: false }),
      supabase.from('maintenance_requests').select('*').eq('tenant_id', params.id).order('reported_at', { ascending: false }),
      supabase.from('documents').select('*').eq('tenant_id', params.id),
    ])

  const leaseEndDays = daysUntil(tenant.lease_end)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link
        href="/tenants"
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tenants
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xl font-bold">
              {tenant.first_name[0]}{tenant.last_name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {tenant.first_name} {tenant.last_name}
              </h1>
              <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1', getStatusColor(tenant.status))}>
                {tenant.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          {leaseEndDays < 60 && leaseEndDays >= 0 && (
            <Badge variant="warning">Lease expires in {leaseEndDays} days</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Email</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{tenant.email}</p>
            </div>
          </div>
          {tenant.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Phone</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{tenant.phone}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Property</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {property?.title || '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PoundSterling className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Monthly rent</p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {formatCurrency(tenant.rent_amount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="lease">
        <TabsList>
          <TabsTrigger value="lease">Lease</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="lease">
          <Card>
            <CardContent className="pt-6 grid grid-cols-2 gap-4">
              {[
                { label: 'Lease start', value: formatDateShort(tenant.lease_start) },
                { label: 'Lease end', value: formatDateShort(tenant.lease_end) },
                { label: 'Monthly rent', value: formatCurrency(tenant.rent_amount) },
                { label: 'Deposit', value: tenant.deposit_amount ? formatCurrency(tenant.deposit_amount) : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-slate-500 mb-0.5">{label}</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
              {tenant.notes && (
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">{tenant.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardContent className="pt-6">
              {(payments || []).length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No payments logged</p>
              ) : (
                <div className="space-y-2">
                  {(payments || []).map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(p.paid_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                        </p>
                        {p.notes && <p className="text-xs text-slate-400">{p.notes}</p>}
                      </div>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <div className="space-y-3">
            {(maintenance || []).length === 0 ? (
              <div className="text-center py-12 text-slate-400">No maintenance requests</div>
            ) : (
              (maintenance || []).map((m) => (
                <div key={m.id} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <span className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1.5 ${m.priority === 'urgent' ? 'bg-red-500' : m.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{m.title}</p>
                      <Badge variant={m.status === 'resolved' ? 'success' : m.status === 'in_progress' ? 'warning' : 'destructive'} className="text-xs">
                        {m.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{m.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents">
          {(documents || []).length === 0 ? (
            <div className="text-center py-12 text-slate-400">No documents</div>
          ) : (
            <div className="space-y-2">
              {(documents || []).map((d) => (
                <div key={d.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{d.type.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400">View</a>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
