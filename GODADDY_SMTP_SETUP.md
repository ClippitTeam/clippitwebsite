# GoDaddy SMTP Configuration for Supabase

## GoDaddy Email SMTP Settings

If you have a GoDaddy email account (e.g., email@yourdomain.com), use these settings:

### Configuration Details

**For GoDaddy Workspace Email (Office 365):**
```
Hostname/Host: smtp.office365.com
Port: 587
Security: TLS/STARTTLS
Username: Your full GoDaddy email address (e.g., noreply@yourdomain.com)
Password: Your email account password
```

**For GoDaddy Email (cPanel):**
```
Hostname/Host: smtpout.secureserver.net
Port: 587 (or 465 for SSL, or 80/3535 for non-SSL)
Security: TLS/STARTTLS (for port 587) or SSL (for port 465)
Username: Your full GoDaddy email address (e.g., noreply@yourdomain.com)
Password: Your email account password
```

## Step-by-Step Setup in Supabase

1. **Log into Supabase Dashboard:**
   - Go to https://supabase.com/dashboard
   - Select your project: `ehaznoklcisgckglkjot`

2. **Navigate to SMTP Settings:**
   - Click "Authentication" in the left sidebar
   - Click "Email Templates" tab
   - Scroll down to "SMTP Settings"

3. **Fill in the Form:**

   **If you have GoDaddy Workspace (Office 365):**
   ```
   Sender Name: Clippit
   Sender Email: noreply@yourdomain.com (or your GoDaddy email)
   Host: smtp.office365.com
   Port: 587
   Username: noreply@yourdomain.com (your full GoDaddy email)
   Password: Your email password
   ```

   **If you have regular GoDaddy cPanel Email:**
   ```
   Sender Name: Clippit
   Sender Email: noreply@yourdomain.com (or your GoDaddy email)
   Host: smtpout.secureserver.net
   Port: 587
   Username: noreply@yourdomain.com (your full GoDaddy email)
   Password: Your email password
   ```

4. **Click "Save"**

5. **Test the Configuration:**
   - Click "Send test email" button
   - Enter your email address
   - Check if you receive the test email

## How to Find Your GoDaddy Email Settings

If you're not sure which type of GoDaddy email you have:

### Method 1: Check GoDaddy Dashboard
1. Log into https://account.godaddy.com
2. Go to "Email & Office" or "Workspace Email"
3. Click on your email product
4. Look for "Email Settings" or "SMTP Settings"
5. The settings should be listed there

### Method 2: Check Your Email Setup
1. If you use Outlook/Office 365 interface → Use Office 365 settings
2. If you use Webmail/cPanel interface → Use cPanel settings

## Common Issues & Solutions

### Issue: "Authentication Failed"
**Solutions:**
- Double-check your email password is correct
- Make sure you're using your FULL email address as username
- Try creating a specific email account for sending (e.g., noreply@yourdomain.com)
- Check if 2-factor authentication is enabled (may need app password)

### Issue: "Connection Refused"
**Solutions:**
- Try different ports: 587, 465, or 80
- For port 587: Use TLS/STARTTLS
- For port 465: Use SSL
- Check if your GoDaddy plan includes SMTP relay

### Issue: "Relay Access Denied"
**Solutions:**
- Make sure the "From" email matches your GoDaddy email domain
- Verify your email account is active in GoDaddy
- Some GoDaddy plans have SMTP sending limits

## GoDaddy SMTP Sending Limits

Be aware of GoDaddy's email sending limits:
- **Economy hosting**: Up to 250 emails per day
- **Deluxe/Ultimate hosting**: Up to 500 emails per day
- **Workspace Email**: Higher limits depending on plan
- **Office 365**: Much higher limits

If you exceed these limits, consider using a dedicated email service like SendGrid or Resend.

## Alternative: Use a Third-Party Email Service

If GoDaddy SMTP is causing issues or you need higher sending limits, consider:

### SendGrid (Recommended)
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: Your SendGrid API key
Sender: noreply@yourdomain.com

Benefits:
- 100 emails/day free
- Better deliverability
- Email analytics
- No GoDaddy limitations
```

**Setup:**
1. Sign up at https://sendgrid.com
2. Verify your domain (adds credibility)
3. Create an API key
4. Use settings above in Supabase

### Resend
```
Host: smtp.resend.com
Port: 587
Username: resend
Password: Your Resend API key
Sender: noreply@yourdomain.com

Benefits:
- 100 emails/day free
- Modern, developer-friendly
- Great deliverability
```

## Recommended Approach

**For Production:** I recommend using SendGrid or Resend instead of GoDaddy SMTP because:
1. Better email deliverability (less spam)
2. No daily sending limits (on free tier)
3. Email analytics and tracking
4. More reliable
5. Professional authentication (SPF, DKIM)

**For Testing:** GoDaddy SMTP is fine if you just want to test quickly.

## Domain Verification (Optional but Recommended)

To improve email deliverability, add these DNS records in GoDaddy:

1. **SPF Record** (for GoDaddy):
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.secureserver.net ~all
   ```

2. **SPF Record** (for SendGrid):
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:_spf.sendgrid.net ~all
   ```

3. **DKIM Record**: Provided by your email service

These records tell email providers that your emails are legitimate.

## Summary

**Quick Answer for Supabase:**
- **Host:** `smtpout.secureserver.net` (or `smtp.office365.com` if using Office 365)
- **Port:** `587`
- **Username:** Your full GoDaddy email (e.g., noreply@yourdomain.com)
- **Password:** Your email password

Try these settings first. If they don't work, consider using SendGrid (free, more reliable).
