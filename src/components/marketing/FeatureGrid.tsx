import React from 'react'
import {
  Map,
  Bot,
  Users,
  Wrench,
  BarChart3,
  FileText,
  Bell,
  Shield,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Map,
    title: 'Interactive Map View',
    description:
      'See all your properties on a live Mapbox map. Colour-coded pins by status. Click to see tenant, rent, and maintenance at a glance.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: Bot,
    title: 'AI Assistant',
    description:
      'Ask questions in plain English. "Which leases expire this quarter?" or "Draft a rent increase letter for Oak Avenue." Powered by Claude.',
    color: 'text-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
  },
  {
    icon: Users,
    title: 'Tenant Portal',
    description:
      'Tenants get their own login to view lease details, raise maintenance requests, and download documents. Reduces inbound calls.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Wrench,
    title: 'Maintenance Kanban',
    description:
      'Track every repair from reported → in progress → resolved. Assign contractors, attach photos, log notes. Never lose track of an issue.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    icon: BarChart3,
    title: 'Financial Reports',
    description:
      'Log rent payments and expenses. See monthly profit per property. Export for your accountant. Annual portfolio view included.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
  },
  {
    icon: FileText,
    title: 'Document Storage',
    description:
      'Upload tenancy agreements, gas safety certificates, EPCs, and inventories. Expiry alerts so you never miss a compliance deadline.',
    color: 'text-rose-500',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  {
    icon: Bell,
    title: 'Smart Reminders',
    description:
      'Automatic email alerts for lease renewals, rent overdue, document expiry, and maintenance updates. Stay ahead of everything.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    icon: Shield,
    title: 'Compliance Tracker',
    description:
      'Keep on top of EPC ratings, gas safety checks, electrical inspections, and deposit protection. Know what needs renewing before it lapses.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
]

export function FeatureGrid() {
  return (
    <section className="py-24 bg-white dark:bg-slate-950" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything a UK landlord needs
          </h2>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Built specifically for the UK private rented sector, with all the tools you actually use — nothing you don't.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="group rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200"
              >
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} mb-4`}>
                  <Icon className={`h-5 w-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
