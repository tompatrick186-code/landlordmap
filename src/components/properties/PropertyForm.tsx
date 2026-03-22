'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

interface PropertyFormProps {
  initialData?: Partial<Property>
  onSuccess?: (id: string) => void
}

export function PropertyForm({ initialData, onSuccess }: PropertyFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    title: initialData?.title || '',
    address: initialData?.address || '',
    area: initialData?.area || '',
    bedrooms: String(initialData?.bedrooms || '2'),
    bathrooms: String(initialData?.bathrooms || '1'),
    rent: String(initialData?.rent || ''),
    status: initialData?.status || 'vacant',
    description: initialData?.description || '',
    epc_rating: initialData?.epc_rating || '',
    council_tax_band: initialData?.council_tax_band || '',
    lat: String(initialData?.lat || ''),
    lng: String(initialData?.lng || ''),
  })

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get the user's organisation
      const { data: orgMember } = await supabase
        .from('organisation_members')
        .select('organisation_id')
        .eq('user_id', user.id)
        .single()

      if (!orgMember) throw new Error('No organisation found')

      const payload = {
        organisation_id: orgMember.organisation_id,
        title: form.title,
        address: form.address,
        area: form.area,
        bedrooms: parseInt(form.bedrooms),
        bathrooms: parseFloat(form.bathrooms),
        rent: parseFloat(form.rent),
        status: form.status as Property['status'],
        description: form.description || null,
        epc_rating: form.epc_rating || null,
        council_tax_band: form.council_tax_band || null,
        lat: form.lat ? parseFloat(form.lat) : null,
        lng: form.lng ? parseFloat(form.lng) : null,
      }

      if (initialData?.id) {
        const { error: updateError } = await supabase
          .from('properties')
          .update(payload)
          .eq('id', initialData.id)
        if (updateError) throw updateError
        if (onSuccess) onSuccess(initialData.id)
        else router.push(`/properties/${initialData.id}`)
      } else {
        const { data, error: insertError } = await supabase
          .from('properties')
          .insert(payload)
          .select()
          .single()
        if (insertError) throw insertError
        if (onSuccess) onSuccess(data.id)
        else router.push(`/properties/${data.id}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="title">Property title</Label>
          <Input
            id="title"
            placeholder="e.g. 14 Elm Street, Flat 2"
            value={form.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="address">Full address</Label>
          <Input
            id="address"
            placeholder="Street address including postcode"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="area">Area / neighbourhood</Label>
          <Input
            id="area"
            placeholder="e.g. Hackney, Manchester"
            value={form.area}
            onChange={(e) => handleChange('area', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Current status</Label>
          <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vacant">Vacant</SelectItem>
              <SelectItem value="occupied">Occupied</SelectItem>
              <SelectItem value="maintenance">Under maintenance</SelectItem>
              <SelectItem value="expiring_soon">Lease expiring soon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select value={form.bedrooms} onValueChange={(v) => handleChange('bedrooms', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} bedroom{n !== 1 ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select value={form.bathrooms} onValueChange={(v) => handleChange('bathrooms', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['1', '1.5', '2', '2.5', '3'].map((n) => (
                <SelectItem key={n} value={n}>
                  {n} bathroom{n !== '1' ? 's' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rent">Monthly rent (£)</Label>
          <Input
            id="rent"
            type="number"
            placeholder="1200"
            value={form.rent}
            onChange={(e) => handleChange('rent', e.target.value)}
            required
            min={0}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="epc_rating">EPC rating</Label>
          <Select value={form.epc_rating} onValueChange={(v) => handleChange('epc_rating', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="council_tax_band">Council tax band</Label>
          <Select
            value={form.council_tax_band}
            onValueChange={(v) => handleChange('council_tax_band', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select band" />
            </SelectTrigger>
            <SelectContent>
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((b) => (
                <SelectItem key={b} value={b}>
                  Band {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lat">Latitude (optional)</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            placeholder="51.5074"
            value={form.lat}
            onChange={(e) => handleChange('lat', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lng">Longitude (optional)</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            placeholder="-0.1278"
            value={form.lng}
            onChange={(e) => handleChange('lng', e.target.value)}
          />
        </div>

        <div className="md:col-span-2 space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Additional notes about the property..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData?.id ? 'Save changes' : 'Add property'}
        </Button>
      </div>
    </form>
  )
}
