'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, MapPin, Star } from 'lucide-react'

const MAP_PINS = [
  { top: '25%', left: '20%', status: 'occupied', label: '14 Elm St', delay: '0ms' },
  { top: '40%', left: '45%', status: 'occupied', label: '7 Oak Ave', delay: '200ms' },
  { top: '60%', left: '30%', status: 'vacant', label: '3 High St', delay: '400ms' },
  { top: '35%', left: '65%', status: 'maintenance', label: '22 Mill Rd', delay: '600ms' },
  { top: '55%', left: '70%', status: 'occupied', label: '9 Park Ln', delay: '800ms' },
  { top: '70%', left: '55%', status: 'expiring_soon', label: '1 Queen St', delay: '1000ms' },
]

const STATUS_COLORS: Record<string, string> = {
  occupied: 'bg-emerald-500',
  vacant: 'bg-red-500',
  maintenance: 'bg-amber-500',
  expiring_soon: 'bg-purple-500',
}

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: copy */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm text-emerald-400 font-medium">Now in open beta</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
              Your properties.{' '}
              <span className="text-emerald-400">All in one place.</span>
            </h1>

            <p className="text-lg text-slate-400 mb-8 leading-relaxed max-w-xl">
              LandlordMap helps UK landlords manage properties, tenants, maintenance, and finances —
              with an interactive map view and AI assistant built in.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Start for free
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button size="lg" variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                  See how it works
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {['JD', 'SM', 'KP', 'AT'].map((initials) => (
                  <div
                    key={initials}
                    className="h-8 w-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-slate-300"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-400">Loved by 500+ landlords</p>
              </div>
            </div>
          </div>

          {/* Right: map mockup */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl bg-slate-900 aspect-[4/3]">
              {/* Map background */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
                }}
              />

              {/* Streets simulation */}
              <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 400 300">
                <line x1="0" y1="150" x2="400" y2="150" stroke="#94a3b8" strokeWidth="2" />
                <line x1="200" y1="0" x2="200" y2="300" stroke="#94a3b8" strokeWidth="2" />
                <line x1="0" y1="75" x2="400" y2="75" stroke="#94a3b8" strokeWidth="1" />
                <line x1="0" y1="225" x2="400" y2="225" stroke="#94a3b8" strokeWidth="1" />
                <line x1="100" y1="0" x2="100" y2="300" stroke="#94a3b8" strokeWidth="1" />
                <line x1="300" y1="0" x2="300" y2="300" stroke="#94a3b8" strokeWidth="1" />
                <line x1="50" y1="0" x2="350" y2="300" stroke="#94a3b8" strokeWidth="0.5" />
              </svg>

              {/* Animated pins */}
              {MAP_PINS.map((pin, i) => (
                <div
                  key={i}
                  className="absolute group"
                  style={{ top: pin.top, left: pin.left, animationDelay: pin.delay }}
                >
                  <div
                    className={`h-4 w-4 rounded-full ${STATUS_COLORS[pin.status]} shadow-lg animate-pulse-slow flex items-center justify-center`}
                  >
                    <div className="h-2 w-2 rounded-full bg-white/70" />
                  </div>
                  <div className="absolute left-5 top-0 hidden group-hover:block bg-white rounded-lg px-2 py-1 text-xs font-medium text-slate-800 shadow-lg whitespace-nowrap z-10">
                    {pin.label}
                  </div>
                </div>
              ))}

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex flex-col gap-1.5 bg-slate-900/80 backdrop-blur rounded-lg p-3 border border-slate-700">
                {[
                  { status: 'occupied', label: 'Occupied' },
                  { status: 'vacant', label: 'Vacant' },
                  { status: 'maintenance', label: 'Maintenance' },
                  { status: 'expiring_soon', label: 'Expiring soon' },
                ].map(({ status, label }) => (
                  <div key={status} className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status]}`} />
                    <span className="text-xs text-slate-300">{label}</span>
                  </div>
                ))}
              </div>

              {/* Count badge */}
              <div className="absolute top-3 right-3 bg-emerald-500 text-white text-sm font-bold rounded-lg px-3 py-1.5">
                6 properties
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 border-t border-slate-800 pt-12">
          {[
            { value: '500+', label: 'Landlords using LandlordMap' },
            { value: '£2.3M', label: 'Rent managed monthly' },
            { value: '4.9★', label: 'Average rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
