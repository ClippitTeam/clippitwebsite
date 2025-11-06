import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"

// Hardcoded SMTP configuration
const SMTP_HOST = 'smtp.office365.com'
const SMTP_PORT = 587
const SMTP_USER = 'admin@clippit.today'
const SMTP_PASS = '!Kaide1986'
const SMTP_FROM = 'Clippit <admin@clippit.today>'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
  from?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, from = SMTP_FROM }: EmailRequest = await req.json()

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USER,
          password: SMTP_PASS,
        },
      },
    })

    // Send email
    await client.send({
      from: from,
      to: to,
      subject: subject,
      content: 'auto',
      html: html,
    })

    await client.close()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        data: { to, subject, from }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Email send error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to send email',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
