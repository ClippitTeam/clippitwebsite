-- Add company column to profiles table for customer/client information
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company TEXT;

-- Add index for company lookups
CREATE INDEX IF NOT EXISTS idx_profiles_company ON profiles(company);

-- Update the profiles table comment
COMMENT ON COLUMN profiles.company IS 'Company name for customer/client users';
