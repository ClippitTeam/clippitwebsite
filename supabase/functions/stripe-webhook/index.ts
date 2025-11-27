// Stripe Webhook Handler
// Processes Stripe events and updates invoice status automatically

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error('Stripe configuration missing')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No signature provided')
    }

    // Get raw body for signature verification
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('Stripe webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session, supabase)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSucceeded(paymentIntent, supabase)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent, supabase)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge, supabase)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: corsHeaders }
    )
  }
})

// Handle completed checkout session
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  console.log('Processing checkout.session.completed:', session.id)

  const invoiceId = session.metadata?.invoice_id || session.client_reference_id
  
  if (!invoiceId) {
    console.error('No invoice ID in session metadata')
    return
  }

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      provider_metadata: session,
      webhook_received_at: new Date().toISOString(),
      webhook_verified: true,
    })
    .eq('transaction_id', session.id)

  // Call the database function to process the webhook
  const { data, error } = await supabase.rpc('process_payment_webhook', {
    p_transaction_id: session.payment_intent?.toString() || session.id,
    p_invoice_id: invoiceId,
    p_provider: 'stripe',
    p_amount: session.amount_total ? session.amount_total / 100 : 0,
    p_status: 'completed',
    p_metadata: session,
  })

  if (error) {
    console.error('Error processing webhook:', error)
  } else {
    console.log('Webhook processed successfully:', data)
  }
}

// Handle successful payment
async function handlePaymentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log('Processing payment_intent.succeeded:', paymentIntent.id)

  const invoiceId = paymentIntent.metadata?.invoice_id
  
  if (!invoiceId) {
    console.error('No invoice ID in payment intent metadata')
    return
  }

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      provider_metadata: paymentIntent,
      provider_payment_method: paymentIntent.payment_method_types?.[0],
      webhook_received_at: new Date().toISOString(),
      webhook_verified: true,
    })
    .eq('transaction_id', paymentIntent.id)

  // Process the webhook
  await supabase.rpc('process_payment_webhook', {
    p_transaction_id: paymentIntent.id,
    p_invoice_id: invoiceId,
    p_provider: 'stripe',
    p_amount: paymentIntent.amount / 100,
    p_status: 'completed',
    p_metadata: paymentIntent,
  })
}

// Handle failed payment
async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  console.log('Processing payment_intent.payment_failed:', paymentIntent.id)

  const invoiceId = paymentIntent.metadata?.invoice_id
  
  if (!invoiceId) {
    return
  }

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      provider_metadata: paymentIntent,
      webhook_received_at: new Date().toISOString(),
      webhook_verified: true,
    })
    .eq('transaction_id', paymentIntent.id)
}

// Handle refund
async function handleRefund(charge: Stripe.Charge, supabase: any) {
  console.log('Processing charge.refunded:', charge.id)

  const paymentIntentId = charge.payment_intent?.toString()
  
  if (!paymentIntentId) {
    return
  }

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .update({
      status: 'refunded',
      refunded_amount: charge.amount_refunded / 100,
      refunded_at: new Date().toISOString(),
      provider_metadata: charge,
      webhook_received_at: new Date().toISOString(),
      webhook_verified: true,
    })
    .eq('transaction_id', paymentIntentId)

  // You might want to update the invoice status here as well
}
