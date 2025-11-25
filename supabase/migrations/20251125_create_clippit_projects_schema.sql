-- Clippit Own Projects table
CREATE TABLE IF NOT EXISTS clippit_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name TEXT NOT NULL,
  description TEXT NOT NULL,
  detailed_description TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('web-app', 'mobile-app', 'saas', 'ecommerce', 'ai-tool', 'api', 'other')),
  industry TEXT NOT NULL,
  technologies TEXT[], -- Array of technologies used
  development_stage TEXT NOT NULL CHECK (development_stage IN ('concept', 'planning', 'development', 'testing', 'completed', 'live')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  estimated_value DECIMAL(12, 2),
  asking_price DECIMAL(12, 2),
  investment_type TEXT CHECK (investment_type IN ('full-purchase', 'equity-share', 'both')),
  equity_percentage_available INTEGER CHECK (equity_percentage_available >= 0 AND equity_percentage_available <= 100),
  project_url TEXT,
  demo_url TEXT,
  github_repo TEXT,
  features JSONB, -- Array of features/capabilities
  screenshots JSONB, -- Array of screenshot URLs
  documents JSONB, -- Array of document URLs (pitch deck, business plan, etc.)
  team_members TEXT[], -- Array of team member names
  started_date DATE,
  estimated_completion_date DATE,
  published_to_investor_lounge BOOLEAN DEFAULT FALSE,
  published_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'sold', 'archived')),
  views_count INTEGER DEFAULT 0,
  interested_investors_count INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor offers for Clippit projects
CREATE TABLE IF NOT EXISTS clippit_project_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES clippit_projects(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE NOT NULL,
  offer_type TEXT NOT NULL CHECK (offer_type IN ('full-purchase', 'equity-investment')),
  offered_amount DECIMAL(12, 2) NOT NULL,
  equity_percentage_requested INTEGER CHECK (equity_percentage_requested >= 0 AND equity_percentage_requested <= 100),
  message TEXT,
  terms TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'accepted', 'rejected', 'countered', 'withdrawn')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions/inquiries about Clippit projects from investors
CREATE TABLE IF NOT EXISTS clippit_project_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES clippit_projects(id) ON DELETE CASCADE NOT NULL,
  investor_id UUID REFERENCES investors(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  answered_by UUID REFERENCES profiles(id),
  answered_at TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT FALSE, -- Whether to show in public FAQ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project milestones/updates
CREATE TABLE IF NOT EXISTS clippit_project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES clippit_projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  milestone_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clippit_projects_status ON clippit_projects(status);
CREATE INDEX IF NOT EXISTS idx_clippit_projects_published ON clippit_projects(published_to_investor_lounge);
CREATE INDEX IF NOT EXISTS idx_clippit_projects_development_stage ON clippit_projects(development_stage);
CREATE INDEX IF NOT EXISTS idx_clippit_projects_created_at ON clippit_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clippit_project_offers_project_id ON clippit_project_offers(project_id);
CREATE INDEX IF NOT EXISTS idx_clippit_project_offers_investor_id ON clippit_project_offers(investor_id);
CREATE INDEX IF NOT EXISTS idx_clippit_project_offers_status ON clippit_project_offers(status);
CREATE INDEX IF NOT EXISTS idx_clippit_project_inquiries_project_id ON clippit_project_inquiries(project_id);
CREATE INDEX IF NOT EXISTS idx_clippit_project_inquiries_investor_id ON clippit_project_inquiries(investor_id);
CREATE INDEX IF NOT EXISTS idx_clippit_project_milestones_project_id ON clippit_project_milestones(project_id);

-- Row Level Security (RLS) Policies
ALTER TABLE clippit_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE clippit_project_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clippit_project_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE clippit_project_milestones ENABLE ROW LEVEL SECURITY;

-- Clippit Projects Policies
-- Admins can do everything
CREATE POLICY "Admins can manage clippit projects" ON clippit_projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Staff can view clippit projects
CREATE POLICY "Staff can view clippit projects" ON clippit_projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Investors can view published projects
CREATE POLICY "Investors can view published projects" ON clippit_projects
  FOR SELECT
  USING (
    published_to_investor_lounge = TRUE
    AND EXISTS (
      SELECT 1 FROM investors
      WHERE investors.user_id = auth.uid()
    )
  );

-- Project Offers Policies
-- Admins can view all offers
CREATE POLICY "Admins can view all offers" ON clippit_project_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update offers (review, accept, reject)
CREATE POLICY "Admins can update offers" ON clippit_project_offers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investors can create offers
CREATE POLICY "Investors can create offers" ON clippit_project_offers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = clippit_project_offers.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Investors can view their own offers
CREATE POLICY "Investors can view own offers" ON clippit_project_offers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = clippit_project_offers.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Investors can update their own pending offers
CREATE POLICY "Investors can update own pending offers" ON clippit_project_offers
  FOR UPDATE
  USING (
    status = 'pending'
    AND EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = clippit_project_offers.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Project Inquiries Policies
-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries" ON clippit_project_inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can answer inquiries
CREATE POLICY "Admins can answer inquiries" ON clippit_project_inquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investors can create inquiries
CREATE POLICY "Investors can create inquiries" ON clippit_project_inquiries
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = clippit_project_inquiries.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Investors can view their own inquiries
CREATE POLICY "Investors can view own inquiries" ON clippit_project_inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM investors
      WHERE investors.id = clippit_project_inquiries.investor_id
      AND investors.user_id = auth.uid()
    )
  );

-- Investors can view public inquiries for projects they can access
CREATE POLICY "Investors can view public inquiries" ON clippit_project_inquiries
  FOR SELECT
  USING (
    is_public = TRUE
    AND EXISTS (
      SELECT 1 FROM clippit_projects
      WHERE clippit_projects.id = clippit_project_inquiries.project_id
      AND clippit_projects.published_to_investor_lounge = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM investors
      WHERE investors.user_id = auth.uid()
    )
  );

-- Project Milestones Policies
-- Admins can manage milestones
CREATE POLICY "Admins can manage milestones" ON clippit_project_milestones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Investors can view milestones for published projects
CREATE POLICY "Investors can view milestones" ON clippit_project_milestones
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clippit_projects
      WHERE clippit_projects.id = clippit_project_milestones.project_id
      AND clippit_projects.published_to_investor_lounge = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM investors
      WHERE investors.user_id = auth.uid()
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_clippit_projects_updated_at
    BEFORE UPDATE ON clippit_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clippit_project_offers_updated_at
    BEFORE UPDATE ON clippit_project_offers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clippit_project_inquiries_updated_at
    BEFORE UPDATE ON clippit_project_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to increment view count when investors view a project
CREATE OR REPLACE FUNCTION increment_clippit_project_views()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.interaction_type = 'view' AND NEW.related_project_id IS NOT NULL THEN
    UPDATE clippit_projects 
    SET views_count = views_count + 1
    WHERE id = NEW.related_project_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for view counting
CREATE TRIGGER increment_project_views
  AFTER INSERT ON investor_interactions
  FOR EACH ROW
  WHEN (NEW.interaction_type = 'view' AND NEW.related_project_id IS NOT NULL)
  EXECUTE FUNCTION increment_clippit_project_views();

-- Function to update interested investors count
CREATE OR REPLACE FUNCTION update_interested_investors_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE clippit_projects 
    SET interested_investors_count = interested_investors_count + 1
    WHERE id = NEW.project_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE clippit_projects 
    SET interested_investors_count = GREATEST(0, interested_investors_count - 1)
    WHERE id = OLD.project_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for interested investors count
CREATE TRIGGER update_interested_count
  AFTER INSERT OR DELETE ON clippit_project_offers
  FOR EACH ROW
  EXECUTE FUNCTION update_interested_investors_count();
