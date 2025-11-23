# Fix Customer Invite Error - Missing 'company' Column

## Error Description

When testing the customer invite function, you encountered this error:

```
Profile creation error: {
  code: "PGRST204",
  details: null,
  hint: null,
  message: "Could not find the 'company' column of 'profiles' in the schema cache"
}
```

## Root Cause

The `profiles` table in your database is missing the `company` column that the customer invite function tries to populate.

## Solution

### Step 1: Deploy the Database Migration

A migration file has been created at `supabase/migrations/20251123_add_company_to_profiles.sql`

Deploy it using the Supabase CLI:

```bash
# Make sure you're in your project directory
cd /path/to/your/project

# Deploy the migration
supabase db push
```

Or if you prefer to run it manually in Supabase SQL Editor:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy and paste this SQL:

```sql
-- Add company column to profiles table for customer/client information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add index for company lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);

-- Update the profiles table comment
COMMENT ON COLUMN profiles.company IS 'Company name for customer/client users';
```

5. Click **Run** or press `Ctrl+Enter`

### Step 2: Verify the Migration

After running the migration, verify it worked:

```sql
-- Check if company column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'company';
```

You should see:
```
column_name | data_type | is_nullable
------------|-----------|-------------
company     | text      | YES
```

### Step 3: Test the Customer Invite Again

Now try creating a customer again through your admin dashboard:

1. Log in as admin
2. Click "👤 Invite Customer"
3. Fill in the form:
   - Name: Test User
   - Company: Test Company
   - Email: test@example.com
   - Phone: (optional)
4. Click "Add Client"

You should now see the success modal with generated credentials!

## What the Migration Does

The migration adds three things:

1. **company column**: A TEXT column to store the customer's company name
2. **Index**: An index on the company column for faster lookups
3. **Comment**: Documentation of what the column is for

## Why This Happened

The customer invite function was written to accept and store company information, but the database schema wasn't updated to include the `company` column in the `profiles` table. This is now fixed.

## Complete Profiles Table Schema

After the migration, your `profiles` table should have these columns:

```sql
- id (UUID, primary key, references auth.users)
- email (TEXT)
- full_name (TEXT)
- role (TEXT) - 'admin', 'team', 'investor', 'customer'
- phone (TEXT, nullable)
- company (TEXT, nullable) ← NEWLY ADDED
- avatar_url (TEXT, nullable)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Testing Different Scenarios

### Test 1: Customer with Company
```javascript
{
  "name": "John Smith",
  "email": "john@acmecorp.com",
  "phone": "555-0100",
  "company": "Acme Corporation"
}
```

### Test 2: Customer without Company
```javascript
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "555-0200"
  // company is optional
}
```

### Test 3: Minimal Customer
```javascript
{
  "name": "Bob Johnson",
  "email": "bob@example.com"
  // both phone and company are optional
}
```

## Verifying Customers in Database

Check created customers:

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
WHERE role = 'customer'
ORDER BY created_at DESC;
```

## Next Steps

1. ✅ Migration deployed
2. ✅ Column verified
3. ✅ Customer invite tested
4. 📧 Configure welcome email (optional)
5. 📱 Test customer login flow
6. 🔐 Verify customers can access their dashboard

## Troubleshooting

### If Migration Fails

If you get an error like "column already exists":
```sql
-- This is actually fine! The column exists already
-- The migration uses IF NOT EXISTS to prevent errors
```

### If Customer Creation Still Fails

Check these things:

1. **Service Role Key**: Verify it's set correctly in Edge Functions
```bash
supabase secrets list
```

2. **RLS Policies**: Ensure profiles table allows inserts
```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- List policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

3. **Function Logs**: Check for detailed error messages
```bash
supabase functions logs send-customer-invite
```

## Related Files

- Migration: `supabase/migrations/20251123_add_company_to_profiles.sql`
- Edge Function: `supabase/functions/send-customer-invite/index.ts`
- Admin Dashboard: `admin-dashboard.js`
- Deployment Guide: `DEPLOY_CUSTOMER_INVITE.md`

## Success!

After following these steps, you should be able to:
- ✅ Create customer accounts with company information
- ✅ Generate secure temporary passwords
- ✅ View credentials in onboarding modal
- ✅ Send welcome emails (if configured)
- ✅ Allow customers to log in and access their dashboard

The error is now fixed and the customer invitation system should work perfectly!
