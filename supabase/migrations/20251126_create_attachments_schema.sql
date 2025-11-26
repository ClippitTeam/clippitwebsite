-- Create attachments table for projects and tickets
CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Reference to what this is attached to
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    
    -- File information
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_size BIGINT NOT NULL, -- Size in bytes
    file_type TEXT NOT NULL, -- MIME type
    
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_parent CHECK (
        (project_id IS NOT NULL AND ticket_id IS NULL) OR
        (project_id IS NULL AND ticket_id IS NOT NULL)
    )
);

-- Add indexes for performance
CREATE INDEX idx_attachments_project_id ON attachments(project_id);
CREATE INDEX idx_attachments_ticket_id ON attachments(ticket_id);
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);
CREATE INDEX idx_attachments_created_at ON attachments(created_at DESC);

-- Enable RLS
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for attachments

-- Admin can see all attachments
CREATE POLICY "Admins can view all attachments"
    ON attachments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Staff can see attachments for their company's projects/tickets
CREATE POLICY "Staff can view company attachments"
    ON attachments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'staff'
            AND (
                -- Project attachments
                (attachments.project_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM projects
                    WHERE projects.id = attachments.project_id
                ))
                OR
                -- Ticket attachments
                (attachments.ticket_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM tickets
                    WHERE tickets.id = attachments.ticket_id
                ))
            )
        )
    );

-- Customers can see attachments for their projects/tickets
CREATE POLICY "Customers can view their attachments"
    ON attachments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'customer'
            AND (
                -- Project attachments
                (attachments.project_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM projects
                    WHERE projects.id = attachments.project_id
                    AND projects.customer_id = auth.uid()
                ))
                OR
                -- Ticket attachments  
                (attachments.ticket_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM tickets t
                    JOIN projects p ON t.project_id = p.id
                    WHERE t.id = attachments.ticket_id
                    AND p.customer_id = auth.uid()
                ))
            )
        )
    );

-- Admin and staff can insert attachments
CREATE POLICY "Admin and staff can upload attachments"
    ON attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Customers can upload attachments to their own projects/tickets
CREATE POLICY "Customers can upload to their items"
    ON attachments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'customer'
            AND (
                -- Project attachments
                (attachments.project_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM projects
                    WHERE projects.id = attachments.project_id
                    AND projects.customer_id = auth.uid()
                ))
                OR
                -- Ticket attachments
                (attachments.ticket_id IS NOT NULL AND EXISTS (
                    SELECT 1 FROM tickets t
                    JOIN projects p ON t.project_id = p.id
                    WHERE t.id = attachments.ticket_id
                    AND p.customer_id = auth.uid()
                ))
            )
        )
    );

-- Admin can delete any attachment
CREATE POLICY "Admins can delete attachments"
    ON attachments FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Staff and customers can delete their own uploads
CREATE POLICY "Users can delete own attachments"
    ON attachments FOR DELETE
    TO authenticated
    USING (uploaded_by = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attachments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_attachments_timestamp
    BEFORE UPDATE ON attachments
    FOR EACH ROW
    EXECUTE FUNCTION update_attachments_updated_at();

-- Create storage bucket for attachments (run this in Supabase Dashboard > Storage)
-- Bucket name: 'attachments'
-- Public: false
-- File size limit: 50MB
-- Allowed MIME types: All (or specify: image/*, application/pdf, etc.)

COMMENT ON TABLE attachments IS 'File attachments for projects and tickets';
COMMENT ON COLUMN attachments.file_path IS 'Path in Supabase Storage bucket';
COMMENT ON COLUMN attachments.file_size IS 'File size in bytes';
COMMENT ON COLUMN attachments.file_type IS 'MIME type of the file';
