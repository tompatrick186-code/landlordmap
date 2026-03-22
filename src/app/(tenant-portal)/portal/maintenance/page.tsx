'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn, getStatusColor, formatDateShort } from '@/lib/utils'
import { Wrench, Plus, X } from 'lucide-react'
import type { MaintenanceRequest } from '@/types'

export default function PortalMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
  })

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, property_id, organisation_id')
        .eq('email', user.email!)
        .eq('status', 'active')
        .single()

      if (tenant) {
        setTenantId(tenant.id)
        setPropertyId(tenant.property_id)
        setOrgId(tenant.organisation_id)

        const { data: maint } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('tenant_id', tenant.id)
          .order('reported_at', { ascending: false })

        setRequests(maint || [])
      }
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.from('maintenance_requests').insert({
      organisation_id: orgId,
      property_id: propertyId,
      tenant_id: tenantId,
      title: form.title,
      description: form.description,
      priority: form.priority,
      status: 'reported',
      reported_at: new Date().toISOString(),
    })

    setForm({ title: '', description: '', priority: 'medium' })
    setShowForm(false)
    setLoading(false)

    // Refresh
    const supabaseNew = createClient()
    const { data: maint } = await supabaseNew
      .from('maintenance_requests')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('reported_at', { ascending: false })
    setRequests(maint || [])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Report issues and track their progress
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'Report issue'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Report a maintenance issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Issue title</Label>
                <Input
                  placeholder="e.g. Boiler not heating water"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Please describe the issue in detail, including when it started..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as typeof form.priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low — not urgent</SelectItem>
                    <SelectItem value="medium">Medium — needs attention soon</SelectItem>
                    <SelectItem value="urgent">Urgent — affecting habitability</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" loading={loading} className="w-full">
                Submit report
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No maintenance requests</h3>
          <p className="text-sm text-slate-500">
            Use the button above to report an issue with your property.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{req.title}</h3>
                  <Badge
                    variant={req.status === 'resolved' ? 'success' : req.status === 'in_progress' ? 'warning' : 'destructive'}
                  >
                    {req.status.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{req.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Reported {formatDateShort(req.reported_at)}</span>
                  <span className={cn('font-medium px-2 py-0.5 rounded-full', getStatusColor(req.priority))}>
                    {req.priority}
                  </span>
                </div>
                {req.notes && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-500 mb-0.5">Landlord note</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{req.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
