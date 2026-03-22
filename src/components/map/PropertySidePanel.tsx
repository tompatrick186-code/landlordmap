'use client'

import React from 'react'
import Link from 'next/link'
import { X, MapPin, Bed, Bath, Calendar, User, Wrench, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatDateShort, getStatusColor } from '@/lib/utils'
import type { Property, Tenant, MaintenanceRequest } from '@/types'

interface PropertySidePanelProps {
  property: Property
  tenant?: Tenant
  maintenance?: MaintenanceRequest[]
  onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  occupied: 'Occupied',
  vacant: 'Vacant',
  maintenance: 'Maintenance',
  expiring_soon: 'Expiring soon',
}

export function PropertySidePanel({
  property,
  tenant,
  maintenance = [],
  onClose,
}: PropertySidePanelProps) {
  const openMaintenance = maintenance.filter((m) => m.status !== 'resolved')

  return (
    <div className="absolute right-0 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl animate-slide-in-right overflow-y-auto z-10">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-semibold text-slate-900 dark:text-white truncate">{property.title}</h3>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mt-0.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="text-xs truncate">{property.address}</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-4 space-y-5">
        {/* Status + rent */}
        <div className="flex items-center justify-between">
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full', getStatusColor(property.status))}>
            {STATUS_LABELS[property.status] || property.status}
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(property.rent)}
            <span className="text-sm font-normal text-slate-500">/mo</span>
          </span>
        </div>

        {/* Details */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Bed className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {property.bedrooms}
            </span>
            <p className="text-xs text-slate-500">Beds</p>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <Bath className="h-4 w-4 text-slate-400 mx-auto mb-1" />
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {property.bathrooms}
            </span>
            <p className="text-xs text-slate-500">Baths</p>
          </div>
          {property.epc_rating && (
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <span className="text-sm font-bold text-emerald-600">{property.epc_rating}</span>
              <p className="text-xs text-slate-500 mt-1">EPC</p>
            </div>
          )}
        </div>

        {/* Current tenant */}
        {tenant ? (
          <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Current tenant
              </span>
            </div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">
              {tenant.first_name} {tenant.last_name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.email}</p>
            {tenant.lease_end && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                Lease ends {formatDateShort(tenant.lease_end)}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">No active tenant</p>
          </div>
        )}

        {/* Open maintenance */}
        {openMaintenance.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Open issues ({openMaintenance.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {openMaintenance.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <span className="text-slate-700 dark:text-slate-300 truncate flex-1">{item.title}</span>
                  <span className={cn('ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium', getStatusColor(item.priority))}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <Link href={`/properties/${property.id}`}>
          <Button className="w-full gap-2" size="sm">
            View full details
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
