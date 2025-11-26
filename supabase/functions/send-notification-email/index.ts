import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Microsoft Graph API Configuration
const TENANT_ID = Deno.env.get('MSGRAPH_TENANT_ID') || ''
const CLIENT_ID = Deno.env.get('MSGRAPH_CLIENT_ID') || ''
const CLIENT_SECRET = Deno.env.get('MSGRAPH_CLIENT_SECRET') || ''
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || ''

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Token cache
let accessToken: string | null = null
let tokenExpiry: number = 0

interface EmailQueueItem {
  id: string
  recipient_email: string
  recipient_name: string
  subject: string
  html_body: string
  text_body?: string
  attempts: number
  max_attempts: number
}

serve(async (req) => {
  try {
    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get pending emails from queue (limit 50 per invocation)
    const { data: emails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .lt('attempts', 3) // Max 3 attempts
      .limit(50)
      .order('created_at', { ascending: true })

    if (fetchError) {
      console.error('Error fetching emails:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch emails' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (!emails || emails.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No emails to send', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Processing ${emails.length} emails`)

    let successCount = 0
    let failureCount = 0

    // Process each email
    for (const email of emails as EmailQueueItem[]) {
      try {
        // Update attempt count
        await supabase
          .from('email_queue')
          .update({
            attempts: email.attempts + 1,
            last_attempt_at: new Date().toISOString()
          })
          .eq('id', email.id)

        // Send email via Resend
        const result = await sendEmail(email)

        if (result.success) {
          // Mark as sent
          await supabase
            .from('email_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              error_message: null
            })
            .eq('id', email.id)

          successCount++
          console.log(`✓ Sent email to ${email.recipient_email}`)
        } else {
          // Mark as failed if max attempts reached
          const newAttempts = email.attempts + 1
          const isFinalAttempt = newAttempts >= email.max_attempts

          await supabase
            .from('email_queue')
            .update({
              status: isFinalAttempt ? 'failed' : 'pending',
              error_message: result.error,
              scheduled_for: isFinalAttempt ? null : new Date(Date.now() + 5 * 60 * 1000).toISOString() // Retry in 5 minutes
            })
            .eq('id', email.id)

          failureCount++
          console.error(`✗ Failed to send email to ${email.recipient_email}: ${result.error}`)
        }
      } catch (error) {
        console.error(`Error processing email ${email.id}:`, error)
        failureCount++
        
        // Update error in database
        await supabase
          .from('email_queue')
          .update({
            error_message: error.message || 'Unknown error'
          })
          .eq('id', email.id)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: emails.length,
        successful: successCount,
        failed: failureCount
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/**
 * Get OAuth 2.0 access token from Microsoft Graph
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (accessToken && tokenExpiry > now) {
    return accessToken
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  })

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Token acquisition failed:', response.status, errorText)
      throw new Error(`Failed to get access token: ${response.status}`)
    }

    const data = await response.json()
    accessToken = data.access_token
    tokenExpiry = now + ((data.expires_in - 300) * 1000)
    return accessToken
  } catch (error) {
    console.error('Error getting access token:', error)
    throw error
  }
}

async function sendEmail(email: EmailQueueItem): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getAccessToken()

    const message = {
      subject: email.subject,
      body: {
        contentType: 'HTML',
        content: email.html_body,
      },
      toRecipients: [{
        emailAddress: {
          address: email.recipient_email,
        },
      }],
    }

    const emailContent = {
      message: message,
      saveToSentItems: true,
    }

    const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${SENDER_EMAIL}/sendMail`

    const response = await fetch(graphEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Email sending failed:', response.status, errorText)
      return {
        success: false,
        error: `Failed to send email: ${response.status}`
      }
    }

    return { success: true }
  } catch (error) {
    console.error('Send email error:', error)
    return {
      success: false,
      error: error.message || 'Failed to send email'
    }
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
