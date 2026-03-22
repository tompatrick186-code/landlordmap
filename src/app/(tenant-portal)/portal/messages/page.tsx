import { MessageSquare } from 'lucide-react'

export const metadata = { title: 'Messages | Tenant Portal' }

export default function PortalMessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Communication with your landlord
        </p>
      </div>

      <div className="text-center py-20">
        <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
          Messaging coming soon
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          In-app messaging between tenants and landlords is on the roadmap. For now, please contact your landlord directly by email.
        </p>
      </div>
    </div>
  )
}
