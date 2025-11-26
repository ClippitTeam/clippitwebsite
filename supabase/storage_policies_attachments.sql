-- Storage Policies for Attachments Bucket
-- Copy and paste this entire file into Supabase Dashboard > Storage > attachments bucket > Policies

-- ============================================
-- POLICY 1: Allow authenticated users to upload files
-- ============================================
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'attachments'
);

-- ============================================
-- POLICY 2: Allow users to read authorized files
-- ============================================
CREATE POLICY "Users can read authorized files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (
    -- Admin can read all files
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Staff/customers can read files they're authorized for
    EXISTS (
      SELECT 1 FROM attachments
      WHERE attachments.file_path = name
      AND (
        -- File uploader can read their own files
        attachments.uploaded_by = auth.uid()
        OR
        -- Project attachment authorization
        (
          attachments.project_id IS NOT NULL 
          AND EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = attachments.project_id
            AND (
              -- Customer can read their project files
              projects.customer_id = auth.uid()
              OR
              -- Staff can read company project files
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'staff')
              )
            )
          )
        )
        OR
        -- Ticket attachment authorization
        (
          attachments.ticket_id IS NOT NULL 
          AND EXISTS (
            SELECT 1 FROM tickets t
            JOIN projects p ON t.project_id = p.id
            WHERE t.id = attachments.ticket_id
            AND (
              -- Customer can read their ticket files
              p.customer_id = auth.uid()
              OR
              -- Staff can read company ticket files
              EXISTS (
                SELECT 1 FROM profiles
                WHERE profiles.id = auth.uid()
                AND profiles.role IN ('admin', 'staff')
              )
            )
          )
        )
      )
    )
  )
);

-- ============================================
-- POLICY 3: Allow users to delete authorized files
-- ============================================
CREATE POLICY "Users can delete authorized files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (
    -- Admin can delete all files
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Users can delete their own uploaded files
    EXISTS (
      SELECT 1 FROM attachments
      WHERE attachments.file_path = name
      AND attachments.uploaded_by = auth.uid()
    )
  )
);

-- ============================================
-- POLICY 4: Allow users to update file metadata (optional)
-- ============================================
CREATE POLICY "Users can update authorized file metadata"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'attachments' AND
  (
    -- Admin can update all
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
    OR
    -- Users can update their own uploads
    EXISTS (
      SELECT 1 FROM attachments
      WHERE attachments.file_path = name
      AND attachments.uploaded_by = auth.uid()
    )
  )
);
