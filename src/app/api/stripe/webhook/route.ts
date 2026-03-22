import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

// Use service role to bypass RLS for webhook updates
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const subscriptionId = session.subscription as string

        // Get the subscription to determine the plan
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id

        let plan: 'starter' | 'pro' | 'agency' = 'starter'
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) plan = 'pro'
        if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) plan = 'agency'

        // Update organisation by stripe_customer_id
        const { error } = await supabaseAdmin
          .from('organisations')
          .update({ plan, stripe_customer_id: customerId })
          .eq('stripe_customer_id', customerId)

        if (error) {
          // Try to find by metadata if no customer ID match
          const orgId = session.metadata?.organisation_id
          if (orgId) {
            await supabaseAdmin
              .from('organisations')
              .update({ plan, stripe_customer_id: customerId })
              .eq('id', orgId)
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Downgrade to starter
        await supabaseAdmin
          .from('organisations')
          .update({ plan: 'starter' })
          .eq('stripe_customer_id', customerId)

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        console.log(`Payment failed for customer ${customerId}`)
        // Could send an email via Resend here
        break
      }

      default:
        // Ignore other events
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
