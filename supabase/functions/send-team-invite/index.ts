// Import Deno's required modules
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for allowing requests from your website
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Microcoft Graphoft Graph API Configuration
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

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
 * Generate a secure temporary password
 */
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Send team invitation email via Microsoft Graph API
 */
async function sendTeamInviteEmail(
  memberName: string,
  email: string,
  username: string,
  tempPassword: string,
  role: string,
  loginUrl: string
) {
  const token = await getAccessToken();

  const roleNames: Record<string, string> = {
    'developer': 'Developer',
    'designer': 'UI/UX Designer',
    'manager': 'Project Manager',
    'support': 'Support Specialist',
    'marketing': 'Marketing Specialist'
  };

  const roleName = roleNames[role] || role;

  // Create email content with styled HTML template
  const message = {
    subject: `Welcome to the Clippit Team! 🎉`,
    body: {
      contentType: 'HTML',
      content: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #40E0D0, #36B8A8); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; }
            .credentials { background: white; padding: 20px; border-left: 4px solid #40E0D0; margin: 20px 0; border-radius: 5px; }
            .credentials p { margin: 10px 0; }
            .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #FBB624; margin: 20px 0; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #40E0D0; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Clippit!</h1>
            </div>
            <div class="content">
              <h2>Hi ${memberName},</h2>
              <p>Welcome to the Clippit team! Your team member account has been created and is ready to use.</p>
              
              <p><strong>Your Role:</strong> ${roleName}</p>
              
              <div class="credentials">
                <h3>Your Login Credentials:</h3>
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 3px;">${tempPassword}</code></p>
                <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
              </div>
              
              <div class="warning">
                <p><strong>⚠️ Important:</strong> You'll be required to change your password when you first log in for security purposes.</p>
              </div>
              
              <h3>What You Can Access:</h3>
              <ul>
                <li>Team dashboard and project management tools</li>
                <li>Assigned tasks and project updates</li>
                <li>Internal communication and messaging</li>
                <li>Team calendar and meeting schedules</li>
                <li>Company resources and documentation</li>
              </ul>
              
              <a href="${loginUrl}" class="button">Login to Your Account</a>
              
              <p>If you have any questions, feel free to reach out to your manager or our support team.</p>
              
              <p>Welcome aboard!<br><strong>The Clippit Team</strong></p>
            </div>
            <div class="footer">
              <p>Need help? Contact us at support@clippit.com or +61 2 1234 5678</p>
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
 * Validate team member data
 */
function validateTeamMemberData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Valid email is required');
  }

  if (!data.role || data.role.trim().length === 0) {
    errors.push('Role is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
    const requestData = await req.json();

    // Validate team member data
    const validation = validateTeamMemberData(requestData);
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

    // Create Supabase admin client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Generate temporary password
    const tempPassword = generateSecurePassword();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: requestData.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: requestData.name,
        phone: requestData.phone || '',
        role: 'team'
      }
    });

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error('Failed to create user account: ' + authError.message);
    }

    // Create profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: requestData.email,
          full_name: requestData.name,
          role: 'team',
          phone: requestData.phone || null
        }
      ]);

    if (profileError) {
      console.error('Profile error:', profileError);
      // Try to clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error('Failed to create user profile: ' + profileError.message);
    }

    // Construct login URL
    const loginUrl = requestData.loginUrl || 'https://clippit.today/login.html';

    // Send welcome email
    await sendTeamInviteEmail(
      requestData.name,
      requestData.email,
      requestData.email, // username is email
      tempPassword,
      requestData.role,
      loginUrl
    );

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Team member account created and invitation sent successfully',
        data: {
          userId: authData.user.id,
          email: requestData.email,
          username: requestData.email,
          tempPassword: tempPassword,
          role: requestData.role
        }
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
        error: 'Failed to create team member account and send invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
