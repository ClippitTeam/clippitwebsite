-- Investor Listings Schema
-- Allows clients to submit their projects for investment opportunities

-- Main investor listings table
CREATE TABLE IF NOT EXISTS public.investor_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    project_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('app', 'website', 'software', 'company')),
    investment_type TEXT NOT NULL CHECK (investment_type IN ('equity', 'buyout', 'partnership', 'acquisition')),
    seeking_amount DECIMAL(15, 2) NOT NULL,
    valuation DECIMAL(15, 2),
    overview TEXT NOT NULL,
    use_of_funds TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'needs_revision', 'paused')),
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    offers INTEGER DEFAULT 0,
    admin_notes TEXT,
    rejection_reason TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listing assets (images, pitch decks, videos)
CREATE TABLE IF NOT EXISTS public.listing_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.investor_listings(id) ON DELETE CASCADE NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'pitch_deck', 'video')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    display_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification documents
CREATE TABLE IF NOT EXISTS public.listing_verification_docs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.investor_listings(id) ON DELETE CASCADE NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('id', 'business_registration')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investor inquiries (tracked for analytics)
CREATE TABLE IF NOT EXISTS public.listing_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES public.investor_listings(id) ON DELETE CASCADE NOT NULL,
    investor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('question', 'offer', 'request_details')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'closed')),
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_investor_listings_user_id ON public.investor_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_listings_status ON public.investor_listings(status);
CREATE INDEX IF NOT EXISTS idx_investor_listings_category ON public.investor_listings(category);
CREATE INDEX IF NOT EXISTS idx_listing_assets_listing_id ON public.listing_assets(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_verification_docs_listing_id ON public.listing_verification_docs(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_listing_id ON public.listing_inquiries(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_inquiries_investor_id ON public.listing_inquiries(investor_id);

-- Enable Row Level Security
ALTER TABLE public.investor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_verification_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investor_listings

-- Users can view their own listings
CREATE POLICY "Users can view own listings"
    ON public.investor_listings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own listings
CREATE POLICY "Users can create listings"
    ON public.investor_listings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings (only if not approved)
CREATE POLICY "Users can update own pending listings"
    ON public.investor_listings
    FOR UPDATE
    USING (auth.uid() = user_id AND status IN ('pending', 'needs_revision'));

-- Admins can view all listings
CREATE POLICY "Admins can view all listings"
    ON public.investor_listings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Admins can update any listing
CREATE POLICY "Admins can update listings"
    ON public.investor_listings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Investors can view approved listings
CREATE POLICY "Investors can view approved listings"
    ON public.investor_listings
    FOR SELECT
    USING (
        status = 'approved' AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'investor'
        )
    );

-- RLS Policies for listing_assets

-- Users can view assets of their own listings
CREATE POLICY "Users can view own listing assets"
    ON public.listing_assets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_listings
            WHERE id = listing_id AND user_id = auth.uid()
        )
    );

-- Users can insert assets to their own listings
CREATE POLICY "Users can add assets to own listings"
    ON public.listing_assets
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.investor_listings
            WHERE id = listing_id AND user_id = auth.uid()
        )
    );

-- Users can delete assets from their own listings
CREATE POLICY "Users can delete own listing assets"
    ON public.listing_assets
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_listings
            WHERE id = listing_id AND user_id = auth.uid()
        )
    );

-- Admins can view all assets
CREATE POLICY "Admins can view all assets"
    ON public.listing_assets
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Investors can view assets of approved listings
CREATE POLICY "Investors can view approved listing assets"
    ON public.listing_assets
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_listings il
            INNER JOIN public.profiles p ON p.id = auth.uid()
            WHERE il.id = listing_id AND il.status = 'approved' AND p.role = 'investor'
        )
    );

-- RLS Policies for listing_verification_docs

-- Users can view their own verification docs
CREATE POLICY "Users can view own verification docs"
    ON public.listing_verification_docs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_listings
            WHERE id = listing_id AND user_id = auth.uid()
        )
    );

-- Users can insert their own verification docs
CREATE POLICY "Users can add verification docs"
    ON public.listing_verification_docs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.investor_listings
            WHERE id = listing_id AND user_id = auth.uid()
        )
    );

-- Admins can view and manage all verification docs
CREATE POLICY "Admins can manage verification docs"
    ON public.listing_verification_docs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- RLS Policies for listing_inquiries

-- Investors can create inquiries
CREATE POLICY "Investors can create inquiries"
    ON public.listing_inquiries
    FOR INSERT
    WITH CHECK (
        auth.uid() = investor_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'investor'
        )
    );

-- Investors can view their own inquiries
CREATE POLICY "Investors can view own inquiries"
    ON public.listing_inquiries
    FOR SELECT
    USING (auth.uid() = investor_id);

-- Listing owners can view inquiries on their listings
CREATE POLICY "Listing owners can view inquiries"
    ON public.listing_inquiries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_listings
            WHERE id = listing_id AND user_id = auth.uid()
        )
    );

-- Admins can view and manage all inquiries
CREATE POLICY "Admins can manage inquiries"
    ON public.listing_inquiries
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'staff')
        )
    );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_investor_listing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_investor_listing_timestamp
    BEFORE UPDATE ON public.investor_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_investor_listing_updated_at();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_listing_views(listing_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE public.investor_listings
    SET views = views + 1
    WHERE id = listing_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get listings for a user
CREATE OR REPLACE FUNCTION get_user_listings(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    project_name TEXT,
    category TEXT,
    investment_type TEXT,
    seeking_amount DECIMAL,
    valuation DECIMAL,
    overview TEXT,
    use_of_funds TEXT,
    status TEXT,
    views INTEGER,
    inquiries INTEGER,
    offers INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        il.id,
        il.project_name,
        il.category,
        il.investment_type,
        il.seeking_amount,
        il.valuation,
        il.overview,
        il.use_of_funds,
        il.status,
        il.views,
        il.inquiries,
        il.offers,
        il.submitted_at,
        il.approved_at,
        il.created_at
    FROM public.investor_listings il
    WHERE il.user_id = user_uuid
    ORDER BY il.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.investor_listings TO authenticated;
GRANT ALL ON public.listing_assets TO authenticated;
GRANT ALL ON public.listing_verification_docs TO authenticated;
GRANT ALL ON public.listing_inquiries TO authenticated;

-- Comments for documentation
COMMENT ON TABLE public.investor_listings IS 'Stores investment opportunity listings created by clients';
COMMENT ON TABLE public.listing_assets IS 'Stores assets (images, videos, pitch decks) for investor listings';
COMMENT ON TABLE public.listing_verification_docs IS 'Stores verification documents for listing authenticity';
COMMENT ON TABLE public.listing_inquiries IS 'Tracks investor inquiries and offers on listings';
