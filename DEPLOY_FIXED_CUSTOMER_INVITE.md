# Deploy Fixed Customer Invite Function

## What Was Fixed

The customer invite function now handles two scenarios:

1. ✅ **New Customers**: Creates auth user + profile
2. ✅ **Existing Users**: Updates profile + resets password (avoids duplicate key error)

## Required Steps

### Step 1: Add Company Column to Database

Run this SQL in Supabase SQL Editor:

```sql
-- Add company column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);

-- Add documentation
COMMENT ON COLUMN profiles.company IS 'Company name for customer/client users';
```

**How to run:**
1. Go to Supabase Dashboard → SQL Editor
2. Click "+ New query"
3. Paste the SQL above
4. Click "Run"

### Step 2: Deploy the Updated Edge Function

```bash
supabase functions deploy send-customer-invite
```

Or manually in Supabase Dashboard:
1. Go to **Edge Functions**
2. Find `send-customer-invite`
3. Click **Edit**
4. Replace with code from `supabase/functions/send-customer-invite/index.ts`
5. Click **Deploy**

### Step 3: Test the Function

Now test creating a customer:

1. Log in as admin
2. Click "👤 Invite Customer"
3. Fill in form:
   - Name: Test User
   - Company: Test Company
   - Email: test@example.com
4. Click "Add Client"

**Expected result:**
✅ Success modal with credentials!

## What The Fix Does

### Before (Broken):
```
1. Create auth user ✅
2. Try to create profile ❌ (duplicate key error)
3. Cleanup fails partially
4. Second attempt fails: "user already exists"
```

### After (Fixed):
```
1. Check if user exists
2a. If NEW:
   - Create auth user
   - Create profile
   - Return credentials
2b. If EXISTS:
   - Update profile
   - Reset password
   - Return new credentials
```

## Testing Scenarios

### Scenario 1: Brand New Customer
```javascript
{
  "name": "John Smith",
  "email": "john@acmecorp.com",
  "phone": "555-0100",
  "company": "Acme Corp"
}
```
**Expected:** ✅ New user created + profile created

### Scenario 2: Existing User (from previous failed attempts)
```javascript
{
  "name": "John Smith",
  "email": "john@acmecorp.com",  // Same email as before
  "phone": "555-0101",
  "company": "Updated Corp"
}
```
**Expected:** ✅ Profile updated + new password generated

### Scenario 3: Minimal Info
```javascript
{
  "name": "Jane Doe",
  "email": "jane@example.com"
  // phone and company are optional
}
```
**Expected:** ✅ User created with null phone/company

## Verify in Database

Check the customer was created:

```sql
SELECT 
  id,
  email,
  full_name,
  role,
  company,
  phone,
  created_at
FROM profiles
WHERE email = 'test@example.com';
```

## Troubleshooting

### Still Getting Errors?

**Check Function Logs:**
```bash
supabase functions logs send-customer-invite --follow
```

Or in Dashboard:
Edge Functions → send-customer-invite → Logs

### Common Issues:

1. **"Could not find 'company' column"**
   - ❌ Migration not run yet
   - ✅ Run Step 1 SQL

2. **"Duplicate key error"**
   - ❌ Old function version still deployed
   - ✅ Redeploy function (Step 2)

3. **"Service role key not found"**
   - ❌ Environment variables not set
   - ✅ Check: `supabase secrets list`

4. **"Failed to update profile"**
   - ❌ RLS policies blocking update
   - ✅ Check profiles table RLS policies

## Clean Up Failed Test Users (Optional)

If you have leftover test users from failed attempts:

```sql
-- Find test users
SELECT id, email FROM auth.users WHERE email LIKE '%test%';

-- Delete a specific user (replace UUID)
DELETE FROM profiles WHERE id = 'user-uuid-here';
-- Auth user will be auto-deleted due to cascade
```

## Success Checklist

After following all steps:

- ✅ Company column added to database
- ✅ Updated function deployed
- ✅ Test customer created successfully
- ✅ Credentials displayed in modal
- ✅ Customer can log in with generated password
- ✅ Customer sees their dashboard

## Next Steps

Once working:

1. 📧 **Configure Email**: Set up welcome email notifications
2. 📱 **Test Login**: Verify customer can access dashboard
3. 🔐 **Password Change**: Ensure customer is prompted to change password
4. 👥 **Create Real Customers**: Start onboarding actual clients

## Related Files

- Edge Function: `supabase/functions/send-customer-invite/index.ts`
- Migration: `supabase/migrations/20251123_add_company_to_profiles.sql`
- Error Fix Guide: `FIX_CUSTOMER_INVITE_ERROR.md`
- Deployment Guide: `DEPLOY_CUSTOMER_INVITE.md`

## Support

If you encounter any issues:

1. Check function logs for detailed errors
2. Verify database migration was applied
3. Ensure service role key is configured
4. Review RLS policies on profiles table

The customer invitation system should now work perfectly! 🎉
