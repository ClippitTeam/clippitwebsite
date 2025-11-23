# Deploy Customer Invitation Edge Function

This guide explains how to deploy the customer invitation system to Supabase.

## Overview

The customer invitation system allows admins to:
1. Create customer accounts with a single click
2. Generate secure temporary passwords
3. Automatically send welcome emails with login credentials
4. Display credentials for manual delivery if needed

## Prerequisites

- Supabase CLI installed
- Supabase project set up
- Access to your Supabase project

## Files Created

```
supabase/functions/send-customer-invite/
├── index.ts          # Main edge function code
├── deno.json         # Deno configuration
└── import_map.json   # Import mappings
```

## Deployment Steps

### Step 1: Deploy the Edge Function

Run this command from your project root:

```bash
supabase functions deploy send-customer-invite
```

### Step 2: Set Environment Variables

Your edge function needs these environment variables (should already be set):

```bash
SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Step 3: Test the Function

Test locally first:

```bash
supabase functions serve send-customer-invite
```

Then test with curl:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-customer-invite' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Test User","email":"test@example.com","phone":"123-456-7890","company":"Test Company"}'
```

### Step 4: Test in Production

After deploying, test with your production URL:

```bash
curl -i --location --request POST 'https://your-project.supabase.co/functions/v1/send-customer-invite' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"name":"Test User","email":"test@example.com","phone":"123-456-7890","company":"Test Company"}'
```

## What the Function Does

1. **Validates Input**: Checks that name and email are provided
2. **Generates Password**: Creates a secure 12-character temporary password
3. **Creates Auth User**: Uses Supabase Admin API to create user account
4. **Creates Profile**: Adds customer profile to profiles table with role='customer'
5. **Returns Credentials**: Sends back username and temporary password

## Function Response

Success response:
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here",
    "username": "email@example.com",
    "tempPassword": "Abc123xyz!@#",
    "message": "Customer account created successfully"
  }
}
```

Error response:
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Integration with Admin Dashboard

The admin dashboard (`admin-dashboard.js`) has been updated to:

1. Call `send-customer-invite` edge function when admin clicks "Add Client"
2. Display a comprehensive onboarding modal with generated credentials
3. Provide options to send welcome email and SMS
4. Show formatted email preview
5. Allow copying credentials to clipboard

## Testing the Complete Flow

1. Log in as admin
2. Click "👤 Invite Customer" button in header
3. Fill in customer details:
   - Name
   - Company
   - Email
   - Phone (optional)
4. Click "Add Client"
5. View the onboarding modal with credentials
6. Optionally send welcome notifications
7. Customer receives email and can log in

## Welcome Email Integration

To enable automatic welcome emails, you need to:

1. Have the `send-email` edge function deployed
2. Configure Resend API key (or your email provider)
3. The welcome email includes:
   - Login credentials
   - Dashboard URL
   - Instructions for first login
   - Password change requirement

## Troubleshooting

### Function Not Found
```bash
# Redeploy the function
supabase functions deploy send-customer-invite
```

### Authentication Errors
- Verify SUPABASE_SERVICE_ROLE_KEY is set correctly
- Check that the function has proper permissions

### User Creation Fails
- Ensure email is valid and not already in use
- Check that profiles table exists with correct schema
- Verify RLS policies allow insertion

### Email Not Sending
- Check that `send-email` edge function is deployed
- Verify email API credentials (Resend)
- Check function logs: `supabase functions logs send-customer-invite`

## Database Requirements

The function requires:

1. **profiles table** with columns:
   - `id` (UUID, primary key, references auth.users)
   - `email` (text)
   - `full_name` (text)
   - `role` (text) - must support 'customer' value
   - `phone` (text, nullable)
   - `company` (text, nullable)

2. **RLS policies** that allow:
   - Service role to insert into profiles
   - Customers to read their own profile

## Security Notes

- ✅ Uses service role key for admin operations
- ✅ Generates cryptographically secure passwords
- ✅ Auto-confirms email (no confirmation required)
- ✅ Requires password change on first login
- ✅ Stores customer role in profile metadata
- ✅ Validates all inputs before processing

## Next Steps

After deploying:

1. Test customer creation flow end-to-end
2. Verify welcome emails are sending
3. Test customer login with generated credentials
4. Ensure customers can access their dashboard
5. Monitor function logs for any errors

## Related Documentation

- [ADMIN_WORKFLOW_GUIDE.md](./ADMIN_WORKFLOW_GUIDE.md) - Complete admin workflow
- [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) - Admin setup instructions
- [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) - Supabase configuration

## Function Logs

View logs:
```bash
supabase functions logs send-customer-invite
```

Follow logs in real-time:
```bash
supabase functions logs send-customer-invite --follow
