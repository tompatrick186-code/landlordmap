import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const bucket = (formData.get('bucket') as string) || 'documents'
  const path = formData.get('path') as string | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const fileExt = file.name.split('.').pop()
  const filePath = path || `${user.id}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return NextResponse.json({
    path: data.path,
    url: urlData.publicUrl,
  })
}
