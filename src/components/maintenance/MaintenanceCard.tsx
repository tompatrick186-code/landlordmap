import React from 'react'
import { Calendar, User, Building2 } from 'lucide-react'
import { cn, getStatusColor, formatDateShort } from '@/lib/utils'
import type { MaintenanceRequest, Property, Tenant } from '@/types'

interface MaintenanceCardProps {
  request: MaintenanceRequest
  property?: Property
  tenant?: Tenant
  onStatusChange?: (id: string, status: MaintenanceRequest['status']) => void
}

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-amber-100 text-amber-800',
  urgent: 'bg-red-100 text-red-800',
}

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-amber-500',
  urgent: 'bg-red-500',
}

export function MaintenanceCard({
  request,
  property,
  tenant,
  onStatusChange,
}: MaintenanceCardProps) {
  const daysSince = Math.floor(
    (Date.now() - new Date(request.reported_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-sm transition-shadow">
      {/* Priority + status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full shrink-0', PRIORITY_DOT[request.priority])} />
          <span
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              PRIORITY_COLORS[request.priority]
            )}
          >
            {request.priority}
          </span>
        </div>
        <span className="text-xs text-slate-400">
          {daysSince === 0 ? 'Today' : `${daysSince}d ago`}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1.5">
        {request.title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
        {request.description}
      </p>

      {/* Property + tenant */}
      <div className="space-y-1.5 mb-3">
        {property && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{property.title}</span>
          </div>
        )}
        {tenant && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <User className="h-3 w-3 shrink-0" />
            <span>
              {tenant.first_name} {tenant.last_name}
            </span>
          </div>
        )}
        {request.contractor && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Contractor: {request.contractor}
          </div>
        )}
      </div>

      {/* Status actions */}
      {onStatusChange && request.status !== 'resolved' && (
        <div className="flex gap-2">
          {request.status === 'reported' && (
            <button
              onClick={() => onStatusChange(request.id, 'in_progress')}
              className="flex-1 text-xs py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors font-medium"
            >
              Mark in progress
            </button>
          )}
          {request.status === 'in_progress' && (
            <button
              onClick={() => onStatusChange(request.id, 'resolved')}
              className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors font-medium"
            >
              Mark resolved
            </button>
          )}
        </div>
      )}
    </div>
  )
}
