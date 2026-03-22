import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data } = await supabase.from('properties').select('title').eq('id', params.id).single()
  return { title: `Edit ${data?.title || 'Property'}` }
}

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!property) notFound()

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Link
        href={`/properties/${params.id}`}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to property
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit property</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{property.title}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PropertyForm initialData={property} />
        </CardContent>
      </Card>
    </div>
  )
}
