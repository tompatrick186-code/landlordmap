import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'
import { ChatWidget } from '@/components/dashboard/ChatWidget'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch organisation data
  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id, role, organisations(name, plan)')
    .eq('user_id', user.id)
    .single()

  const orgName = (orgMember?.organisations as Record<string, unknown> | null)?.name as string || 'My Organisation'
  const plan = ((orgMember?.organisations as Record<string, unknown> | null)?.plan as string || 'starter') as 'starter' | 'pro' | 'agency'

  const emailParts = user.email?.split('@')[0] || 'U'
  const initials = emailParts.slice(0, 2).toUpperCase()
  const displayName = user.user_metadata?.full_name || user.email || ''

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Sidebar plan={plan} orgName={orgName} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          orgName={orgName}
          userEmail={user.email || ''}
          userInitials={initials}
          notificationCount={0}
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <ChatWidget plan={plan} />
    </div>
  )
}
