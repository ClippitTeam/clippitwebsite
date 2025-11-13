# Supabase Custom Email Configuration Guide

## Overview
This guide explains how to configure custom email settings for your Supabase project so that password reset emails come from your own domain instead of the default `noreply@mail.app.supabase.io`.

## Why Configure Custom Email?

Currently, your password reset emails are being sent from Supabase's default email address. This can:
- Look unprofessional to users
- Be marked as spam by email providers
- Create trust issues with users who don't recognize the sender

## Solution: Configure Custom SMTP

You need to configure your Supabase project to use a custom SMTP server for sending emails.

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Log in to your account
3. Select your project: `ehaznoklcisgckglkjot`

### Step 2: Navigate to Authentication Settings

1. In the left sidebar, click on **"Authentication"**
2. Click on **"Email Templates"** tab
3. Scroll down to find **"SMTP Settings"** section

### Step 3: Choose an Email Service Provider

You have several options for SMTP providers:

#### Option A: Gmail (Free, Easy Setup)
- **Host**: `smtp.gmail.com`
- **Port**: `587` or `465`
- **User**: Your Gmail address
- **Password**: App-specific password (NOT your regular Gmail password)

**To create Gmail App Password:**
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click "Security" → "2-Step Verification" (must enable this first)
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password in Supabase

**Limitations:**
- Gmail has a daily sending limit of ~500 emails
- Best for testing or small applications

#### Option B: SendGrid (Recommended for Production)
- **Host**: `smtp.sendgrid.net`
- **Port**: `587`
- **User**: `apikey` (literally the word "apikey")
- **Password**: Your SendGrid API key

**To get SendGrid API Key:**
1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Free tier allows 100 emails/day
3. Go to Settings → API Keys
4. Create new API key with "Full Access"
5. Copy the key (you'll only see it once)

**Benefits:**
- Professional service
- Better deliverability
- Email analytics
- Higher sending limits

#### Option C: Resend (Developer-Friendly)
- **Host**: `smtp.resend.com`
- **Port**: `587`
- **User**: `resend`
- **Password**: Your Resend API key

**To get Resend API Key:**
1. Sign up at [https://resend.com](https://resend.com)
2. Free tier allows 100 emails/day
3. Go to API Keys section
4. Create new API key
5. Copy the key

**Benefits:**
- Modern, developer-focused
- Simple API
- Good documentation
- Great deliverability

#### Option D: Mailgun
- **Host**: `smtp.mailgun.org`
- **Port**: `587`
- **User**: Your Mailgun SMTP username
- **Password**: Your Mailgun SMTP password

#### Option E: Amazon SES
- **Host**: Varies by region (e.g., `email-smtp.us-east-1.amazonaws.com`)
- **Port**: `587`
- **User**: Your SMTP username
- **Password**: Your SMTP password

### Step 4: Configure SMTP in Supabase

1. In the Supabase dashboard, under Authentication → Email Templates
2. Scroll to **"SMTP Settings"**
3. Click **"Enable Custom SMTP"**
4. Fill in the form:
   - **Sender name**: `Clippit` (your company name)
   - **Sender email**: `noreply@yourdomain.com` (or your email)
   - **Host**: Your SMTP host (see options above)
   - **Port**: Your SMTP port (usually 587)
   - **Username**: Your SMTP username
   - **Password**: Your SMTP password/API key
5. Click **"Save"**

### Step 5: Verify Domain (Optional but Recommended)

For best deliverability, verify your domain:

1. Use an email address from your own domain (e.g., `noreply@clippit.com`)
2. Add SPF and DKIM records to your domain's DNS
3. Your email provider will give you specific DNS records to add

**SPF Record Example:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.sendgrid.net ~all
```

**DKIM Record:**
Your email provider will provide specific DKIM records.

### Step 6: Test the Configuration

1. In Supabase dashboard, find the **"Send test email"** button
2. Enter your email address
3. Click send
4. Check if you receive the email from your custom domain

### Step 7: Update Email Templates (Optional)

While in Authentication → Email Templates, you can customize:

1. **Confirm signup** - Email sent when users sign up
2. **Invite user** - Email sent when inviting team members
3. **Magic Link** - Email for passwordless login
4. **Change Email Address** - Email for email change confirmation
5. **Reset Password** - Email for password resets

You can customize:
- Subject line
- Email body (HTML and text)
- Add your logo
- Customize colors and branding

## Example Configuration (Gmail)

```
Sender Name: Clippit
Sender Email: your-email@gmail.com
Host: smtp.gmail.com
Port: 587
Username: your-email@gmail.com
Password: xxxx xxxx xxxx xxxx (16-character app password)
```

## Example Configuration (SendGrid)

```
Sender Name: Clippit
Sender Email: noreply@yourdomain.com
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Current Password Reset Flow (After This Fix)

1. User clicks "Forgot Password"
2. Enters their email address
3. Receives email from **your custom domain** (not Supabase)
4. Clicks the link in the email
5. Gets redirected to `https://clippitteam.github.io/clippitwebsite/reset-password.html`
6. Enters new password
7. Password is updated successfully

## Common Issues and Solutions

### Issue: "Connection refused"
**Solution:** Check that the host and port are correct. Try port 465 if 587 doesn't work.

### Issue: "Authentication failed"
**Solution:** 
- For Gmail: Make sure you're using an app-specific password, not your regular password
- For other providers: Verify your API key is correct and has the right permissions

### Issue: "Emails still from Supabase"
**Solution:** 
- Clear your browser cache
- Wait a few minutes for changes to propagate
- Make sure you clicked "Save" in the SMTP settings

### Issue: "Emails going to spam"
**Solution:**
- Verify your domain
- Add SPF and DKIM records
- Use a professional email service like SendGrid
- Avoid spam trigger words in subject line

## Security Best Practices

1. **Never commit SMTP credentials to Git**
2. **Use environment variables for API keys**
3. **Enable 2FA on your email provider account**
4. **Regularly rotate API keys**
5. **Use app-specific passwords for Gmail**
6. **Limit API key permissions to only what's needed**

## Cost Considerations

| Provider | Free Tier | Paid Plans |
|----------|-----------|------------|
| Gmail | 500/day | N/A (not for commercial use) |
| SendGrid | 100/day | Starts at $15/month (40k emails) |
| Resend | 100/day | Starts at $20/month (50k emails) |
| Mailgun | 5,000/month | Starts at $35/month (50k emails) |
| Amazon SES | 3,000/month | $0.10 per 1,000 emails |

## Recommendation

For production use with Clippit, I recommend:

1. **Start with SendGrid or Resend** - Both have generous free tiers and excellent deliverability
2. **Use your own domain** - This builds trust with users
3. **Verify your domain** - Add SPF and DKIM records
4. **Customize email templates** - Match your brand

## Next Steps

1. Choose an SMTP provider (SendGrid recommended)
2. Sign up and get API credentials
3. Configure SMTP in Supabase dashboard
4. Test by clicking "Forgot Password" on your site
5. Verify email comes from your custom address

## Need Help?

If you encounter issues:
1. Check Supabase logs in Dashboard → Settings → Logs
2. Verify SMTP credentials are correct
3. Test with a simple SMTP test tool first
4. Contact your email provider's support

## Related Files

- `login.html` - Contains the "Forgot Password" functionality
- `reset-password.html` - Page where users reset their password
- `supabase-config.js` - Supabase client configuration

## Summary

This fix requires configuring custom SMTP in your Supabase dashboard. The password reset functionality in your code is correct and will work once SMTP is configured. The reset flow has been updated to redirect to the new `reset-password.html` page.
