-- Invoices System Schema
-- Complete invoice management with line items, payments, and email tracking

-- Main invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Invoice details
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Amounts
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 10.00, -- GST/tax percentage
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  amount_paid DECIMAL(12, 2) DEFAULT 0,
  amount_due DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')),
  
  -- Additional info
  notes TEXT,
  terms TEXT,
  payment_instructions TEXT,
  
  -- Email tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_to_email TEXT,
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  reminder_count INTEGER DEFAULT 0,
  
  -- Payment tracking
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'bank_transfer', 'credit_card', 'paypal', 'stripe', 'other'
  payment_reference TEXT,
  
  -- PDF generation
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  
  -- Item details
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL, -- quantity * unit_price
  
  -- Optional categorization
  category TEXT, -- 'development', 'design', 'consulting', 'hosting', etc.
  
  -- Order
  line_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice payments/transactions
CREATE TABLE IF NOT EXISTS invoice_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  
  -- Payment details
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  
  -- Who recorded it
  recorded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice email log
CREATE TABLE IF NOT EXISTS invoice_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  
  -- Email details
  email_type TEXT NOT NULL CHECK (email_type IN ('initial', 'reminder', 'overdue', 'thank_you', 'other')),
  sent_to TEXT NOT NULL,
  sent_by UUID REFERENCES profiles(id),
  subject TEXT,
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_project_id ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice_id ON invoice_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_emails_invoice_id ON invoice_emails(invoice_id);

-- Row Level Security (RLS)
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_emails ENABLE ROW LEVEL SECURITY;

-- Invoices Policies
-- Admins can manage all invoices
CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Clients can view their own invoices
CREATE POLICY "Clients can view their own invoices" ON invoices
  FOR SELECT
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

-- Invoice Line Items Policies
CREATE POLICY "Users can view line items of accessible invoices" ON invoice_line_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_line_items.invoice_id
      AND (
        invoices.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'staff')
        )
      )
    )
  );

CREATE POLICY "Admins can manage line items" ON invoice_line_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Invoice Payments Policies
CREATE POLICY "Users can view payments of accessible invoices" ON invoice_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM invoices
      WHERE invoices.id = invoice_payments.invoice_id
      AND (
        invoices.client_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM profiles
          WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'staff')
        )
      )
    )
  );

CREATE POLICY "Admins can manage payments" ON invoice_payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Invoice Emails Policies
CREATE POLICY "Admins can view all email logs" ON invoice_emails
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create email logs" ON invoice_emails
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_subtotal DECIMAL(12, 2);
  invoice_tax_rate DECIMAL(5, 2);
  invoice_tax_amount DECIMAL(12, 2);
  invoice_total DECIMAL(12, 2);
BEGIN
  -- Calculate subtotal from line items
  SELECT COALESCE(SUM(amount), 0)
  INTO invoice_subtotal
  FROM invoice_line_items
  WHERE invoice_id = NEW.invoice_id;
  
  -- Get tax rate from invoice
  SELECT tax_rate INTO invoice_tax_rate
  FROM invoices
  WHERE id = NEW.invoice_id;
  
  -- Calculate tax
  invoice_tax_amount := invoice_subtotal * (invoice_tax_rate / 100);
  invoice_total := invoice_subtotal + invoice_tax_amount;
  
  -- Update invoice totals
  UPDATE invoices
  SET 
    subtotal = invoice_subtotal,
    tax_amount = invoice_tax_amount,
    total_amount = invoice_total,
    amount_due = invoice_total - COALESCE(amount_paid, 0),
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to recalculate totals when line items change
CREATE TRIGGER recalculate_invoice_totals_on_insert
  AFTER INSERT ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER recalculate_invoice_totals_on_update
  AFTER UPDATE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

CREATE TRIGGER recalculate_invoice_totals_on_delete
  AFTER DELETE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();

-- Function to update amount paid when payments are recorded
CREATE OR REPLACE FUNCTION update_invoice_amount_paid()
RETURNS TRIGGER AS $$
DECLARE
  total_paid DECIMAL(12, 2);
BEGIN
  -- Calculate total payments
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM invoice_payments
  WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  -- Update invoice
  UPDATE invoices
  SET 
    amount_paid = total_paid,
    amount_due = total_amount - total_paid,
    status = CASE 
      WHEN total_paid >= total_amount THEN 'paid'
      WHEN total_paid > 0 AND total_paid < total_amount THEN 'sent'
      ELSE status
    END,
    paid_at = CASE 
      WHEN total_paid >= total_amount AND paid_at IS NULL THEN NOW()
      ELSE paid_at
    END,
    updated_at = NOW()
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to update amount paid when payments change
CREATE TRIGGER update_invoice_paid_on_insert
  AFTER INSERT ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_amount_paid();

CREATE TRIGGER update_invoice_paid_on_update
  AFTER UPDATE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_amount_paid();

CREATE TRIGGER update_invoice_paid_on_delete
  AFTER DELETE ON invoice_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_amount_paid();

-- Function to auto-update invoice status based on due date
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'overdue'
  WHERE status IN ('sent', 'draft')
  AND due_date < CURRENT_DATE
  AND amount_due > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_suffix TEXT;
  counter INTEGER;
BEGIN
  -- Get current year last 2 digits
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get count of invoices this year
  SELECT COUNT(*) + 1 INTO counter
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_suffix || '%';
  
  -- Format: INV-YY-0001
  new_number := 'INV-' || year_suffix || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create a view for invoice summary (useful for reports)
CREATE OR REPLACE VIEW invoice_summary AS
SELECT 
  i.id,
  i.invoice_number,
  i.status,
  i.issue_date,
  i.due_date,
  i.total_amount,
  i.amount_paid,
  i.amount_due,
  p.full_name as client_name,
  p.email as client_email,
  p.company as client_company,
  proj.name as project_name,
  CASE 
    WHEN i.status = 'paid' THEN 0
    WHEN i.due_date < CURRENT_DATE AND i.status IN ('sent', 'draft') THEN 
      CURRENT_DATE - i.due_date
    ELSE 0
  END as days_overdue,
  (SELECT COUNT(*) FROM invoice_line_items WHERE invoice_id = i.id) as line_item_count,
  (SELECT COUNT(*) FROM invoice_payments WHERE invoice_id = i.id) as payment_count,
  i.created_at
FROM invoices i
LEFT JOIN profiles p ON i.client_id = p.id
LEFT JOIN projects proj ON i.project_id = proj.id;
