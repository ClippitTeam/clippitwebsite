# EmailJS Setup Guide for Clippit

## Overview
The Clippit admin dashboard uses EmailJS to send automated emails when:
- Adding new clients (welcome emails with login credentials)
- Adding new team members (onboarding emails with access details)
- Inviting investors to the Investor Lounge

## Setup Steps

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Create an Email Service
1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the connection steps for your provider
5. Note your **Service ID** (e.g., `service_clippit`)

### 3. Create Email Templates

#### Template 1: Client Welcome Email
1. Go to **Email Templates** → **Create New Template**
2. Template Name: `Client Welcome`
3. Template ID: `template_client_welcome`
4. Template Content:
```
Subject: Welcome to Clippit - Your Account is Ready! 🎉

Hi {{to_name}},

Welcome to Clippit! Your client account has been created and is ready to use.

Your Login Details:
- Username: {{username}}
- Temporary Password: {{temp_password}}
- Login URL: {{login_url}}

⚠️ Important: You'll be required to change your password when you first log in for security purposes.

What You Can Do:
• View and track your projects in real-time
• Access invoices and payment history
• Communicate directly with our team
• Download project files and resources
• Submit support requests

If you have any questions or need assistance, feel free to reach out to our support team.

Best regards,
The Clippit Team

Need help? Contact us at {{support_email}} or {{support_phone}}
```

#### Template 2: Team Member Welcome Email
1. Create another template
2. Template Name: `Team Member Welcome`
3. Template ID: `template_team_welcome`
4. Template Content:
```
Subject: Welcome to the Clippit Team! 🎉

Hi {{to_name}},

Welcome to Clippit! Your team member account has been created. We're excited to have you on board.

Your Login Details:
- Username: {{username}}
- Temporary Password: {{temp_password}}
- Login URL: {{login_url}}

⚠️ Important: You'll be required to change your password when you first log in for security purposes.

What You Can Access:
• Team dashboard and project management tools
• Assigned tasks and project updates
• Internal communication and messaging
• Team calendar and meeting schedules
• Company resources and documentation

If you have any questions, feel free to reach out to your manager or our support team.

Welcome aboard!
The Clippit Team

Need help? Contact us at {{support_email}} or {{support_phone}}
```

#### Template 3: Investor Invitation Email
1. Create another template
2. Template Name: `Investor Invitation`
3. Template ID: `template_investor_invite`
4. Template Content:
```
Subject: Exclusive Invitation to Clippit Investor Lounge 💰

Hi {{to_name}},

You've been invited to join the exclusive Clippit Investor Lounge!

Your Invitation Details:
- Invitation Code: {{invitation_code}}
- Access Link: {{invitation_link}}
- Package: {{package_name}}
- Valid Until: {{expiry_date}}

What You Get:
• Exclusive portfolio insights & analytics
• Real-time investment performance tracking
• Direct access to investment opportunities
• Quarterly reports & strategic analysis

{{personal_message}}

Click the link above to accept your invitation and set up your account.

Looking forward to having you in the Investor Lounge!

Best regards,
The Clippit Team

Questions? Contact us at {{support_email}}
```

### 4. Get Your Public Key
1. In EmailJS dashboard, go to **Account** → **General**
2. Find your **Public Key** (looks like: `user_xxxxxxxxxxxxx`)
3. Copy this key

### 5. Update Configuration Files

#### Update admin-dashboard.html
Replace line with your public key:
```javascript
// OLD:
emailjs.init('YOUR_PUBLIC_KEY');

// NEW (example):
emailjs.init('user_abc123xyz456');
```

#### Update admin-dashboard.js
Replace service and template IDs:
```javascript
// Find the autoSendTeamMemberWelcome function and update:

// OLD:
emailjs.send('service_clippit', 'template_team_welcome', templateParams)

// NEW (use your actual IDs):
emailjs.send('service_xxxxxxxxx', 'template_team_welcome', templateParams)
```

### 6. Test Email Functionality

1. **Test Client Onboarding:**
   - Log in as admin
   - Go to Clients tab
   - Click "Add Client"
   - Fill in client details
   - Submit form
   - Check if welcome email is sent

2. **Test Team Member Onboarding:**
   - Go to Team tab
   - Click "Add Team Member"
   - Fill in member details
   - Submit form
   - Check if welcome email is sent

3. **Test Investor Invitation:**
   - Click "Invite Investor" button in header
   - Fill in investor details
   - Send invitation
   - Check if invitation email is sent

## Template Variables

Make sure your EmailJS templates use these variable names:

### Client Welcome Template
- `{{to_name}}` - Client name
- `{{to_email}}` - Client email
- `{{username}}` - Login username
- `{{temp_password}}` - Temporary password
- `{{login_url}}` - Login page URL
- `{{company_name}}` - Your company name
- `{{support_email}}` - Support email address
- `{{support_phone}}` - Support phone number

### Team Member Template
- `{{to_name}}` - Team member name
- `{{to_email}}` - Team member email
- `{{username}}` - Login username
- `{{temp_password}}` - Temporary password
- `{{login_url}}` - Login page URL
- `{{company_name}}` - Your company name
- `{{support_email}}` - Support email address
- `{{support_phone}}` - Support phone number

### Investor Invitation Template
- `{{to_name}}` - Investor name
- `{{to_email}}` - Investor email
- `{{invitation_code}}` - Unique invitation code
- `{{invitation_link}}` - Direct access link
- `{{package_name}}` - Subscription package name
- `{{expiry_date}}` - Invitation expiry date
- `{{personal_message}}` - Optional personal message
- `{{support_email}}` - Support email address

## Troubleshooting

### Email Not Sending
1. Check browser console for errors
2. Verify all IDs match (Service ID, Template IDs)
3. Ensure Public Key is correct
4. Check EmailJS dashboard for usage limits (free tier has monthly limits)

### Template Variables Not Working
1. Make sure variable names match exactly (case-sensitive)
2. Use double curly braces: `{{variable_name}}`
3. Test template in EmailJS dashboard before using in app

### Rate Limiting
- Free tier: 200 emails/month
- If you hit limits, upgrade your EmailJS plan
- Consider adding delays between bulk email sends

## Free Tier Limits
- 200 emails per month
- 2 email services
- Unlimited templates
- Basic email tracking

## Upgrade Options
If you need more:
- Personal Plan: 1,000 emails/month ($15/mo)
- Business Plan: 10,000 emails/month ($60/mo)
- Enterprise: Custom pricing

## Security Notes
- Never commit your Public Key to public repositories (use environment variables)
- Use Email Template IDs, not inline templates
- Regularly rotate API keys
- Monitor usage in EmailJS dashboard

## Support
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS Support: support@emailjs.com
- Clippit Support: support@clippit.com

---

Once configured, the system will automatically send emails when:
✅ New clients are added (with login credentials)
✅ New team members are added (with onboarding info)
✅ Investors are invited (with exclusive access links)
