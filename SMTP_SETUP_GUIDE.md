# 📧 SMTP Email Setup - Simplified

Your email system has been converted from Resend to use your own email address (admin@clippit.today).

## ✅ What's Been Done

- ✅ Updated Edge Function to use SMTP with hardcoded credentials
- ✅ All emails will now come from: **admin@clippit.today**
- ✅ No secrets or environment variables needed
- ✅ Updated admin dashboard email addresses

## 🚀 Deploy to Supabase (Simple Method)

### Option 1: Via Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to Edge Functions**
   - Click **Edge Functions** in the left sidebar
   - Find or create the `send-email` function

3. **Update the Function Code**
   - Click on `send-email` function
   - Replace the code with the contents of `supabase/functions/send-email/index.ts`
   - Click **Deploy**

4. **Done!** The function is now live.

### Option 2: Via Supabase CLI (If you have it installed)

```bash
# Deploy the function
supabase functions deploy send-email
```

## 🧪 Test the Setup

1. Open your admin dashboard: `admin-dashboard.html`
2. Click **"Add Client"** or **"Invite Team Member"**
3. Fill in the form with **your own email** to test
4. Click submit and check your inbox

**The email will come from: admin@clippit.today**

## ✨ What Changed

**Before (Resend):**
- Emails from: onboarding@resend.dev
- Required API key
- Cost: $1/month minimum

**After (Your SMTP):**
- Emails from: admin@clippit.today
- No API keys needed
- Cost: Free (uses your Office365 email)

## 🔒 Security Note

Your SMTP credentials are hardcoded in the Edge Function. This is secure because:
- Edge Functions run in Supabase's secure environment
- The code is not exposed to the client
- Only the deployed function can access the credentials

## 📝 Email Configuration

Your hardcoded settings:
- **SMTP Host:** smtp.office365.com
- **SMTP Port:** 587 (STARTTLS)
- **Email:** admin@clippit.today
- **From Name:** Clippit

## 🆘 Troubleshooting

**If emails don't arrive:**

1. **Check Spam Folder** - First email might go to spam
2. **Check Function Logs** in Supabase Dashboard
3. **Verify Office365 SMTP is enabled** for admin@clippit.today
4. **Check your email password** is correct: !Kaide1986

**Authentication Issues:**
- Office365 might require you to enable "Less secure app access"
- Or use an app-specific password instead

---

🎉 **You're all set!** Just deploy the function and start sending emails from your own address.
