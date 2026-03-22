import type { Metadata } from 'next'
import { MarketingNav } from '@/components/marketing/MarketingNav'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { Footer } from '@/components/marketing/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Features',
  description: 'Everything a UK landlord needs to manage their portfolio — map view, AI assistant, tenant portal, maintenance tracker, and more.',
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <MarketingNav />

      <div className="pt-24 pb-12 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4">
          Built for British landlords
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          Every feature is designed around how UK landlords actually work — from gas safety reminders to Section 21 letter drafting.
        </p>
      </div>

      <FeatureGrid />

      <div className="py-16 text-center px-4">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
        >
          Start free — no credit card needed
        </Link>
      </div>

      <Footer />
    </div>
  )
}
