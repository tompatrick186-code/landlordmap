import { NextRequest, NextResponse } from 'next/server'
import { anthropic, buildSystemPrompt } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    // Get user's org
    const { data: orgMember } = await supabase
      .from('organisation_members')
      .select('organisation_id, organisations(plan)')
      .eq('user_id', user.id)
      .single()

    if (!orgMember) {
      return NextResponse.json({ error: 'No organisation found' }, { status: 403 })
    }

    const plan = (orgMember.organisations as Record<string, unknown>)?.plan as string
    if (plan === 'starter') {
      return NextResponse.json({ error: 'AI assistant requires Pro or Agency plan' }, { status: 403 })
    }

    const orgId = orgMember.organisation_id

    // Fetch landlord data for context
    const [{ data: properties }, { data: tenants }, { data: maintenance }] = await Promise.all([
      supabase
        .from('properties')
        .select('id, title, address, status, rent, bedrooms, bathrooms, epc_rating')
        .eq('organisation_id', orgId),
      supabase
        .from('tenants')
        .select('id, first_name, last_name, email, property_id, lease_start, lease_end, rent_amount, status')
        .eq('organisation_id', orgId),
      supabase
        .from('maintenance_requests')
        .select('id, title, description, priority, status, property_id, reported_at')
        .eq('organisation_id', orgId)
        .neq('status', 'resolved'),
    ])

    const systemPrompt = buildSystemPrompt(
      properties || [],
      tenants || [],
      maintenance || []
    )

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const reply =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return NextResponse.json({ reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
