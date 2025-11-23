# Fix for Duplicate Profile Error

## Problem
Error was occurring: `duplicate key value violates unique constraint "profiles_pkey"`

## Root Cause
**Your secrets are configured correctly!** The issue was NOT with your secrets.

The problem was a race condition:
1. Supabase has an automatic database trigger that creates a profile entry when a new auth user is created
2. The Edge Function was also trying to manually INSERT the profile
3. This caused a duplicate key constraint violation

## Solution Applied
Changed the Edge Function to:
1. Let the automatic trigger create the basic profile
2. Wait 100ms for the trigger to complete
3. UPDATE the profile with additional customer details instead of trying to INSERT

## Deploy the Fix

### Step 1: Deploy the Updated Edge Function
```bash
supabase functions deploy send-customer-invite
```

### Step 2: Verify the Fix
1. Go to your admin dashboard
2. Try adding a new customer
3. The profile should be created without errors

## What Changed
In `supabase/functions/send-customer-invite/index.ts`:
- **Before**: Used `.insert()` to create profile → caused duplicate key error
- **After**: Uses `.update()` after letting the trigger create the profile → no more errors

## Summary
✅ Your secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, etc.) are all correct
✅ The issue was in the Edge Function logic, not configuration
✅ The fix allows Supabase's automatic profile creation to work properly
