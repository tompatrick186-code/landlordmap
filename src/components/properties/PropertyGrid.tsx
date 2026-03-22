import React from 'react'
import { PropertyCard } from './PropertyCard'
import type { Property, Tenant } from '@/types'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PropertyGridProps {
  properties: Property[]
  tenants: Tenant[]
}

export function PropertyGrid({ properties, tenants }: PropertyGridProps) {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Building2 className="h-7 w-7 text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          No properties yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
          Add your first property to start tracking tenants, maintenance, and finances.
        </p>
        <Link href="/properties/new">
          <Button>Add your first property</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {properties.map((property) => {
        const tenant = tenants.find((t) => t.property_id === property.id && t.status === 'active')
        return <PropertyCard key={property.id} property={property} tenant={tenant} />
      })}
    </div>
  )
}
