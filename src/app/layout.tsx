import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'LandlordMap — Property Management for UK Landlords',
    template: '%s | LandlordMap',
  },
  description:
    'Manage your rental properties, tenants, maintenance, and finances with an interactive map view and AI assistant. Built for UK landlords.',
  keywords: ['landlord', 'property management', 'UK', 'rental', 'tenants', 'maintenance'],
  openGraph: {
    title: 'LandlordMap — Property Management for UK Landlords',
    description: 'Your properties. All in one place.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100`}>
        {children}
      </body>
    </html>
  )
}
