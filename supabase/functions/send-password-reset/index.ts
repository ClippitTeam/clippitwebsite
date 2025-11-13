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

// Supabase Configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

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
    throw error;
  }
}

/**
 * Send password reset email via Microsoft Graph API
 */
async function sendPasswordResetEmail(email: string, resetLink: string) {
  const token = await getAccessToken();

  // Create email content with styled HTML template
  const message = {
    subject: 'Reset Your Clippit Password',
    body: {
      contentType: 'HTML',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #40E0D0, #36B8A8); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px 20px; }
            .icon { font-size: 48px; margin-bottom: 10px; }
            .message { font-size: 16px; line-height: 1.8; margin-bottom: 25px; color: #555; }
            .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: linear-gradient(135deg, #36B8A8, #2da090); }
            .link-box { background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #40E0D0; margin: 20px 0; word-break: break-all; }
            .link-box a { color: #40E0D0; text-decoration: none; }
            .warning { background: #fff8e1; padding: 15px; border-radius: 5px; border-left: 4px solid #ffa726; margin: 20px 0; font-size: 14px; }
            .footer { background: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
            .footer a { color: #40E0D0; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🔐</div>
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p class="message">
                You recently requested to reset your password for your Clippit account. Click the button below to reset it.
              </p>
              
              <center>
                <a href="${resetLink}" class="button">Reset Password</a>
              </center>
              
              <div class="warning">
                ⏱️ <strong>This link will expire in 1 hour</strong> for security reasons.
              </div>
              
              <p class="message">
                If the button doesn't work, you can copy and paste the following link into your browser:
              </p>
              
              <div class="link-box">
                <a href="${resetLink}">${resetLink}</a>
              </div>
              
              <div class="warning">
                🛡️ <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns. Your password won't change until you access the link above and create a new one.
              </div>
            </div>
            <div class="footer">
              <p>This email was sent from <a href="https://clippit.today">clippit.today</a></p>
              <p>Need help? Contact us at <a href="mailto:${SENDER_EMAIL}">${SENDER_EMAIL}</a></p>
              <p>© ${new Date().getFullYear()} Clippit. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    },
    toRecipients: [
      {
        emailAddress: {
          address: email,
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
    throw error;
  }
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
  
  // Check if more than 3 password reset requests in last hour
  if (requests.length >= 3) {
    return false;
  }
  
  // Add current request
  requests.push(now);
  requestLog.set(email, requests);
  
  return true;
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
    const { email } = await req.json();

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(email)) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many password reset requests. Please try again later.' 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error('Error checking user:', userError);
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link shortly.' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const userExists = userData?.users?.some(user => user.email === email);

    if (!userExists) {
      // Don't reveal if user exists or not for security
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'If an account exists with this email, you will receive a password reset link shortly.' 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate password reset token using Supabase
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://clippitteam.github.io/clippitwebsite/reset-password.html'
      }
    });

    if (resetError) {
      console.error('Error generating reset link:', resetError);
      throw new Error('Failed to generate reset link');
    }

    // Extract the reset token from the generated link and reconstruct with live site URL
    const resetLink = resetData.properties.action_link.replace(
      /^https?:\/\/[^\/]+/,
      'https://clippitteam.github.io/clippitwebsite/reset-password.html'
    );

    // Send password reset email via Microsoft Graph
    await sendPasswordResetEmail(email, resetLink);

    // Return success response (don't reveal if user exists)
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link shortly.' 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process password reset request. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
