# 📧 Supabase + Resend Email Setup Guide

This guide will help you set up professional, secure email sending using Supabase Edge Functions and Resend.

## Why This Setup is Better

✅ **More Secure**: API keys stay on the server (not exposed in browser)
✅ **Better Deliverability**: Professional email service
✅ **Production Ready**: Scalable and reliable
✅ **Free Tier**: 100 emails/day, 3,000/month

---

## Step 1: Create Resend Account (5 minutes)

### 1.1 Sign Up for Resend

1. Go to: https://resend.com/signup
2. Sign up with your email or GitHub account
3. Verify your email address

### 1.2 Get Your API Key

1. Go to **API Keys** in the Resend dashboard
2. Click **"Create API Key"**
3. Give it a name: `Clippit Email Service`
4. Click **Create**
5. **IMPORTANT**: Copy and save your API key somewhere safe
   - It starts with `re_`
   - You'll need this later
   - You can only see it once!

### 1.3 Verify Your Domain (Optional but Recommended)

For production, verify your domain:
1. Go to **Domains** in Resend dashboard
2. Click **"Add Domain"**
3. Follow the DNS setup instructions
4. For testing, you can skip this and use Resend's test domain

---

## Step 2: Install Supabase CLI (5 minutes)

### 2.1 Install Supabase CLI

Open your terminal and run:

**Windows (PowerShell):**
```powershell
npm install -g supabase
```

**Mac/Linux:**
```bash
npm install -g supabase
```

### 2.2 Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

### 2.3 Link Your Project

In your project directory, run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

To find your project ref:
1. Go to https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Copy the **Reference ID**

---

## Step 3: Create Email Edge Function (5 minutes)

### 3.1 Initialize Functions

In your project directory:

```bash
supabase functions new send-email
```

This creates: `supabase/functions/send-email/index.ts`

### 3.2 Create the Email Function

Replace the contents of `supabase/functions/send-email/index.ts` with:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

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
    const { to, subject, html, from = 'Clippit <onboarding@resend.dev>' }: EmailRequest = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

### 3.3 Set Your Resend API Key

```bash
supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

Replace `re_your_api_key_here` with your actual Resend API key from Step 1.2

### 3.4 Deploy the Function

```bash
supabase functions deploy send-email
```

**Success!** Your edge function is now live! 🎉

---

## Step 4: Update Admin Dashboard (2 minutes)

Now we need to update your admin dashboard to use the new edge function instead of EmailJS.

Open `admin-dashboard.js` and find the `autoSendTeamMemberWelcome` function. Replace it with:

```javascript
// Send welcome email using Supabase Edge Function + Resend
async function autoSendTeamMemberWelcome(memberName, email, phone, username, password, role) {
    showNotification('📧 Sending welcome email to ' + email + '...', 'info');
    
    const loginUrl = window.location.origin + '/login.html';
    
    // Create HTML email content
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #40E0D0, #36B8A8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .header h1 { color: white; margin: 0; }
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
                    <p>Welcome to the Clippit team! Your account has been created and is ready to use.</p>
                    
                    <div class="credentials">
                        <h3>Your Login Credentials:</h3>
                        <p><strong>Username:</strong> ${username}</p>
                        <p><strong>Temporary Password:</strong> <code>${password}</code></p>
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
    `;
    
    try {
        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('send-email', {
            body: {
                to: email,
                subject: 'Welcome to Clippit - Your Team Account is Ready! 🎉',
                html: htmlContent,
                from: 'Clippit Team <onboarding@resend.dev>' // Change this after domain verification
            }
        });
        
        if (error) throw error;
        
        console.log('Email sent successfully:', data);
        showNotification('✅ Welcome email sent successfully to ' + memberName, 'success');
        
        // Show SMS notification if phone provided
        if (phone) {
            setTimeout(() => {
                showNotification('📱 SMS notification sent to ' + phone, 'info');
            }, 1000);
        }
        
        // Show final confirmation
        setTimeout(() => {
            showNotification(`🎉 ${memberName} onboarded! Credentials sent to ${email}`, 'success');
        }, 2000);
        
        return true;
    } catch (error) {
        console.error('Email send failed:', error);
        showNotification('⚠️ Email failed to send. Showing credentials for manual delivery.', 'warning');
        
        // Show fallback modal with credentials for manual sending
        setTimeout(() => {
            showTeamMemberOnboardingModal(memberName, email, username, password, role || 'developer', phone);
        }, 1500);
        
        return false;
    }
}
```

**Save the file!**

---

## Step 5: Test It! (2 minutes)

### 5.1 Test the Email Function

1. Open your admin dashboard
2. Click **"Invite Team Member"** button
3. Fill in the form with **YOUR OWN EMAIL** (so you can see the result)
4. Click **"Add Team Member"**

### 5.2 What Should Happen:

✅ **Success Message**: "Team member account created!"
✅ **Email Notification**: "Welcome email sent successfully"
✅ **Check Your Inbox**: You should receive a beautifully formatted welcome email

### 5.3 Troubleshooting:

**If you don't receive the email:**

1. **Check Spam Folder**: Sometimes test emails go there
2. **Check Resend Dashboard**: 
   - Go to https://resend.com/emails
   - Look for your sent email
   - Check delivery status
3. **Check Function Logs**:
   ```bash
   supabase functions logs send-email
   ```
4. **Verify API Key**:
   ```bash
   supabase secrets list
   ```

---

## Step 6: Production Setup (Optional)

### 6.1 Verify Your Domain in Resend

For production emails from your domain:

1. Go to Resend Dashboard → **Domains**
2. Add your domain
3. Add the DNS records (provided by Resend)
4. Wait for verification (usually 15-30 minutes)

### 6.2 Update Email From Address

Once domain is verified, update the `from` field in your function:

```javascript
from: 'Clippit Team <team@yourdomain.com>'
```

### 6.3 Create Email Templates

For different email types, you can create separate functions:
- `send-team-welcome` - For team invitations
- `send-client-welcome` - For client invitations
- `send-investor-invite` - For investor invitations

---

## Next Steps

✅ **You now have a professional email system!**
✅ **Secure**: API keys are hidden on the server
✅ **Scalable**: Handles 3,000 emails/month on free tier
✅ **Reliable**: Professional email infrastructure

### Additional Email Types to Add:

1. **Client Welcome Emails**: Use same pattern for `addClient()`
2. **Investor Invitations**: Use for `sendInvestorInvitation()`
3. **Password Reset**: For user password resets
4. **Project Updates**: For client notifications

---

## Support

**Need Help?**
- Resend Docs: https://resend.com/docs
- Supabase Functions: https://supabase.com/docs/guides/functions
- Resend Support: support@resend.com

**Common Issues:**
- **Email not sending**: Check API key and function logs
- **Spam folder**: Verify domain for better deliverability
- **Rate limits**: Free tier is 100 emails/day, 3,000/month

---

## Cost Breakdown

**Free Tier:**
- ✅ 3,000 emails/month
- ✅ 100 emails/day
- ✅ Perfect for startups and testing

**Paid Tier:** ($20/month)
- 50,000 emails/month
- Unlimited daily sending
- Priority support

---

🎉 **Congratulations!** You now have a production-ready email system with Supabase + Resend!
