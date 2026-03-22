'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Building2, Users, CreditCard, Bell, Crown, Check } from 'lucide-react'

export default function SettingsPage() {
  const [org, setOrg] = useState({ name: '', plan: 'starter' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  useEffect(() => {
    const fetchOrg = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: orgMember } = await supabase
        .from('organisation_members')
        .select('organisations(name, plan)')
        .eq('user_id', user.id)
        .single()

      if (orgMember?.organisations) {
        const o = orgMember.organisations as Record<string, unknown>
        setOrg({ name: o.name as string, plan: o.plan as string })
      }
    }
    fetchOrg()
  }, [])

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: orgMember } = await supabase
      .from('organisation_members')
      .select('organisation_id')
      .eq('user_id', user.id)
      .single()

    if (orgMember) {
      await supabase
        .from('organisations')
        .update({ name: org.name })
        .eq('id', orgMember.organisation_id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const NOTIFICATION_OPTIONS = [
    { id: 'rent_reminders', label: 'Rent reminders', description: 'Email alerts when rent is due' },
    { id: 'lease_expiry', label: 'Lease expiry alerts', description: '60-day and 30-day warnings before lease ends' },
    { id: 'maintenance_updates', label: 'Maintenance updates', description: 'Notify when maintenance status changes' },
    { id: 'document_expiry', label: 'Document expiry', description: '30-day warning before documents expire' },
  ]

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    rent_reminders: true,
    lease_expiry: true,
    maintenance_updates: true,
    document_expiry: true,
  })

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your organisation and account preferences
        </p>
      </div>

      <Tabs defaultValue="organisation">
        <TabsList>
          <TabsTrigger value="organisation" className="gap-2">
            <Building2 className="h-3.5 w-3.5" />
            Organisation
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-3.5 w-3.5" />
            Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-3.5 w-3.5" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-3.5 w-3.5" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organisation">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Organisation details</CardTitle>
              <CardDescription>Update your organisation name and branding</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label>Organisation name</Label>
                  <Input
                    value={org.name}
                    onChange={(e) => setOrg({ ...org, name: e.target.value })}
                    placeholder="My Properties Ltd"
                  />
                </div>
                <Button type="submit" loading={saving} className="gap-2">
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved
                    </>
                  ) : (
                    'Save changes'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team members</CardTitle>
              <CardDescription>
                {org.plan === 'agency'
                  ? 'Invite team members to collaborate on your portfolio'
                  : 'Upgrade to Agency to add team members'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {org.plan !== 'agency' ? (
                <div className="text-center py-6">
                  <Crown className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Team access is available on the Agency plan
                  </p>
                  <Button asChild>
                    <a href="/pricing">Upgrade to Agency</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="colleague@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="flex-1"
                    />
                    <Button>Send invite</Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    They&apos;ll receive an email invitation to join your organisation.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subscription</CardTitle>
              <CardDescription>Manage your plan and billing details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white capitalize">
                    {org.plan} plan
                  </p>
                  <p className="text-sm text-slate-500">
                    {org.plan === 'starter' ? 'Free forever' : org.plan === 'pro' ? '£19/month' : '£49/month'}
                  </p>
                </div>
                <Badge
                  variant={org.plan === 'pro' ? 'success' : org.plan === 'agency' ? 'warning' : 'secondary'}
                >
                  {org.plan}
                </Badge>
              </div>

              {org.plan !== 'starter' && (
                <Button variant="outline" className="w-full">
                  Manage billing in Stripe
                </Button>
              )}

              {org.plan === 'starter' && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Upgrade to unlock the AI assistant, interactive map, and more.
                  </p>
                  <Button asChild className="w-full">
                    <a href="/pricing">View upgrade options</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email notifications</CardTitle>
              <CardDescription>Choose which alerts you want to receive by email</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {NOTIFICATION_OPTIONS.map((option) => (
                  <div key={option.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((prev) => ({ ...prev, [option.id]: !prev[option.id] }))
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        notifications[option.id]
                          ? 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                          notifications[option.id] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}

                <div className="pt-2">
                  <Button size="sm">Save preferences</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
