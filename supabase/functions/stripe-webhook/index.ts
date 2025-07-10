import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || '',
      undefined,
      cryptoProvider
    )

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object, supabaseClient)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabaseClient)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object, supabaseClient)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object, supabaseClient)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Webhook error', { status: 400 })
  }
})

async function handleSubscriptionUpdate(subscription: any, supabaseClient: any) {
  const { data: user } = await supabaseClient
    .from('users')
    .select('id')
    .eq('stripe_customer_id', subscription.customer)
    .single()

  if (!user) {
    console.error('User not found for customer:', subscription.customer)
    return
  }

  await supabaseClient
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      stripe_customer_id: subscription.customer,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    })
}

async function handleSubscriptionDeleted(subscription: any, supabaseClient: any) {
  await supabaseClient
    .from('subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)
}

async function handlePaymentSucceeded(invoice: any, supabaseClient: any) {
  // Update subscription status or handle successful payment
  console.log('Payment succeeded for invoice:', invoice.id)
}

async function handlePaymentFailed(invoice: any, supabaseClient: any) {
  // Handle failed payment, possibly notify user
  console.log('Payment failed for invoice:', invoice.id)
}