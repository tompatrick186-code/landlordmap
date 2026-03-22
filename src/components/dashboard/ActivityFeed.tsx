import React from 'react'
import { Building2, Users, Wrench, FileText, PoundSterling } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

interface ActivityItem {
  id: string
  type: 'property' | 'tenant' | 'maintenance' | 'document' | 'payment'
  title: string
  description: string
  created_at: string
}

interface ActivityFeedProps {
  items: ActivityItem[]
}

const TYPE_CONFIG = {
  property: {
    icon: Building2,
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    color: 'text-blue-600 dark:text-blue-400',
  },
  tenant: {
    icon: Users,
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    color: 'text-violet-600 dark:text-violet-400',
  },
  maintenance: {
    icon: Wrench,
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    color: 'text-amber-600 dark:text-amber-400',
  },
  document: {
    icon: FileText,
    bg: 'bg-slate-100 dark:bg-slate-800',
    color: 'text-slate-600 dark:text-slate-400',
  },
  payment: {
    icon: PoundSterling,
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    color: 'text-emerald-600 dark:text-emerald-400',
  },
}

const PLACEHOLDER_ITEMS: ActivityItem[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Rent received',
    description: '14 Elm Street — £1,200 for March',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'maintenance',
    title: 'New maintenance request',
    description: '7 Oak Avenue — Boiler pressure issue (urgent)',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'tenant',
    title: 'Tenant added',
    description: 'Sarah Mitchell added to 3 High Street',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'document',
    title: 'Document uploaded',
    description: 'Gas safety certificate — 22 Mill Road',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'maintenance',
    title: 'Maintenance resolved',
    description: '9 Park Lane — Leaky tap fixed',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDateShort(dateStr)
}

export function ActivityFeed({ items }: ActivityFeedProps) {
  const displayItems = items.length > 0 ? items : PLACEHOLDER_ITEMS

  return (
    <div className="space-y-1">
      {displayItems.slice(0, 10).map((item) => {
        const config = TYPE_CONFIG[item.type]
        const Icon = config.icon

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
          >
            <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${config.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white">{item.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.description}</p>
            </div>
            <span className="text-xs text-slate-400 shrink-0">{timeAgo(item.created_at)}</span>
          </div>
        )
      })}

      {displayItems.length === 0 && (
        <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm">
          No recent activity yet.
        </div>
      )}
    </div>
  )
}
