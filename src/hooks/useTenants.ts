'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tenant } from '@/types'

export function useTenants(propertyId?: string) {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenants = async () => {
    setLoading(true)
    const supabase = createClient()

    let query = supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data, error: fetchError } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setTenants(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTenants()
  }, [propertyId])

  return { tenants, loading, error, refetch: fetchTenants }
}
