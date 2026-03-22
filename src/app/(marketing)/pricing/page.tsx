import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { PricingTable } from '@/components/marketing/PricingTable'
import { Footer } from '@/components/marketing/Footer'
import { Check, X } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, honest pricing for UK landlords. Start free, upgrade when you need more.',
}

const COMPARISON_FEATURES = [
  { name: 'Properties', starter: '3', pro: '25', agency: 'Unlimited' },
  { name: 'Tenant management', starter: true, pro: true, agency: true },
  { name: 'Maintenance tracker', starter: true, pro: true, agency: true },
  { name: 'Document storage', starter: '500MB', pro: '10GB', agency: '100GB' },
  { name: 'Basic financial log', starter: true, pro: true, agency: true },
  { name: 'Interactive map view', starter: false, pro: true, agency: true },
  { name: 'AI assistant', starter: false, pro: true, agency: true },
  { name: 'Tenant portal', starter: false, pro: true, agency: true },
  { name: 'Financial reports & export', starter: false, pro: true, agency: true },
  { name: 'Smart email reminders', starter: false, pro: true, agency: true },
  { name: 'Multi-user / team access', starter: false, pro: false, agency: true },
  { name: 'Role-based permissions', starter: false, pro: false, agency: true },
  { name: 'White-label tenant portal', starter: false, pro: false, agency: true },
  { name: 'API access', starter: false, pro: false, agency: true },
  { name: 'Custom onboarding', starter: false, pro: false, agency: true },
  { name: 'Support', starter: 'Email', pro: 'Priority email', agency: 'Phone & email' },
]

function CellValue({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-4 w-4 text-emerald-500 mx-auto" />
    ) : (
      <X className="h-4 w-4 text-slate-300 dark:text-slate-700 mx-auto" />
    )
  }
  return <span className="text-sm text-slate-600 dark:text-slate-400">{value}</span>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <MarketingNav />

      <div className="pt-20">
        <PricingTable />

        {/* Detailed comparison table */}
        <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-10">
            Full feature comparison
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-slate-500 dark:text-slate-400 w-1/2">
                    Feature
                  </th>
                  {['Starter', 'Pro', 'Agency'].map((plan) => (
                    <th
                      key={plan}
                      className="py-3 px-4 text-sm font-semibold text-slate-900 dark:text-white text-center"
                    >
                      {plan}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_FEATURES.map((feature, i) => (
                  <tr
                    key={feature.name}
                    className={`border-t border-slate-100 dark:border-slate-800 ${
                      i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3 px-4 text-sm text-slate-700 dark:text-slate-300">
                      {feature.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CellValue value={feature.starter} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CellValue value={feature.pro} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <CellValue value={feature.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  q: 'Can I try before I buy?',
                  a: 'Yes — the Starter plan is free forever with up to 3 properties. All paid plans include a 14-day free trial. No credit card required to start.',
                },
                {
                  q: 'Can I cancel any time?',
                  a: 'Absolutely. There are no long-term contracts. Cancel any time and you keep access until the end of your billing period.',
                },
                {
                  q: 'How does the AI assistant work?',
                  a: "It's powered by Anthropic's Claude model. It reads your actual property and tenant data to give you relevant, accurate answers. It does not store your conversations beyond the session.",
                },
                {
                  q: 'Is my data secure?',
                  a: 'Your data is stored securely in Supabase with row-level security. Each landlord can only access their own data. We never share your data with third parties.',
                },
                {
                  q: 'What payment methods do you accept?',
                  a: 'We accept all major credit and debit cards via Stripe. Invoices are available for Agency customers.',
                },
                {
                  q: 'Can I manage properties for clients?',
                  a: 'The Agency plan supports multiple users with role-based permissions, making it suitable for letting agents managing properties on behalf of landlord clients.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">{q}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
