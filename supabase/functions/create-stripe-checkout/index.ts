// Create Stripe Checkout Session for Invoice Payment
// Deno edge function for Stripe payment integration

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import Stripe from 'https://esm.sh/stripe@14.11.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get JWT from authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Parse request body
    const { invoiceId } = await req.json()

    if (!invoiceId) {
      throw new Error('Invoice ID is required')
    }

    // Fetch invoice details
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        client:profiles!client_id(id, full_name, email, company),
        line_items:invoice_line_items(*)
      `)
      .eq('id', invoiceId)
      .single()

    if (invoiceError || !invoice) {
      throw new Error('Invoice not found')
    }

    // Verify user is the client for this invoice
    if (invoice.client_id !== user.id) {
      throw new Error('Unauthorized - Not your invoice')
    }

    // Check if invoice is already paid
    if (invoice.status === 'paid') {
      throw new Error('Invoice is already paid')
    }

    // Check if invoice has amount due
    if (invoice.amount_due <= 0) {
      throw new Error('No amount due on this invoice')
    }

    // Get your website URL for success/cancel redirects
    const siteUrl = Deno.env.get('SITE_URL') || 'https://clippitteam.github.io/clippitwebsite'

    // Create line items for Stripe checkout
    const lineItems = [{
      price_data: {
        currency: 'aud',
        product_data: {
          name: `Invoice ${invoice.invoice_number}`,
          description: `Payment for invoice ${invoice.invoice_number}`,
          metadata: {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
          },
        },
        unit_amount: Math.round(invoice.amount_due * 100), // Convert to cents
      },
      quantity: 1,
    }]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoice.id}`,
      cancel_url: `${siteUrl}/customer-dashboard.html?payment_cancelled=true&invoice_id=${invoice.id}`,
      customer_email: invoice.client.email,
      client_reference_id: invoice.id,
      metadata: {
        invoice_id: invoice.id,
        invoice_number: invoice.invoice_number,
        user_id: user.id,
      },
      payment_intent_data: {
        metadata: {
          invoice_id: invoice.id,
          invoice_number: invoice.invoice_number,
        },
      },
    })

    // Store session ID in database
    await supabase
      .from('invoices')
      .update({
        stripe_checkout_session_id: session.id,
        payment_provider: 'stripe',
        payment_link: session.url,
        payment_link_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      })
      .eq('id', invoice.id)

    // Create pending payment transaction record
    await supabase
      .from('payment_transactions')
      .insert({
        invoice_id: invoice.id,
        transaction_id: session.id,
        provider: 'stripe',
        amount: invoice.amount_due,
        currency: 'AUD',
        status: 'pending',
        payer_email: invoice.client.email,
        payer_name: invoice.client.full_name,
        provider_metadata: {
          session_id: session.id,
          payment_intent: session.payment_intent,
        },
      })

    console.log('Stripe checkout session created:', session.id)

    return new Response(
      JSON.stringify({
        success: true,
        sessionId: session.id,
        checkoutUrl: session.url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error creating Stripe checkout:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
