# 📧 Microsoft Graph API Email Setup Guide

This guide will help you configure secure email sending using Microsoft Graph API with OAuth 2.0 authentication.

---

## ✅ Prerequisites

You already have:
- ✅ Microsoft Azure App Registration
- ✅ Application (client) ID: `4466895d-96eb-4929-b1c7-af16244eed8b`
- ✅ Directory (tenant) ID: `c5d34171-61d2-4f57-ac79-aafbb536b006`
- ✅ Client Secret Value: `ChU8Q~CI0J_SlaJ.mBR23i5SVDUe6sQ9iW3_Vcr1`

---

## 🔧 Step 1: Configure API Permissions in Azure

1. **Go to Azure Portal:**
   - Visit: https://portal.azure.com
   - Navigate to: **Azure Active Directory** → **App registrations**
   - Find your app: **Clippit Email Service**

2. **Add Required Permissions:**
   - Click on your app
   - Go to: **API permissions** (left sidebar)
   - Click: **Add a permission**
   - Select: **Microsoft Graph**
   - Choose: **Application permissions** (not Delegated)
   - Search for and add: **Mail.Send**
   - Click: **Add permissions**

3. **Grant Admin Consent:**
   - After adding the permission, click: **Grant admin consent for [Your Organization]**
   - Confirm: **Yes**
   - ✅ Status should show green checkmark with "Granted"

**⚠️ Important:** Without admin consent, the API won't work!

---

## 📬 Step 2: Configure the Sender Email Account

The sender email must be a valid Microsoft 365 mailbox.

1. **Verify Sender Email:**
   - Your sender email must be: `your-email@yourdomain.com`
   - This must be a valid Microsoft 365 mailbox
   - The app will send emails on behalf of this mailbox

2. **Test Email Account:**
   - Log in to: https://outlook.office.com
   - Use the sender email credentials
   - Verify you can send/receive emails normally

---

## 🔐 Step 3: Configure Environment Variables in Supabase

### A. Set Production Environment Variables

1. **Go to Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: **Clippit**

2. **Navigate to Edge Functions Settings:**
   - Click: **Edge Functions** (left sidebar)
   - Click: **Manage secrets** or **Settings**

3. **Add Environment Variables:**

   Click **New secret** and add each of these:

   ```
   MSGRAPH_TENANT_ID
   c5d34171-61d2-4f57-ac79-aafbb536b006
   ```

   ```
   MSGRAPH_CLIENT_ID
   4466895d-96eb-4929-b1c7-af16244eed8b
   ```

   ```
   MSGRAPH_CLIENT_SECRET
   ChU8Q~CI0J_SlaJ.mBR23i5SVDUe6sQ9iW3_Vcr1
   ```

   ```
   SENDER_EMAIL
   your-email@yourdomain.com
   ```

   ```
   RECIPIENT_EMAIL
   contact@clippit.today
   ```

   **Replace `your-email@yourdomain.com` with your actual Microsoft 365 sender email!**

4. **Save All Secrets**

### B. Set Local Development Variables (Optional)

If testing locally:

1. **Create Local Environment File:**
   ```bash
   cd supabase/functions/send-contact-email
   cp ../../../.env.example .env.local
   ```

2. **Edit `.env.local`:**
   - Fill in all the values from above
   - This file is git-ignored for security

---

## 🚀 Step 4: Deploy the Edge Function

### Deploy to Supabase:

1. **Install Supabase CLI** (if not already):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link Your Project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```
   
   Find your project ref in Supabase Dashboard → Settings → General

4. **Deploy the Function:**
   ```bash
   supabase functions deploy send-contact-email
   ```

5. **Verify Deployment:**
   - Check Supabase Dashboard → Edge Functions
   - You should see `send-contact-email` listed
   - Status should be **Active**

---

## 🧪 Step 5: Test the Email Function

### Test Using cURL:

```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/send-contact-email' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "service": "Website",
    "message": "This is a test message from the contact form."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully."
}
```

### Test Using Website:

1. Open your website: `https://clippit.today`
2. Scroll to the contact form at the bottom
3. Fill in all fields:
   - Name: Your Name
   - Email: your-email@example.com
   - Phone: Optional
   - Service: Select any service
   - Message: Test message
4. Click **Send Message**
5. You should see: ✅ Success notification
6. Check recipient inbox: You should receive the email

---

## 📊 Step 6: Monitor Function Logs

### View Logs in Supabase:

1. **Go to:** Edge Functions → send-contact-email
2. **Click:** Logs tab
3. **Monitor:**
   - Successful sends: Status 200
   - Failed sends: Status 500/400/429
   - Error messages for debugging

### Common Log Messages:

```
✅ Success: "Email sent successfully"
❌ Token Error: "Failed to get access token"
❌ Send Error: "Failed to send email"
⚠️ Rate Limit: "Too many requests"
⚠️ Validation: "Validation failed"
```

---

## 🔍 Troubleshooting

### Issue: "Failed to get access token"

**Causes:**
- Invalid client secret
- Missing API permissions
- Admin consent not granted

**Solutions:**
1. Verify client secret is correct in environment variables
2. Check API permissions in Azure (Mail.Send)
3. Grant admin consent in Azure portal
4. Wait 5-10 minutes after granting consent

---

### Issue: "Failed to send email"

**Causes:**
- Invalid sender email
- Sender email not a Microsoft 365 mailbox
- Insufficient permissions

**Solutions:**
1. Verify sender email exists and is active
2. Test logging into sender email at outlook.office.com
3. Ensure Mail.Send permission is granted
4. Check sender email has Send As permission

---

### Issue: "Too many requests"

**Cause:**
- Rate limiting triggered (5 requests per hour per email)

**Solution:**
- Wait 1 hour before trying again
- This is intentional to prevent spam

---

### Issue: "CORS error"

**Cause:**
- CORS headers not properly configured

**Solution:**
- Verify corsHeaders are set in the Edge Function
- Check browser console for specific CORS error
- Ensure your domain is authorized

---

## 🎯 Email Flow Diagram

```
User fills contact form on website
         ↓
Frontend JavaScript validates input
         ↓
POST request to Supabase Edge Function
         ↓
Edge Function validates data
         ↓
Edge Function checks rate limit
         ↓
Edge Function requests OAuth token from Microsoft
         ↓
Microsoft returns access token
         ↓
Edge Function sends email via Graph API
         ↓
Microsoft Graph sends email
         ↓
Edge Function logs to database (optional)
         ↓
Success response sent to frontend
         ↓
User sees success notification
```

---

## 📧 Email Template

The email sent includes:
- ✅ Professional HTML formatting
- ✅ Clippit branding (turquoise gradient)
- ✅ All form fields (name, email, phone, service, message)
- ✅ Clickable email/phone links
- ✅ Timestamp (Australia/Brisbane timezone)
- ✅ Reply-to set to user's email
- ✅ Sent from your Microsoft 365 account

---

## 🔒 Security Features

✅ **OAuth 2.0 Authentication** - No password storage
✅ **Client Secret Protection** - Never exposed to frontend
✅ **Rate Limiting** - 5 requests per hour per email
✅ **Input Validation** - Server-side validation of all fields
✅ **CORS Protection** - Controlled access from your domain
✅ **Token Caching** - Efficient token reuse
✅ **Error Logging** - Detailed logs for debugging
✅ **SQL Injection Prevention** - Parameterized queries

---

## 📋 Configuration Checklist

- [ ] Azure App Registration created
- [ ] Mail.Send permission added and admin consent granted
- [ ] Sender email verified as valid Microsoft 365 mailbox
- [ ] Environment variables set in Supabase
- [ ] Edge Function deployed to Supabase
- [ ] Test email sent successfully
- [ ] Contact form updated to use new endpoint
- [ ] Logs monitored for any errors
- [ ] Old email code removed from frontend

---

## 🔄 Next Steps

1. ✅ **Test thoroughly** - Send multiple test emails
2. ✅ **Update documentation** - Note any changes needed
3. ✅ **Remove old code** - Delete any hardcoded email credentials
4. ✅ **Monitor production** - Watch logs after deployment
5. ✅ **Setup alerts** - Configure error notifications in Supabase

---

## 📚 Additional Resources

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/api/user-sendmail)
- [OAuth 2.0 Client Credentials](https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-client-creds-grant-flow)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Azure App Permissions](https://learn.microsoft.com/en-us/graph/permissions-reference)

---

## 💡 Tips

1. **Keep client secret secure** - Never commit to Git
2. **Use unique secrets** - Rotate client secret periodically
3. **Monitor rate limits** - Adjust if needed for high traffic
4. **Test regularly** - Verify email delivery monthly
5. **Backup configuration** - Document all settings

---

## ⚠️ Important Security Notes

1. **Never expose client secret** in frontend code
2. **Always use HTTPS** in production
3. **Monitor logs regularly** for suspicious activity
4. **Rotate secrets annually** or if compromised
5. **Keep dependencies updated** for security patches

---

*Your email system is now secure and production-ready!* 🎉
