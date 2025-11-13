// Import Deno's required modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for allowing requests from your website
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Microsoft Graph API Configuration
const TENANT_ID = Deno.env.get('MSGRAPH_TENANT_ID') || '';
const CLIENT_ID = Deno.env.get('MSGRAPH_CLIENT_ID') || '';
const CLIENT_SECRET = Deno.env.get('MSGRAPH_CLIENT_SECRET') || '';
const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL') || '';
const RECIPIENT_EMAIL = Deno.env.get('RECIPIENT_EMAIL') || '';

// Token cache
let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get OAuth 2.0 access token from Microsoft Graph
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  const now = Date.now();
  if (accessToken && tokenExpiry > now) {
    return accessToken;
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    scope: 'https://graph.microsoft.com/.default',
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token acquisition failed:', response.status, errorText);
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Set expiry to 5 minutes before actual expiry for safety
    tokenExpiry = now + ((data.expires_in - 300) * 1000);

    return accessToken;
  } catch (error) {
    console.error('Error getting access token:', error);
    console.log('Full token error details:', JSON.stringify(error, null, 2));
    console.log('Error type:', typeof error);
    console.log('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.log('Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Send email via Microsoft Graph API
 */
async function sendEmail(formData: {
  name: string;
  email: string;
  phone?: string;
  service: string;
  message: string;
}) {
  const token = await getAccessToken();

  // Create email content with styled HTML template
  const message = {
    subject: `New Contact Form Submission from ${formData.name}`,
    body: {
      contentType: 'HTML',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #40E0D0, #36B8A8); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #40E0D0; }
            .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #40E0D0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 2px solid #40E0D0; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🎯 New Contact Form Submission</h2>
              <p>You have received a new inquiry from your Clippit website</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="label">👤 Name:</div>
                <div class="value">${formData.name}</div>
              </div>
              <div class="field">
                <div class="label">📧 Email:</div>
                <div class="value"><a href="mailto:${formData.email}">${formData.email}</a></div>
              </div>
              ${formData.phone ? `
              <div class="field">
                <div class="label">📞 Phone:</div>
                <div class="value"><a href="tel:${formData.phone}">${formData.phone}</a></div>
              </div>
              ` : ''}
              <div class="field">
                <div class="label">🔧 Service Interested In:</div>
                <div class="value">${formData.service}</div>
              </div>
              <div class="field">
                <div class="label">💬 Message:</div>
                <div class="value">${formData.message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="footer">
                <p>This email was sent from the contact form on clippit.today</p>
                <p>Received: ${new Date().toLocaleString('en-US', {
                  timeZone: 'Australia/Brisbane',
                  dateStyle: 'full',
                  timeStyle: 'long'
                })}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    toRecipients: [
      {
        emailAddress: {
          address: RECIPIENT_EMAIL,
        },
      },
    ],
    replyTo: [
      {
        emailAddress: {
          address: formData.email,
        },
      },
    ],
  };

  // Create request body
  const emailContent = {
    message: message,
    saveToSentItems: true,
  };

  // Send email via Microsoft Graph
  const graphEndpoint = `https://graph.microsoft.com/v1.0/users/${SENDER_EMAIL}/sendMail`;

  try {
    const response = await fetch(graphEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Email sending failed:', response.status, errorText);
      throw new Error(`Failed to send email: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    console.log('Full email send error details:', JSON.stringify(error, null, 2));
    console.log('Error type:', typeof error);
    console.log('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.log('Error message:', error instanceof Error ? error.message : String(error));
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
}

/**
 * Validate form data
 */
function validateFormData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.service || data.service.trim().length === 0) {
    errors.push('Service selection is required');
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.push('Message must be at least 10 characters');
  }

  // Validate phone if provided
  if (data.phone && data.phone.trim().length > 0) {
    // Basic phone validation
    if (!/^[\d\s\-\+\(\)]+$/.test(data.phone)) {
      errors.push('Invalid phone number format');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limiting check
 */
const requestLog = new Map<string, number[]>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  // Get recent requests for this email
  let requests = requestLog.get(email) || [];
  
  // Filter out requests older than 1 hour
  requests = requests.filter(time => time > hourAgo);
  
  // Check if more than 5 requests in last hour
  if (requests.length >= 5) {
    return false;
  }
  
  // Add current request
  requests.push(now);
  requestLog.set(email, requests);
  
  return true;
}

/**
 * Log submission to Supabase
 */
async function logSubmission(formData: any) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not configured, skipping logging');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await supabase.from('contact_submissions').insert({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      service: formData.service,
      message: formData.message,
      submitted_at: new Date().toISOString(),
    });
  } catch (error) {
    // Log error but don't fail the request
    console.error('Error logging submission:', error);
  }
}

/**
 * Main handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const formData = await req.json();

    // Validate form data
    const validation = validateFormData(formData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation failed',
          errors: validation.errors 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(formData.email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many requests. Please try again later.' 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Send email via Microsoft Graph
    await sendEmail(formData);

    // Log submission to database (non-blocking)
    logSubmission(formData).catch(console.error);

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Thank you! Your message has been sent successfully.' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    console.log('=== MAIN ERROR HANDLER ===');
    console.log('Full error details:', JSON.stringify(error, null, 2));
    console.log('Error type:', typeof error);
    console.log('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.log('Error message:', error instanceof Error ? error.message : String(error));
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.log('========================');
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send message. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
