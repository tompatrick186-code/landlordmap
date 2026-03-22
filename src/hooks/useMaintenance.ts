'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MaintenanceRequest } from '@/types'

export function useMaintenance(propertyId?: string) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRequests = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('maintenance_requests')
      .select('*')
      .order('reported_at', { ascending: false })

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setRequests(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchRequests()
  }, [propertyId])

  const updateStatus = async (id: string, status: MaintenanceRequest['status']) => {
    const supabase = createClient()
    const updates: Partial<MaintenanceRequest> = { status }
    if (status === 'resolved') {
      updates.resolved_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('maintenance_requests')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  return { requests, loading, error, refetch: fetchRequests, updateStatus }
}
