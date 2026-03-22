import { MarketingNav } from '@/components/marketing/MarketingNav'
import { HeroSection } from '@/components/marketing/HeroSection'
import { FeatureGrid } from '@/components/marketing/FeatureGrid'
import { PricingTable } from '@/components/marketing/PricingTable'
import { Footer } from '@/components/marketing/Footer'
import { Star, Quote } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'James D.',
    role: 'Landlord, 8 properties',
    quote:
      'I used to manage everything in spreadsheets. LandlordMap cut my admin time in half. The map view alone is worth it — I can see exactly what\'s happening across my whole portfolio at a glance.',
    rating: 5,
  },
  {
    name: 'Sarah M.',
    role: 'BTL investor, 14 properties',
    quote:
      'The AI assistant is genuinely useful. I asked it to draft a rent increase letter and it gave me something professional I could actually send. It even flagged I needed to check with a solicitor on the notice period.',
    rating: 5,
  },
  {
    name: 'Kevin P.',
    role: 'Portfolio landlord, 22 properties',
    quote:
      'Tenant portal is a game-changer. My tenants can log maintenance issues directly and I get notified instantly. The back-and-forth phone calls have almost stopped.',
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <HeroSection />
      <FeatureGrid />

      {/* Testimonials */}
      <section className="py-24 bg-slate-900" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Landlords love it
            </h2>
            <p className="text-slate-400">
              Join 500+ landlords already managing their portfolios with LandlordMap.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6"
              >
                <Quote className="h-6 w-6 text-emerald-500 mb-4 opacity-60" />
                <p className="text-slate-300 text-sm leading-relaxed mb-5">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PricingTable />

      {/* Final CTA */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Start managing your portfolio today
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Free to start. No credit card required. Set up in under 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-colors"
            >
              Start for free
            </a>
            <a
              href="/pricing"
              className="inline-flex items-center justify-center h-12 px-8 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              View pricing
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
