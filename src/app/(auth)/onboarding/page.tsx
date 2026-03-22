'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Building2, Users, ArrowRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const STEPS = [
  { id: 1, label: 'Organisation', icon: MapPin },
  { id: 2, label: 'First property', icon: Building2 },
  { id: 3, label: 'Tenant', icon: Users },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [orgId, setOrgId] = useState<string | null>(null)
  const [propertyId, setPropertyId] = useState<string | null>(null)

  // Step 1: Org
  const [orgName, setOrgName] = useState('')

  // Step 2: Property
  const [property, setProperty] = useState({
    title: '',
    address: '',
    bedrooms: '2',
    rent: '',
  })

  // Step 3: Tenant (optional)
  const [tenant, setTenant] = useState({
    firstName: '',
    lastName: '',
    email: '',
    leaseEnd: '',
  })

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create organisation
      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .insert({ name: orgName, plan: 'starter' })
        .select()
        .single()

      if (orgError) throw orgError

      // Create org member
      await supabase.from('organisation_members').insert({
        organisation_id: org.id,
        user_id: user.id,
        role: 'owner',
      })

      setOrgId(org.id)
      setStep(2)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      const { data: prop, error: propError } = await supabase
        .from('properties')
        .insert({
          organisation_id: orgId,
          title: property.title,
          address: property.address,
          area: '',
          bedrooms: parseInt(property.bedrooms),
          bathrooms: 1,
          rent: parseFloat(property.rent),
          status: 'vacant',
        })
        .select()
        .single()

      if (propError) throw propError

      setPropertyId(prop.id)
      setStep(3)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()

      if (tenant.firstName && tenant.email) {
        await supabase.from('tenants').insert({
          organisation_id: orgId,
          property_id: propertyId,
          first_name: tenant.firstName,
          last_name: tenant.lastName,
          email: tenant.email,
          lease_start: new Date().toISOString().split('T')[0],
          lease_end: tenant.leaseEnd || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          rent_amount: 0,
          status: 'active',
        })

        // Update property to occupied
        await supabase
          .from('properties')
          .update({ status: 'occupied' })
          .eq('id', propertyId)
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 mb-4">
            <MapPin className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Set up LandlordMap</h1>
          <p className="text-slate-400 text-sm">Just a few quick steps to get started</p>
        </div>

        {/* Progress */}
        <div className="flex items-center mb-8 px-2">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                    step > s.id
                      ? 'bg-emerald-500 text-white'
                      : step === s.id
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30'
                      : 'bg-slate-800 text-slate-500'
                  )}
                >
                  {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                </div>
                <span
                  className={cn(
                    'text-xs mt-1',
                    step >= s.id ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 mb-4 transition-colors',
                    step > s.id ? 'bg-emerald-500' : 'bg-slate-800'
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-900/20 border border-red-800 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Step 1: Organisation */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Name your organisation</h2>
                <p className="text-sm text-slate-400 mb-4">
                  This is how your organisation appears in LandlordMap. You can change it later.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-slate-300">
                  Organisation name
                </Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Smith Properties, My Rentals"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <Button type="submit" loading={loading} className="w-full gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Step 2: Property */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Add your first property</h2>
                <p className="text-sm text-slate-400 mb-4">
                  You can add more properties and edit all details after setup.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Property title</Label>
                <Input
                  placeholder="e.g. 14 Elm Street, Flat 2"
                  value={property.title}
                  onChange={(e) => setProperty({ ...property, title: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Address</Label>
                <Input
                  placeholder="Full address including postcode"
                  value={property.address}
                  onChange={(e) => setProperty({ ...property, address: e.target.value })}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Bedrooms</Label>
                  <Select
                    value={property.bedrooms}
                    onValueChange={(v) => setProperty({ ...property, bedrooms: v })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} bed{n !== 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Monthly rent (£)</Label>
                  <Input
                    type="number"
                    placeholder="1200"
                    value={property.rent}
                    onChange={(e) => setProperty({ ...property, rent: e.target.value })}
                    required
                    min={0}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          )}

          {/* Step 3: Tenant (optional) */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">Invite a tenant</h2>
                <p className="text-sm text-slate-400 mb-4">
                  Optional — you can always add tenants later.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">First name</Label>
                  <Input
                    placeholder="Sarah"
                    value={tenant.firstName}
                    onChange={(e) => setTenant({ ...tenant, firstName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Last name</Label>
                  <Input
                    placeholder="Mitchell"
                    value={tenant.lastName}
                    onChange={(e) => setTenant({ ...tenant, lastName: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Email address</Label>
                <Input
                  type="email"
                  placeholder="tenant@example.com"
                  value={tenant.email}
                  onChange={(e) => setTenant({ ...tenant, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Lease end date</Label>
                <Input
                  type="date"
                  value={tenant.leaseEnd}
                  onChange={(e) => setTenant({ ...tenant, leaseEnd: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => router.push('/dashboard')}
                >
                  Skip for now
                </Button>
                <Button type="submit" loading={loading} className="flex-1 gap-2">
                  Go to dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
