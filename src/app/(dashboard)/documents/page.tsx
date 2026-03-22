'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatDateShort, daysUntil } from '@/lib/utils'
import { FileText, Upload, AlertTriangle, Plus, ExternalLink } from 'lucide-react'
import type { Document, Property, Tenant } from '@/types'

const DOCUMENT_TYPES = [
  { value: 'tenancy_agreement', label: 'Tenancy agreement' },
  { value: 'gas_safety', label: 'Gas safety certificate' },
  { value: 'epc', label: 'EPC certificate' },
  { value: 'inventory', label: 'Inventory' },
  { value: 'other', label: 'Other' },
]

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'other',
    property_id: '',
    tenant_id: '',
    expiry_date: '',
  })
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const supabase = createClient()
    const [{ data: docs }, { data: props }, { data: tens }] = await Promise.all([
      supabase.from('documents').select('*').order('created_at', { ascending: false }),
      supabase.from('properties').select('id, title'),
      supabase.from('tenants').select('id, first_name, last_name').eq('status', 'active'),
    ])
    setDocuments(docs || [])
    setProperties(props || [])
    setTenants(tens || [])
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setUploading(true)
    const supabase = createClient()

    const { data: orgMember } = await supabase
      .from('organisation_members')
      .select('organisation_id')
      .single()

    if (!orgMember) return

    // Upload file to Supabase storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${orgMember.organisation_id}/${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file)

    if (uploadError) {
      console.error(uploadError)
      setUploading(false)
      return
    }

    const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)

    await supabase.from('documents').insert({
      organisation_id: orgMember.organisation_id,
      name: form.name || file.name,
      type: form.type,
      property_id: form.property_id || null,
      tenant_id: form.tenant_id || null,
      expiry_date: form.expiry_date || null,
      file_url: urlData.publicUrl,
    })

    setForm({ name: '', type: 'other', property_id: '', tenant_id: '', expiry_date: '' })
    setFile(null)
    setShowForm(false)
    setUploading(false)
    fetchData()
  }

  const expiringDocs = documents.filter((d) => {
    if (!d.expiry_date) return false
    const days = daysUntil(d.expiry_date)
    return days >= 0 && days <= 30
  })

  // Group by property
  const grouped: Record<string, Document[]> = {}
  documents.forEach((doc) => {
    const key = doc.property_id || 'general'
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(doc)
  })

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Documents</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {documents.length} documents stored
            {expiringDocs.length > 0 && (
              <span className="ml-1 text-red-500 font-medium">· {expiringDocs.length} expiring soon</span>
            )}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Upload document
        </Button>
      </div>

      {/* Expiry alerts */}
      {expiringDocs.length > 0 && (
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-400 text-sm">Documents expiring within 30 days</span>
          </div>
          <div className="space-y-1.5">
            {expiringDocs.map((d) => (
              <div key={d.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700 dark:text-red-300">{d.name}</span>
                <span className="text-red-500 font-medium">{daysUntil(d.expiry_date!)}d remaining</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4 text-emerald-500" />
              Upload new document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document name</Label>
                  <Input
                    placeholder="e.g. Gas safety cert 2024"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Property (optional)</Label>
                  <Select value={form.property_id} onValueChange={(v) => setForm({ ...form, property_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No property</SelectItem>
                      {properties.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expiry date (optional)</Label>
                  <Input
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label>File</Label>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    required
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <p className="text-xs text-slate-400">PDF, Word, or image files accepted</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" loading={uploading} disabled={!file}>Upload</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Document list grouped by property */}
      {documents.length === 0 ? (
        <div className="text-center py-20">
          <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 mx-auto">
            <FileText className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No documents yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">Upload tenancy agreements, gas safety certs, EPCs, and more.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([propertyId, docs]) => {
          const property = properties.find((p) => p.id === propertyId)
          return (
            <Card key={propertyId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {property?.title || 'General documents'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {docs.map((doc) => {
                    const expiringSoon = doc.expiry_date && daysUntil(doc.expiry_date) < 30
                    const expired = doc.expiry_date && daysUntil(doc.expiry_date) < 0
                    return (
                      <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.name}</p>
                            <p className="text-xs text-slate-500 capitalize">{doc.type.replace('_', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {doc.expiry_date && (
                            <span className={`text-xs font-medium ${expired ? 'text-red-600' : expiringSoon ? 'text-amber-600' : 'text-slate-400'}`}>
                              {expired ? 'Expired' : `Expires ${formatDateShort(doc.expiry_date)}`}
                            </span>
                          )}
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}
