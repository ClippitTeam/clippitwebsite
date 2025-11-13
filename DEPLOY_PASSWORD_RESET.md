# Deploy Password Reset Edge Function

This guide will walk you through deploying the password reset Edge Function to Supabase.

## Prerequisites

- Supabase CLI installed
- Supabase project set up
- MS Graph credentials configured in Supabase

## Step 1: Install Supabase CLI

If you haven't already, install the Supabase CLI:

```bash
npm install -g supabase
```

## Step 2: Login to Supabase

```bash
supabase login
```

This will open a browser window for you to authenticate.

## Step 3: Link Your Project

```bash
supabase link --project-ref ehaznoklcisgckglkjot
```

## Step 4: Deploy the Password Reset Function

```bash
supabase functions deploy send-password-reset
```

## Step 5: Verify Environment Variables

Make sure these environment variables are set in your Supabase project dashboard:

1. Go to: https://supabase.com/dashboard/project/ehaznoklcisgckglkjot/settings/functions
2. Click on "Manage secrets"
3. Verify these secrets exist:
   - `MSGRAPH_TENANT_ID`
   - `MSGRAPH_CLIENT_ID`
   - `MSGRAPH_CLIENT_SECRET`
   - `SENDER_EMAIL` (should be: admin@clippit.today)

## Step 6: Test the Function

After deployment, you can test it:

```bash
supabase functions invoke send-password-reset --data '{"email":"test@example.com"}'
```

Or test from the live website:
1. Go to: https://clippitteam.github.io/clippitwebsite/login.html
2. Click "Forgot password?"
3. Enter an email address
4. Check if the email arrives from admin@clippit.today

## Function URL

Once deployed, the function will be available at:
```
https://ehaznoklcisgckglkjot.supabase.co/functions/v1/send-password-reset
```

## Troubleshooting

### Function Not Found
- Make sure you've deployed the function: `supabase functions deploy send-password-reset`
- Check the function name matches in both the deployment and the login.html code

### Email Not Sending
- Check Supabase logs: `supabase functions logs send-password-reset`
- Verify MS Graph credentials are correct in Supabase dashboard
- Check that SENDER_EMAIL is set to: admin@clippit.today

### Authentication Errors
- Make sure the function URL in login.html matches your Supabase project
- Verify the API key is correct in supabase-config.js

## Viewing Logs

To view function logs:
```bash
supabase functions logs send-password-reset --tail
```

Or view them in the Supabase dashboard:
https://supabase.com/dashboard/project/ehaznoklcisgckglkjot/functions/send-password-reset/logs

## Alternative: Deploy via Supabase Dashboard

You can also deploy via the dashboard:
1. Go to: https://supabase.com/dashboard/project/ehaznoklcisgckglkjot/functions
2. Click "Create Function"
3. Name it: `send-password-reset`
4. Copy the contents of `supabase/functions/send-password-reset/index.ts`
5. Click "Deploy"

## Next Steps

After deploying:
1. Test the password reset flow end-to-end
2. Monitor the function logs for any errors
3. Verify emails are being sent from admin@clippit.today
4. Test with actual user accounts

## Security Notes

- The function includes rate limiting (max 3 requests per hour per email)
- User existence is not revealed for security (same message regardless)
- Reset links expire after 1 hour
- MS Graph uses OAuth 2.0 for secure authentication
