import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ExternalLink, Download } from 'lucide-react'
import { formatDateShort, daysUntil } from '@/lib/utils'

export const metadata = { title: 'Documents | Tenant Portal' }

export default async function PortalDocumentsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, property_id')
    .eq('email', user.email!)
    .eq('status', 'active')
    .single()

  if (!tenant) redirect('/portal')

  const { data: documents } = await supabase
    .from('documents')
    .select('*')
    .or(`tenant_id.eq.${tenant.id},property_id.eq.${tenant.property_id}`)
    .order('created_at', { ascending: false })

  const docs = documents || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Documents</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your tenancy documents and certificates
        </p>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">No documents yet</h3>
          <p className="text-sm text-slate-500">
            Your landlord will upload your tenancy agreement and other documents here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc) => {
            const expiring = doc.expiry_date && daysUntil(doc.expiry_date) < 30
            return (
              <Card key={doc.id}>
                <CardContent className="pt-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{doc.name}</p>
                        <p className="text-xs text-slate-500 capitalize">{doc.type.replace('_', ' ')}</p>
                        {doc.expiry_date && (
                          <p className={`text-xs mt-0.5 ${expiring ? 'text-amber-600' : 'text-slate-400'}`}>
                            Expires {formatDateShort(doc.expiry_date)}
                          </p>
                        )}
                      </div>
                    </div>
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View
                    </a>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
