# 🔐 Creating Your First Admin User

Since you now have Supabase authentication, you need to create your first admin user account.

## Method 1: Using Supabase Dashboard (Recommended)

### Step 1: Create the User in Supabase Auth

1. **Go to:** Your Supabase Dashboard
2. **Click:** Authentication → Users (in left sidebar)
3. **Click:** "Add user" button (top right)
4. **Fill in:**
   - Email: your-email@example.com
   - Password: Choose a strong password (minimum 6 characters)
   - Auto Confirm User: ✅ Check this box (important!)
5. **Click:** "Create User"
6. **Copy the User ID** that appears (looks like: `abc123-def456-...`)

### Step 2: Create Admin Profile

1. **Go to:** Table Editor → profiles (in left sidebar)
2. **Click:** "Insert" → "Insert row"
3. **Fill in:**
   - id: Paste the User ID you copied above
   - email: Same email as step 1
   - full_name: Your Name
   - role: `admin` (exactly, lowercase)
   - phone: Your phone number (optional)
   - company_name: Your company (optional)
4. **Click:** "Save"

✅ **Done!** You can now login as admin!

---

## Method 2: Using SQL (Alternative)

If you prefer SQL, you can do both steps at once:

1. **Go to:** SQL Editor
2. **Run this query** (replace with your info):

```sql
-- Create auth user and profile in one go
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Insert into auth.users (Supabase internal table)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'your-email@example.com',  -- ← CHANGE THIS
    crypt('your-password-here', gen_salt('bf')),  -- ← CHANGE THIS
    NOW(),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) RETURNING id INTO new_user_id;

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    company_name
  ) VALUES (
    new_user_id,
    'your-email@example.com',  -- ← CHANGE THIS
    'Your Name',  -- ← CHANGE THIS
    'admin',
    '+1234567890',  -- ← CHANGE THIS (optional)
    'Your Company'  -- ← CHANGE THIS (optional)
  );
END $$;
```

⚠️ **Note:** This method is more complex. Method 1 is recommended for most users.

---

## Method 3: Sign Up Page (Future Enhancement)

Eventually, you might want to create a registration page where new users can sign up. When they do, your code would:

1. Call `supabase.auth.signUp()` to create the auth user
2. Create a profile entry with their chosen role
3. Send them a confirmation email

For now, manually creating users through the dashboard is the safest approach.

---

## 🔐 Test Your Admin Login

1. **Open:** `login.html` in your browser
2. **Click:** Admin Login
3. **Enter:** Your email and password
4. **Click:** Sign In
5. **You should be redirected to:** `admin-dashboard.html`

---

## 📝 Creating Additional Users

### For Team Members:
When you add a team member through the admin dashboard, the system will now:
1. Create a Supabase auth user automatically
2. Create their profile with role = 'team'
3. Send them the welcome email with their credentials
4. They can login using Customer Login (since team uses customer dashboard)

### For Customers:
Same process - add them through admin dashboard and they'll receive credentials.

### For Investors:
Same process - they'll use Investor Login portal.

---

## ⚠️ Important Security Notes

1. **Always use strong passwords** for admin accounts
2. **Enable Two-Factor Authentication** in Supabase (Settings → Auth) for extra security
3. **Don't share admin credentials** - create separate accounts for each admin
4. **Regularly review** the Users list in Supabase to check for suspicious accounts

---

## 🆘 Troubleshooting

**Problem:** "User profile not found" error when logging in
- **Solution:** Make sure you created a profile entry in the `profiles` table with the same ID as the auth user

**Problem:** "You do not have admin privileges"
- **Solution:** Check that the profile `role` field is exactly `admin` (lowercase)

**Problem:** Can't login at all
- **Solution:** 
  - Check email/password are correct
  - Verify "Auto Confirm User" was checked when creating the user
  - Check browser console (F12) for detailed error messages

---

## ✅ Next Steps

Once you've created your admin user:
1. Login to the admin dashboard
2. Start adding clients, team members, and projects
3. Everything will now be stored in Supabase database (not localStorage!)
4. Data persists across browsers and devices
5. Multiple people can access the same data simultaneously
