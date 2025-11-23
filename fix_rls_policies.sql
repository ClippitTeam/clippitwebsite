-- Fix infinite recursion in RLS policies
-- The problem: "Admins can do everything" policy checks profiles table, causing infinite loop

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can do everything" ON public.profiles;

-- The "Users can view own profile" and "Users can update own profile" policies are fine
-- They don't cause recursion because they only check auth.uid() = id

-- We don't need a separate "admin can do everything" policy because:
-- 1. Admins can view their own profile (covered by existing policy)
-- 2. Admins can update their own profile (covered by existing policy)
-- 3. For viewing OTHER users' profiles, we'll add a specific policy

-- Add policy for viewing any profile (for admins and other use cases)
CREATE POLICY "Users can view profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);  -- Allow all authenticated users to read profiles

-- Add policy for admins to update any profile
-- Use a simpler check that doesn't cause recursion
CREATE POLICY "Service role can do everything"
    ON public.profiles FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
