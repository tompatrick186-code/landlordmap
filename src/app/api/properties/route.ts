import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) return NextResponse.json({ error: 'No organisation' }, { status: 403 })

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('organisation_id', orgMember.organisation_id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ properties })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: orgMember } = await supabase
    .from('organisation_members')
    .select('organisation_id')
    .eq('user_id', user.id)
    .single()

  if (!orgMember) return NextResponse.json({ error: 'No organisation' }, { status: 403 })

  const body = await req.json()

  const { data: property, error } = await supabase
    .from('properties')
    .insert({ ...body, organisation_id: orgMember.organisation_id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ property }, { status: 201 })
}
