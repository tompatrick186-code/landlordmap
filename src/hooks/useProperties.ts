'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Property } from '@/types'

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setProperties(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const addProperty = async (property: Omit<Property, 'id' | 'created_at' | 'organisation_id'>) => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: orgMember } = await supabase
      .from('organisation_members')
      .select('organisation_id')
      .eq('user_id', user.id)
      .single()

    if (!orgMember) throw new Error('No organisation')

    const { data, error } = await supabase
      .from('properties')
      .insert({ ...property, organisation_id: orgMember.organisation_id })
      .select()
      .single()

    if (error) throw error
    setProperties((prev) => [data, ...prev])
    return data
  }

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    setProperties((prev) => prev.map((p) => (p.id === id ? data : p)))
    return data
  }

  const deleteProperty = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('properties').delete().eq('id', id)
    if (error) throw error
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return {
    properties,
    loading,
    error,
    refetch: fetchProperties,
    addProperty,
    updateProperty,
    deleteProperty,
  }
}
