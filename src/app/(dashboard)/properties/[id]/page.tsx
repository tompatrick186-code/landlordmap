import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatCurrency,
  formatDateShort,
  getStatusColor,
  daysUntil,
} from '@/lib/utils'
import {
  MapPin,
  Bed,
  Bath,
  Edit,
  User,
  Wrench,
  FileText,
  PoundSterling,
  Calendar,
  ArrowLeft,
} from 'lucide-react'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: property } = await supabase.from('properties').select('title').eq('id', params.id).single()
  return { title: property?.title || 'Property' }
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) notFound()

  const [{ data: tenants }, { data: maintenance }, { data: documents }, { data: payments }] =
    await Promise.all([
      supabase.from('tenants').select('*').eq('property_id', params.id),
      supabase.from('maintenance_requests').select('*').eq('property_id', params.id).order('reported_at', { ascending: false }),
      supabase.from('documents').select('*').eq('property_id', params.id),
      supabase.from('rent_payments').select('*').eq('property_id', params.id).order('paid_at', { ascending: false }).limit(12),
    ])

  const activeTenant = (tenants || []).find((t) => t.status === 'active')
  const openMaintenance = (maintenance || []).filter((m) => m.status !== 'resolved')
  const totalPaid = (payments || []).reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href="/properties" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to properties
        </Link>
        <Link href={`/properties/${params.id}/edit`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
        </Link>
      </div>

      {/* Hero */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 h-40 flex items-end p-6">
          <div className="flex items-end justify-between w-full">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{property.title}</h1>
              <div className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="h-3.5 w-3.5" />
                {property.address}
              </div>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
              {property.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Key details */}
        <div className="bg-white dark:bg-slate-900 px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-100 dark:divide-slate-800">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(property.rent)}</p>
            <p className="text-xs text-slate-500">per month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Bed className="h-5 w-5 text-slate-400" /> {property.bedrooms}
            </p>
            <p className="text-xs text-slate-500">bedrooms</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
              <Bath className="h-5 w-5 text-slate-400" /> {property.bathrooms}
            </p>
            <p className="text-xs text-slate-500">bathrooms</p>
          </div>
          <div className="text-center">
            {property.epc_rating ? (
              <>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{property.epc_rating}</p>
                <p className="text-xs text-slate-500">EPC rating</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-slate-400">—</p>
                <p className="text-xs text-slate-500">No EPC</p>
              </>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">
            Maintenance
            {openMaintenance.length > 0 && (
              <span className="ml-1.5 h-4 w-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                {openMaintenance.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current tenant */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald-500" />
                  Current tenant
                </CardTitle>
                {activeTenant && (
                  <Link href={`/tenants/${activeTenant.id}`}>
                    <Button variant="ghost" size="sm">View profile</Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {activeTenant ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Name</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {activeTenant.first_name} {activeTenant.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Email</p>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{activeTenant.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Lease start</p>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {formatDateShort(activeTenant.lease_start)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">Lease end</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">
                        {formatDateShort(activeTenant.lease_end)}
                      </p>
                      {daysUntil(activeTenant.lease_end) < 60 && (
                        <Badge variant="warning" className="text-xs">
                          {daysUntil(activeTenant.lease_end)}d
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">No active tenant</p>
              )}
            </CardContent>
          </Card>

          {/* Property details */}
          {property.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-500">{(maintenance || []).length} total requests</p>
            <Link href="/maintenance">
              <Button size="sm" variant="outline">Log new issue</Button>
            </Link>
          </div>
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
                  <p className="text-xs text-slate-400 mt-1">{formatDateShort(m.reported_at)}</p>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="finances">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Rent history</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                <p className="text-xs text-slate-500">Total received (last 12 months)</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
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

        <TabsContent value="documents">
          {(documents || []).length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded</p>
              <Link href="/documents" className="text-emerald-500 hover:text-emerald-600 text-sm mt-2 inline-block">
                Upload documents →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {(documents || []).map((d) => {
                const expiring = d.expiry_date && daysUntil(d.expiry_date) < 30
                return (
                  <div key={d.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{d.type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {d.expiry_date && (
                        <span className={`text-xs ${expiring ? 'text-red-500' : 'text-slate-400'}`}>
                          Expires {formatDateShort(d.expiry_date)}
                        </span>
                      )}
                      <a
                        href={d.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
