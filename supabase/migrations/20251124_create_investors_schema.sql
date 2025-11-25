-- Investors table
CREATE TABLE IF NOT EXISTS investors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  investor_name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('pending', 'active', 'inactive', 'cancelled')),
  subscription_tier TEXT CHECK (subscription_tier IN ('vip-free', 'exclusive-pass')),
  subscription_price DECIMAL(10, 2),
  questions_asked INTEGER DEFAULT 0,
  offers_made INTEGER DEFAULT 0,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invitation_code TEXT UNIQUE,
  invitation_sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  invitation_accepted_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor subscriptions history
CREATE TABLE IF NOT EXISTS investor_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE NOT NULL,
  subscription_tier TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('weekly', 'monthly', 'yearly')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor interactions/activity
CREATE TABLE IF NOT EXISTS investor_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('question', 'offer', 'view', 'download', 'message')),
  related_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investors_user_id ON investors(user_id);
CREATE INDEX IF NOT EXISTS idx_investors_email ON investors(email);
CREATE INDEX IF NOT EXISTS idx_investors_subscription_status ON investors(subscription_status);
CREATE INDEX IF NOT EXISTS idx_investors_joined_date ON investors(joined_date DESC);
CREATE INDEX IF NOT EXISTS idx_investor_subscriptions_investor_id ON investor_subscriptions(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_interactions_investor_id ON investor_interactions(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_interactions_created_at ON investor_interactions(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investor_interactions ENABLE ROW LEVEL SECURITY;

-- Investors policies
-- Admins can view all investors
CREATE POLICY "Admins can view all investors" ON investors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investors can view their own profile
CREATE POLICY "Investors can view own profile" ON investors
  FOR SELECT
  USING (user_id = auth.uid());

-- Admins can insert investors
CREATE POLICY "Admins can insert investors" ON investors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update investors
CREATE POLICY "Admins can update investors" ON investors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investors can update their own profile
CREATE POLICY "Investors can update own profile" ON investors
  FOR UPDATE
  USING (user_id = auth.uid());

-- Admins can delete investors
CREATE POLICY "Admins can delete investors" ON investors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investor subscriptions policies
CREATE POLICY "Admins can view all subscriptions" ON investor_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Investors can view own subscriptions" ON investor_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_subscriptions.investor_id
      AND investors.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage subscriptions" ON investor_subscriptions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investor interactions policies
CREATE POLICY "Admins can view all interactions" ON investor_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Investors can view own interactions" ON investor_interactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_interactions.investor_id
      AND investors.user_id = auth.uid()
    )
  );

CREATE POLICY "Investors can create interactions" ON investor_interactions
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = investor_interactions.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_investors_updated_at ON investors;
CREATE TRIGGER update_investors_updated_at
    BEFORE UPDATE ON investors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment investor interaction counters
CREATE OR REPLACE FUNCTION increment_investor_interaction_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type = 'question' THEN
    UPDATE investors 
    SET questions_asked = questions_asked + 1
    WHERE id = NEW.investor_id;
  ELSIF NEW.interaction_type = 'offer' THEN
    UPDATE investors 
    SET offers_made = offers_made + 1
    WHERE id = NEW.investor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for interaction counter
DROP TRIGGER IF EXISTS increment_interaction_counter ON investor_interactions;
CREATE TRIGGER increment_interaction_counter
  AFTER INSERT ON investor_interactions
  FOR EACH ROW
  EXECUTE FUNCTION increment_investor_interaction_counter();

-- Function to update last_active_at on any interaction
CREATE OR REPLACE FUNCTION update_investor_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE investors 
  SET last_active_at = NOW()
  WHERE id = NEW.investor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for last active update
DROP TRIGGER IF EXISTS update_last_active ON investor_interactions;
CREATE TRIGGER update_last_active
  AFTER INSERT ON investor_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_investor_last_active();
