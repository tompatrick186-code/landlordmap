import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Bath, Calendar, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDateShort, getStatusColor, daysUntil } from '@/lib/utils'
import type { Property, Tenant } from '@/types'

interface PropertyCardProps {
  property: Property
  tenant?: Tenant
}

const STATUS_LABELS: Record<string, string> = {
  occupied: 'Occupied',
  vacant: 'Vacant',
  maintenance: 'Maintenance',
  expiring_soon: 'Expiring soon',
}

const GRADIENT_PLACEHOLDERS: Record<string, string> = {
  occupied: 'from-emerald-600 to-teal-700',
  vacant: 'from-slate-500 to-slate-700',
  maintenance: 'from-amber-500 to-orange-600',
  expiring_soon: 'from-purple-600 to-violet-700',
}

export function PropertyCard({ property, tenant }: PropertyCardProps) {
  const gradient = GRADIENT_PLACEHOLDERS[property.status] || GRADIENT_PLACEHOLDERS.vacant
  const leaseEndDays = tenant ? daysUntil(tenant.lease_end) : null

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
        {/* Photo */}
        <div className="relative h-44 overflow-hidden">
          {property.photo_url ? (
            <Image
              src={property.photo_url}
              alt={property.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-end p-3`}>
              <span className="text-white/60 text-xs font-medium">No photo</span>
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                getStatusColor(property.status)
              )}
            >
              {STATUS_LABELS[property.status] || property.status}
            </span>
          </div>

          {/* Rent badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center bg-black/60 backdrop-blur text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              {formatCurrency(property.rent)}/mo
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
            {property.title}
          </h3>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 mb-3">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">{property.address}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms}
            </span>
            {property.epc_rating && (
              <span className="font-medium text-slate-700 dark:text-slate-300">
                EPC {property.epc_rating}
              </span>
            )}
          </div>

          {tenant && (
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <User className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                  {tenant.first_name} {tenant.last_name}
                </span>
              </div>
              {leaseEndDays !== null && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span
                    className={cn(
                      'text-xs font-medium',
                      leaseEndDays < 60
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-slate-500 dark:text-slate-400'
                    )}
                  >
                    {leaseEndDays < 0
                      ? 'Expired'
                      : leaseEndDays === 0
                      ? 'Today'
                      : `${leaseEndDays}d left`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
