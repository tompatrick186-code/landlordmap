'use client'

import React, { useState, useEffect } from 'react'
import { PropertyMap } from '@/components/map/PropertyMap'
import { PropertySidePanel } from '@/components/map/PropertySidePanel'
import { createClient } from '@/lib/supabase/client'
import type { Property, Tenant, MaintenanceRequest } from '@/types'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { cn, getStatusDot } from '@/lib/utils'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'expiring_soon', label: 'Expiring soon' },
]

export default function MapPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([])
  const [selected, setSelected] = useState<Property | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: props }, { data: tens }, { data: maint }] = await Promise.all([
        supabase.from('properties').select('*'),
        supabase.from('tenants').select('*').eq('status', 'active'),
        supabase.from('maintenance_requests').select('*').neq('status', 'resolved'),
      ])
      setProperties(props || [])
      setTenants(tens || [])
      setMaintenance(maint || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredProperties = properties.filter((p) => {
    const matchesStatus = !statusFilter || p.status === statusFilter
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const selectedTenant = selected
    ? tenants.find((t) => t.property_id === selected.id)
    : undefined
  const selectedMaintenance = selected
    ? maintenance.filter((m) => m.property_id === selected.id)
    : []

  return (
    <div className="relative h-full flex">
      {/* Left sidebar: property list */}
      <div className="w-72 flex-shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Search + filter */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search properties..."
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filteredProperties.length} propert{filteredProperties.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>

        {/* Property list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-2 p-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No properties match your filters
            </div>
          ) : (
            filteredProperties.map((property) => (
              <button
                key={property.id}
                onClick={() => setSelected(property.id === selected?.id ? null : property)}
                className={cn(
                  'w-full text-left px-3 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                  selected?.id === property.id && 'bg-emerald-50 dark:bg-emerald-900/20'
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={cn('h-2.5 w-2.5 rounded-full shrink-0 mt-1', getStatusDot(property.status))}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {property.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {property.address}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        £{property.rent.toLocaleString()}/mo
                      </span>
                      {!property.lat && (
                        <span className="text-[10px] text-amber-500">No coordinates</span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <PropertyMap
          properties={filteredProperties}
          tenants={tenants}
          selectedId={selected?.id}
          onSelect={setSelected}
        />

        {/* Selected property panel */}
        {selected && (
          <PropertySidePanel
            property={selected}
            tenant={selectedTenant}
            maintenance={selectedMaintenance}
            onClose={() => setSelected(null)}
          />
        )}
      </div>
    </div>
  )
}
