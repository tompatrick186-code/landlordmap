'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Map,
  Building2,
  Users,
  Wrench,
  PoundSterling,
  FileText,
  Settings,
  LogOut,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/map', icon: Map, label: 'Map' },
  { href: '/properties', icon: Building2, label: 'Properties' },
  { href: '/tenants', icon: Users, label: 'Tenants' },
  { href: '/maintenance', icon: Wrench, label: 'Maintenance' },
  { href: '/finances', icon: PoundSterling, label: 'Finances' },
  { href: '/documents', icon: FileText, label: 'Documents' },
]

interface SidebarProps {
  plan?: 'starter' | 'pro' | 'agency'
  orgName?: string
}

export function Sidebar({ plan = 'starter', orgName = 'My Organisation' }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const planBadge = {
    starter: { label: 'Starter', class: 'bg-slate-700 text-slate-300' },
    pro: { label: 'Pro', class: 'bg-emerald-900/50 text-emerald-400' },
    agency: { label: 'Agency', class: 'bg-amber-900/50 text-amber-400' },
  }[plan]

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800 shrink-0">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500 shrink-0">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-base">LandlordMap</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="mx-auto">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500">
              <MapPin className="h-3.5 w-3.5 text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors',
            collapsed && 'hidden'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group',
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-emerald-400' : '')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          )
        })}

        <div className="pt-2 border-t border-slate-800 mt-2">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === '/settings'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/70',
              collapsed && 'justify-center px-2'
            )}
            title={collapsed ? 'Settings' : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </nav>

      {/* Bottom: plan + signout */}
      <div className="px-2 py-4 border-t border-slate-800 space-y-2 shrink-0">
        {!collapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500 truncate">{orgName}</span>
              <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', planBadge.class)}>
                {planBadge.label}
              </span>
            </div>
            {plan === 'starter' && (
              <Link
                href="/pricing"
                className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Zap className="h-3 w-3" />
                Upgrade to Pro
              </Link>
            )}
          </div>
        )}
        <button
          onClick={handleSignOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/70 transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Sign out' : undefined}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  )
}
