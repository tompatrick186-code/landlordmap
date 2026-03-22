'use client'

import React, { useState } from 'react'
import { MaintenanceCard } from './MaintenanceCard'
import { createClient } from '@/lib/supabase/client'
import type { MaintenanceRequest, Property, Tenant } from '@/types'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

interface KanbanBoardProps {
  initialRequests: MaintenanceRequest[]
  properties: Property[]
  tenants: Tenant[]
}

const COLUMNS = [
  {
    id: 'reported' as const,
    label: 'Reported',
    icon: AlertCircle,
    iconColor: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/10',
    border: 'border-red-100 dark:border-red-900/30',
    count_bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  },
  {
    id: 'in_progress' as const,
    label: 'In Progress',
    icon: Clock,
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-100 dark:border-amber-900/30',
    count_bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  {
    id: 'resolved' as const,
    label: 'Resolved',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    border: 'border-emerald-100 dark:border-emerald-900/30',
    count_bg: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  },
]

export function KanbanBoard({ initialRequests, properties, tenants }: KanbanBoardProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests)

  const handleStatusChange = async (id: string, status: MaintenanceRequest['status']) => {
    // Optimistic update
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status, resolved_at: status === 'resolved' ? new Date().toISOString() : r.resolved_at }
          : r
      )
    )

    const supabase = createClient()
    const { error } = await supabase
      .from('maintenance_requests')
      .update({
        status,
        resolved_at: status === 'resolved' ? new Date().toISOString() : null,
      })
      .eq('id', id)

    if (error) {
      // Revert on error
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? initialRequests.find((ir) => ir.id === id) || r : r))
      )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {COLUMNS.map((column) => {
        const Icon = column.icon
        const items = requests.filter((r) => r.status === column.id)

        return (
          <div key={column.id} className="flex flex-col gap-4">
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${column.bg} ${column.border}`}>
              <Icon className={`h-4 w-4 ${column.iconColor}`} />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm flex-1">
                {column.label}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${column.count_bg}`}>
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3 flex-1">
              {items.length === 0 && (
                <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
                  No issues
                </div>
              )}
              {items.map((request) => {
                const property = properties.find((p) => p.id === request.property_id)
                const tenant = request.tenant_id
                  ? tenants.find((t) => t.id === request.tenant_id)
                  : undefined

                return (
                  <MaintenanceCard
                    key={request.id}
                    request={request}
                    property={property}
                    tenant={tenant}
                    onStatusChange={column.id !== 'resolved' ? handleStatusChange : undefined}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
