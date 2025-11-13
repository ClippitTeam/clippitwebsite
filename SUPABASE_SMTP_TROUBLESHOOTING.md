# Supabase SMTP Troubleshooting Guide

## Problem: Emails Still Coming from Supabase Default Email

If you're still receiving emails from `noreply@mail.app.supabase.io` after configuring SMTP, follow these steps:

### Step 1: Verify SMTP Settings Are Enabled

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ehaznoklcisgckglkjot`
3. Navigate to **Authentication** → **Email Templates**
4. Scroll down to **SMTP Settings** section
5. **Make sure the toggle/switch for "Enable Custom SMTP" is turned ON** ⚠️

### Step 2: Verify Your SMTP Credentials

Double-check these settings are correct:

**For Office 365/GoDaddy Workspace:**
```
Enable Custom SMTP: ✓ (MUST BE ON!)
Sender Name: Clippit
Sender Email: admin@clippit.today
Host: smtp.office365.com
Port: 587
Username: admin@clippit.today (full email address)
Password: [your email password]
```

### Step 3: Test the Configuration

After enabling and saving:

1. Click the **"Send test email"** button in Supabase dashboard
2. Enter a test email address
3. Check if you receive the email from `admin@clippit.today`
4. If it still comes from `noreply@mail.app.supabase.io`, the SMTP is not enabled

### Step 4: Common Issues

**"Authentication Failed"**
- Verify your email password is correct
- Make sure you're using the FULL email address as username
- Check if 2FA is enabled on your email (may need app-specific password)

**"Connection Timeout"**
- Port 587 should be correct
- Try port 465 if 587 doesn't work
- Check your GoDaddy/Office 365 SMTP settings are correct

**Still Using Default Email**
- The "Enable Custom SMTP" toggle was probably not turned ON
- After turning it on, click SAVE and test again

### Step 5: Alternative SMTP Settings

If Office 365 doesn't work, try regular GoDaddy settings:

```
Host: smtpout.secureserver.net
Port: 587
Username: admin@clippit.today
Password: [your password]
```

## Problem: Reset Link Points to Localhost

The password reset link in the email is pointing to `localhost` which doesn't work. This is because the Site URL in Supabase needs to be configured.

### Fix Site URL:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to: `https://clippitteam.github.io`
3. Add to **Redirect URLs**:
   - `https://clippitteam.github.io/clippitwebsite/reset-password.html`
   - `https://clippitteam.github.io/clippitwebsite/*`
4. Click **Save**

### Alternative: Check Project Settings

1. Go to **Settings** → **General**
2. Find **Site URL** field
3. Make sure it's set to: `https://clippitteam.github.io`
4. Save changes

After these changes, test the password reset flow again:
1. Go to login page
2. Click "Forgot Password"
3. Enter email
4. Check email - should come from admin@clippit.today
5. Click reset link - should go to your live site, not localhost

## Quick Verification Checklist

- [ ] Custom SMTP toggle is **ON** in Supabase
- [ ] SMTP settings saved and test email sent
- [ ] Test email received from admin@clippit.today (not noreply@mail.app.supabase.io)
- [ ] Site URL set to https://clippitteam.github.io in Supabase
- [ ] Redirect URLs configured in Supabase
- [ ] Password reset tested end-to-end

## Still Not Working?

If SMTP still doesn't work after enabling it:

1. **Check GoDaddy Email Limits:** Some plans have daily sending limits
2. **Try SendGrid Instead:** Free, reliable, 100 emails/day
   - Sign up: https://sendgrid.com
   - Much easier setup than GoDaddy SMTP
   - Better deliverability

**SendGrid Settings:**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: [Your SendGrid API Key]
Sender Email: admin@clippit.today
```

## Contact

If you continue to have issues:
- Check Supabase logs for SMTP errors
- Verify your GoDaddy email account is active
- Consider using SendGrid for production (more reliable)
