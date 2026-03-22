import type { Metadata } from 'next'
import { PropertyForm } from '@/components/properties/PropertyForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Add Property' }

export default function NewPropertyPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add a new property</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fill in the details below. You can edit everything later.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PropertyForm />
        </CardContent>
      </Card>
    </div>
  )
}
