'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Organisation } from '@/types'

export function useOrganisation() {
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrg = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const { data: orgMember, error: fetchError } = await supabase
        .from('organisation_members')
        .select('organisations(*)')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        setError(fetchError.message)
      } else if (orgMember?.organisations) {
        setOrganisation(orgMember.organisations as unknown as Organisation)
      }
      setLoading(false)
    }

    fetchOrg()
  }, [])

  return { organisation, loading, error }
}
