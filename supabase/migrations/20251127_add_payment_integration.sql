-- Payment Integration Schema
-- Adds Stripe and PayPal payment processing capabilities

-- Add payment provider columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS payment_provider TEXT CHECK (payment_provider IN ('stripe', 'paypal', 'bank_transfer', 'credit_card', 'other')),
ADD COLUMN IF NOT EXISTS payment_link TEXT,
ADD COLUMN IF NOT EXISTS payment_link_expires_at TIMESTAMP WITH TIME ZONE;

-- Create payment transactions log for detailed tracking
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
    
    -- Transaction details
    transaction_id TEXT NOT NULL, -- Stripe/PayPal transaction ID
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    amount DECIMAL(12, 2) NOT NULL,
    currency TEXT DEFAULT 'AUD',
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Provider-specific data
    provider_customer_id TEXT, -- Stripe customer ID or PayPal payer ID
    provider_payment_method TEXT, -- card, paypal, etc.
    provider_metadata JSONB, -- Store full provider response
    
    -- Fee information
    platform_fee DECIMAL(12, 2) DEFAULT 0,
    net_amount DECIMAL(12, 2), -- Amount after fees
    
    -- Customer info
    payer_email TEXT,
    payer_name TEXT,
    
    -- Webhook tracking
    webhook_received_at TIMESTAMP WITH TIME ZONE,
    webhook_verified BOOLEAN DEFAULT FALSE,
    
    -- Refund tracking
    refunded_amount DECIMAL(12, 2) DEFAULT 0,
    refund_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for payment transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider ON payment_transactions(provider);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);

-- Enable RLS on payment transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payment_transactions

-- Admins can view all transactions
CREATE POLICY "Admins can view all payment transactions"
    ON payment_transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Customers can view their own invoice transactions
CREATE POLICY "Customers can view own payment transactions"
    ON payment_transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = payment_transactions.invoice_id
            AND invoices.client_id = auth.uid()
        )
    );

-- Admins can insert transactions (for manual recording)
CREATE POLICY "Admins can insert payment transactions"
    ON payment_transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Create payment configuration table for storing API keys (encrypted in production)
CREATE TABLE IF NOT EXISTS payment_configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL CHECK (provider IN ('stripe', 'paypal')),
    environment TEXT NOT NULL CHECK (environment IN ('test', 'live')),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Configuration (store keys as env variables in production!)
    config_data JSONB NOT NULL, -- {publishable_key, webhook_secret, etc}
    
    -- Settings
    currency TEXT DEFAULT 'AUD',
    enable_auto_payment_confirmation BOOLEAN DEFAULT TRUE,
    payment_success_url TEXT,
    payment_cancel_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(provider, environment)
);

-- Only admins can access payment configuration
ALTER TABLE payment_configuration ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage payment config"
    ON payment_configuration
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Function to process webhook and update invoice
CREATE OR REPLACE FUNCTION process_payment_webhook(
    p_transaction_id TEXT,
    p_invoice_id UUID,
    p_provider TEXT,
    p_amount DECIMAL,
    p_status TEXT,
    p_metadata JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_transaction payment_transactions;
    v_invoice invoices;
    result JSONB;
BEGIN
    -- Get or create transaction record
    SELECT * INTO v_transaction
    FROM payment_transactions
    WHERE transaction_id = p_transaction_id;
    
    IF NOT FOUND THEN
        -- Create new transaction
        INSERT INTO payment_transactions (
            invoice_id,
            transaction_id,
            provider,
            amount,
            status,
            provider_metadata,
            webhook_received_at,
            webhook_verified
        ) VALUES (
            p_invoice_id,
            p_transaction_id,
            p_provider,
            p_amount,
            p_status,
            p_metadata,
            NOW(),
            TRUE
        ) RETURNING * INTO v_transaction;
    ELSE
        -- Update existing transaction
        UPDATE payment_transactions
        SET 
            status = p_status,
            provider_metadata = p_metadata,
            webhook_received_at = NOW(),
            webhook_verified = TRUE,
            updated_at = NOW(),
            completed_at = CASE WHEN p_status = 'completed' THEN NOW() ELSE completed_at END
        WHERE id = v_transaction.id;
    END IF;
    
    -- If payment completed, update invoice
    IF p_status = 'completed' THEN
        -- Record payment in invoice_payments table
        INSERT INTO invoice_payments (
            invoice_id,
            amount,
            payment_date,
            payment_method,
            reference_number,
            notes
        ) VALUES (
            p_invoice_id,
            p_amount,
            CURRENT_DATE,
            p_provider,
            p_transaction_id,
            'Automatic payment via ' || p_provider
        ) ON CONFLICT DO NOTHING;
        
        -- Update invoice
        UPDATE invoices
        SET
            status = CASE 
                WHEN (amount_paid + p_amount) >= total_amount THEN 'paid'
                ELSE status
            END,
            payment_provider = p_provider,
            paid_at = CASE 
                WHEN (amount_paid + p_amount) >= total_amount THEN NOW()
                ELSE paid_at
            END,
            updated_at = NOW()
        WHERE id = p_invoice_id
        RETURNING * INTO v_invoice;
        
        result := jsonb_build_object(
            'success', TRUE,
            'message', 'Payment processed successfully',
            'invoice_status', v_invoice.status,
            'transaction_id', v_transaction.id
        );
    ELSE
        result := jsonb_build_object(
            'success', TRUE,
            'message', 'Webhook processed, payment status: ' || p_status,
            'transaction_id', v_transaction.id
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create payment link for invoice
CREATE OR REPLACE FUNCTION create_payment_link(
    p_invoice_id UUID,
    p_provider TEXT,
    p_link TEXT,
    p_expires_hours INTEGER DEFAULT 72
)
RETURNS VOID AS $$
BEGIN
    UPDATE invoices
    SET 
        payment_link = p_link,
        payment_provider = p_provider,
        payment_link_expires_at = NOW() + (p_expires_hours || ' hours')::INTERVAL,
        updated_at = NOW()
    WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if payment link is valid
CREATE OR REPLACE FUNCTION is_payment_link_valid(p_invoice_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT payment_link_expires_at INTO v_expires_at
    FROM invoices
    WHERE id = p_invoice_id;
    
    RETURN v_expires_at IS NULL OR v_expires_at > NOW();
END;
$$ LANGUAGE plpgsql;

-- Trigger to update payment_transactions updated_at
CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create view for payment analytics
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
    DATE_TRUNC('day', pt.created_at) as payment_date,
    pt.provider,
    pt.status,
    COUNT(*) as transaction_count,
    SUM(pt.amount) as total_amount,
    SUM(pt.platform_fee) as total_fees,
    SUM(pt.net_amount) as total_net_amount,
    AVG(pt.amount) as avg_transaction_amount
FROM payment_transactions pt
GROUP BY DATE_TRUNC('day', pt.created_at), pt.provider, pt.status;

-- Grant permissions
GRANT SELECT ON payment_analytics TO authenticated;

-- Comments for documentation
COMMENT ON TABLE payment_transactions IS 'Tracks all payment transactions from Stripe and PayPal';
COMMENT ON FUNCTION process_payment_webhook IS 'Processes payment webhooks and updates invoice status automatically';
COMMENT ON FUNCTION create_payment_link IS 'Stores payment link for an invoice with expiration';
COMMENT ON VIEW payment_analytics IS 'Provides payment analytics grouped by date, provider, and status';
