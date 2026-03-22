import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    priceId: null,
    properties: 3,
    features: [
      'Up to 3 properties',
      'Basic tenant management',
      'Maintenance tracker',
      'Document storage (500MB)',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 19,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    properties: 25,
    features: [
      'Up to 25 properties',
      'AI assistant',
      'Interactive map view',
      'Financial reports',
      'Tenant portal',
      'Document storage (10GB)',
      'Priority email support',
    ],
  },
  agency: {
    name: 'Agency',
    price: 49,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID,
    properties: -1, // unlimited
    features: [
      'Unlimited properties',
      'Everything in Pro',
      'Multi-user / team access',
      'White-label tenant portal',
      'API access',
      'Document storage (100GB)',
      'Phone & email support',
      'Custom onboarding',
    ],
  },
}
