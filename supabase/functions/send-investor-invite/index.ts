import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { name, email, phone, company, packageType, personalMessage } = await req.json()

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name and email are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if investor email already exists
    const { data: existingInvestor } = await supabaseClient
      .from('investors')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingInvestor) {
      return new Response(
        JSON.stringify({ success: false, error: 'An investor with this email already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Generate unique invitation code
    const invitationCode = 'INV-' + Date.now().toString(36).toUpperCase()

    // Determine subscription price based on package
    const subscriptionPrice = packageType === 'vip-free' ? 0 : 14.95

    // Create investor record
    const { data: investor, error: investorError } = await supabaseClient
      .from('investors')
      .insert({
        investor_name: name,
        company: company || null,
        email: email,
        phone: phone || null,
        subscription_status: 'pending',
        subscription_tier: packageType,
        subscription_price: subscriptionPrice,
        invitation_code: invitationCode,
        invitation_sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (investorError) {
      console.error('Error creating investor:', investorError)
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create investor record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Generate login URL
    const loginUrl = `${req.headers.get('origin') || 'https://clippit.today'}/investor-dashboard.html?code=${invitationCode}`

    // Package names for display
    const packageNames: { [key: string]: string } = {
      'vip-free': 'VIP Free Pass',
      'exclusive-pass': 'Exclusive Pass - $14.95/week'
    }

    // Send invitation email via Resend
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured',
          data: {
            investorId: investor.id,
            invitationCode: invitationCode,
            loginUrl: loginUrl
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FBB624, #F59E0B); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .header h1 { color: white; margin: 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .invitation-box { background: white; padding: 20px; border-left: 4px solid #FBB624; margin: 20px 0; border-radius: 5px; }
          .invitation-box p { margin: 10px 0; }
          .warning { background: #fff3cd; padding: 15px; border-left: 4px solid #FBB624; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 15px 30px; background: #FBB624; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
          .footer { background: #333; color: #999; padding: 20px; text-align: center; font-size: 12px; border-radius: 0 0 10px 10px; }
          ul { padding-left: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 Welcome to Clippit Investor Lounge</h1>
          </div>
          <div class="content">
            <h2>Exclusive Invitation for ${name}</h2>
            <p>You've been invited to join the exclusive Clippit Investor Lounge!</p>
            
            ${personalMessage ? `
              <div class="invitation-box">
                <h3>Personal Message:</h3>
                <p>${personalMessage}</p>
              </div>
            ` : ''}
            
            <div class="invitation-box">
              <h3>Your Invitation Details:</h3>
              <p><strong>Invitation Code:</strong> <code>${invitationCode}</code></p>
              <p><strong>Package:</strong> ${packageNames[packageType] || packageType}</p>
              <p><strong>Access Link:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
            </div>
            
            <div class="warning">
              <p><strong>⚠️ Important:</strong> This is an exclusive invitation link. Please keep it secure and do not share it with others.</p>
            </div>
            
            <h3>What You'll Get Access To:</h3>
            <ul>
              <li>Exclusive portfolio insights & analytics</li>
              <li>Real-time investment performance tracking</li>
              <li>Direct access to investment opportunities</li>
              <li>Quarterly reports & strategic analysis</li>
              <li>Priority support and consultation</li>
            </ul>
            
            <center>
              <a href="${loginUrl}" class="button">Access Investor Lounge →</a>
            </center>
            
            <p>If you have any questions or need assistance, feel free to reach out to our investment team.</p>
            
            <p>Best regards,<br><strong>The Clippit Team</strong></p>
          </div>
          <div class="footer">
            <p>Need help? Contact us at investors@clippit.today</p>
            <p>This invitation was sent to ${email}</p>
          </div>
        </div>
      </body>
      </html>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'Clippit Investor Lounge <investors@clippit.today>',
        to: [email],
        subject: '💰 Your Exclusive Invitation to Clippit Investor Lounge',
        html: emailHtml
      })
    })

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text()
      console.error('Resend email error:', emailError)
      
      // Still return success with investor data even if email fails
      return new Response(
        JSON.stringify({ 
          success: true,
          emailSent: false,
          emailError: 'Email delivery failed, but invitation created',
          data: {
            investorId: investor.id,
            invitationCode: invitationCode,
            loginUrl: loginUrl
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        emailSent: true,
        data: {
          investorId: investor.id,
          invitationCode: invitationCode,
          loginUrl: loginUrl
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error in send-investor-invite function:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
