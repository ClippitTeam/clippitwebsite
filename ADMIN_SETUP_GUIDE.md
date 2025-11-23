# Admin User Setup Guide

## The Issue You're Experiencing

The error `relation "public.profiles" does not exist` means the `profiles` table hasn't been created yet. You need to run the migration FIRST, then insert the admin user.

## Correct Setup Order

### Step 1: Create the Database Tables

In the Supabase SQL Editor:

1. Click the **+ icon** to create a new query
2. Paste this ENTIRE migration:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL CHECK (role IN ('customer', 'investor', 'admin')),
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Admin can do everything
CREATE POLICY "Admins can do everything"
    ON public.profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
        NEW.raw_user_meta_data->>'full_name'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
```

3. Click **RUN** at the bottom
4. Wait for "Success. No rows returned"

### Step 2: Create Your Admin User

**IMPORTANT:** Before running this, make sure you've already signed up with this email in your app!

1. Create a **NEW query** (click the + icon again)
2. Paste this query, **replacing `your-email@example.com` with YOUR actual email**:

```sql
-- Insert admin profile for existing user
INSERT INTO public.profiles (id, email, role, full_name)
SELECT 
    id,
    'your-email@example.com',  -- CHANGE THIS TO YOUR EMAIL
    'admin',
    'Admin User'
FROM auth.users
WHERE email = 'your-email@example.com'  -- CHANGE THIS TO YOUR EMAIL
ON CONFLICT (id) DO UPDATE
SET role = 'admin';
```

3. Click **RUN**
4. You should see "Success. 1 rows affected"

### Step 3: Verify It Worked

Run this query to verify:

```sql
SELECT email, role, full_name FROM public.profiles WHERE role = 'admin';
```

You should see your email with role = 'admin'

## Troubleshooting

### Error: "relation profiles does not exist"
- **Solution:** You need to run Step 1 first to create the table

### Error: "no rows returned" or "0 rows affected"
- **Cause:** The email doesn't exist in `auth.users`
- **Solution:** 
  1. Sign up in your app first with that email
  2. Then run the INSERT query again

### Error: "duplicate key value violates unique constraint"
- **Cause:** Profile already exists for this user
- **Solution:** Use this UPDATE query instead:

```sql
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Quick Verification Queries

Check all users:
```sql
SELECT email FROM auth.users;
```

Check all profiles:
```sql
SELECT email, role FROM public.profiles;
```

Check admin users:
```sql
SELECT email, role FROM public.profiles WHERE role = 'admin';
```

## Next Steps After Setup

1. Log out of your app
2. Log back in with your admin email
3. Navigate to the admin dashboard
4. You should now have full admin access

## Need Help?

If you're still having issues:
1. Check which step you're on
2. Copy the exact error message you're seeing
3. Check if you've signed up with the email you're using
