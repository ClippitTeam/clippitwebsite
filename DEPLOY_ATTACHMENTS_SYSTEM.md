# Deploy Attachments System - Complete Guide

## Overview
This guide walks you through deploying a complete file attachment system for projects and tickets, including:
- File uploads with drag & drop
- Secure file storage using Supabase Storage
- Download and delete functionality
- Real-time updates
- File type icons and metadata

## Step 1: Create Supabase Storage Bucket

### In Supabase Dashboard:

1. **Navigate to Storage**
   - Go to your Supabase project dashboard
   - Click on **Storage** in the left sidebar

2. **Create New Bucket**
   - Click **New Bucket**
   - Bucket name: `attachments`
   - **Public bucket**: ❌ No (Keep it private)
   - **File size limit**: 50MB (or your preference)
   - **Allowed MIME types**: Leave empty to allow all, or specify:
     - `image/*`
     - `application/pdf`
     - `application/msword`
     - `application/vnd.*`
     - `text/*`
     - `application/zip`
   - Click **Create Bucket**

3. **Configure Storage Policies**
   
   Go to **Storage** → **Policies** → Select `attachments` bucket

   **Add these policies:**

   ```sql
   -- Policy 1: Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'attachments');

   -- Policy 2: Allow users to read their company's files
   CREATE POLICY "Users can read authorized files"
   ON storage.objects FOR SELECT
   TO authenticated
   USING (
     bucket_id = 'attachments' AND
     (
       -- Admin can read all
       EXISTS (
         SELECT 1 FROM profiles
         WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
       )
       OR
       -- Staff/customers can read their files
       EXISTS (
         SELECT 1 FROM attachments
         WHERE attachments.file_path = name
         AND (
           attachments.uploaded_by = auth.uid()
           OR
           -- Project attachments
           (attachments.project_id IS NOT NULL AND EXISTS (
             SELECT 1 FROM projects
             WHERE projects.id = attachments.project_id
             AND (
               projects.customer_id = auth.uid()
               OR
               EXISTS (
                 SELECT 1 FROM profiles
                 WHERE profiles.id = auth.uid()
                 AND profiles.role IN ('admin', 'staff')
               )
             )
           ))
           OR
           -- Ticket attachments
           (attachments.ticket_id IS NOT NULL AND EXISTS (
             SELECT 1 FROM tickets t
             JOIN projects p ON t.project_id = p.id
             WHERE t.id = attachments.ticket_id
             AND (
               p.customer_id = auth.uid()
               OR
               EXISTS (
                 SELECT 1 FROM profiles
                 WHERE profiles.id = auth.uid()
                 AND profiles.role IN ('admin', 'staff')
               )
             )
           ))
         )
       )
     )
   );

   -- Policy 3: Allow users to delete their own uploads or admin to delete all
   CREATE POLICY "Users can delete authorized files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (
     bucket_id = 'attachments' AND
     (
       -- Admin can delete all
       EXISTS (
         SELECT 1 FROM profiles
         WHERE profiles.id = auth.uid()
         AND profiles.role = 'admin'
       )
       OR
       -- Users can delete their own uploads
       EXISTS (
         SELECT 1 FROM attachments
         WHERE attachments.file_path = name
         AND attachments.uploaded_by = auth.uid()
       )
     )
   );
   ```

## Step 2: Deploy Database Migration

Run the migration to create the attachments table:

```bash
npx supabase db push
```

Or manually in **Supabase Dashboard** → **SQL Editor**:
- Copy contents of `supabase/migrations/20251126_create_attachments_schema.sql`
- Paste and execute

## Step 3: Add Attachments to Your HTML Pages

### For Project Pages (e.g., admin-projects.html):

```html
<!-- Add to <head> -->
<script src="attachments.js"></script>

<!-- Add this container where you want attachments to appear -->
<div id="projectAttachments"></div>

<!-- Initialize in your project detail view -->
<script>
// When showing project details
function showProjectDetails(projectId) {
    // Your existing code...
    
    // Initialize attachments
    attachmentsManager.init('project', projectId, 'projectAttachments');
}
</script>
```

### For Ticket Pages (e.g., tickets-tasks.html):

```html
<!-- Add to <head> -->
<script src="attachments.js"></script>

<!-- Add this container where you want attachments to appear -->
<div id="ticketAttachments"></div>

<!-- Initialize in your ticket detail view -->
<script>
// When showing ticket details
function showTicketDetails(ticketId) {
    // Your existing code...
    
    // Initialize attachments
    attachmentsManager.init('ticket', ticketId, 'ticketAttachments');
}
</script>
```

## Step 4: Add CSS Styling

Add these styles to your `styles.css`:

```css
/* Attachments Section */
.attachments-section {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
}

.attachments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e2e8f0;
}

.attachments-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
}

.attachment-count {
    background: #3b82f6;
    color: white;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.85rem;
    font-weight: 600;
}

.attachments-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.attachment-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s;
}

.attachment-item:hover {
    background: #f1f5f9;
    border-color: #cbd5e1;
}

.attachment-icon {
    font-size: 2rem;
    min-width: 40px;
    text-align: center;
}

.attachment-info {
    flex: 1;
}

.attachment-name {
    font-weight: 600;
    margin-bottom: 5px;
}

.attachment-meta {
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 0.875rem;
    color: #64748b;
}

.attachment-meta .separator {
    color: #cbd5e1;
}

.attachment-description {
    margin-top: 8px;
    font-size: 0.875rem;
    color: #64748b;
    font-style: italic;
}

.attachment-actions {
    display: flex;
    gap: 8px;
}

/* File Upload Modal */
.file-upload-area {
    border: 2px dashed #cbd5e1;
    border-radius: 8px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
}

.file-upload-area:hover,
.file-upload-area.drag-over {
    border-color: #3b82f6;
    background: #eff6ff;
}

.file-upload-placeholder i {
    font-size: 3rem;
    color: #3b82f6;
    margin-bottom: 15px;
}

.file-upload-preview {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 15px;
    background: #f1f5f9;
    border-radius: 6px;
}

.file-upload-preview i {
    font-size: 1.5rem;
    color: #3b82f6;
}

.file-upload-preview span {
    flex: 1;
    text-align: left;
    font-weight: 500;
}

/* Upload Progress */
.upload-progress {
    margin-top: 20px;
}

.progress-bar {
    width: 100%;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    border-radius: 4px;
    transition: width 0.3s ease;
    width: 0;
}

.progress-text {
    text-align: center;
    font-size: 0.875rem;
    font-weight: 600;
    color: #3b82f6;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 40px 20px;
    color: #64748b;
}

.empty-state i {
    font-size: 3rem;
    color: #cbd5e1;
    margin-bottom: 15px;
}

.empty-state p {
    margin: 5px 0;
}

/* Responsive */
@media (max-width: 768px) {
    .attachments-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }
    
    .attachment-item {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .attachment-actions {
        width: 100%;
        justify-content: flex-end;
    }
}
```

## Step 5: Verification & Testing

### Test the complete flow:

1. **Upload Test:**
   - Open a project or ticket detail page
   - Click "Upload File"
   - Drag and drop or select a file
   - Add description (optional)
   - Click Upload
   - Verify file appears in list

2. **Download Test:**
   - Click download icon on any attachment
   - Verify file downloads with correct name

3. **Delete Test:**
   - Click delete icon
   - Confirm deletion
   - Verify file is removed

4. **Permissions Test:**
   - Test as different roles (admin, staff, customer)
   - Verify customers can only see their project/ticket files
   - Verify staff can see all company files
   - Verify admins can see all files

5. **Real-time Test:**
   - Open same project in two browser windows
   - Upload file in one window
   - Verify it appears instantly in other window

## Troubleshooting

### Issue: Upload fails with "Bucket not found"

**Solution:**
```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'attachments';

-- If not, create it in Supabase Dashboard > Storage
```

### Issue: "Permission denied" when uploading

**Solution:**
```sql
-- Check storage policies
SELECT * FROM storage.policies WHERE bucket_id = 'attachments';

-- Re-apply storage policies from Step 1
```

### Issue: Files not appearing

**Solution:**
- Check browser console for errors
- Verify RLS policies are enabled
- Check that attachments table has data:
  ```sql
  SELECT * FROM attachments ORDER BY created_at DESC LIMIT 10;
  ```

### Issue: Download not working

**Solution:**
- Verify storage policies allow SELECT
- Check that signed URL is being generated
- Ensure file_path in database matches actual storage path

## Security Best Practices

✅ Storage bucket is private (not public)  
✅ RLS policies enforce role-based access  
✅ File size limits prevent abuse  
✅ Signed URLs expire after 60 seconds  
✅ XSS protection with HTML escaping  
✅ Files are stored with unique names  

## File Size Limits

Default: 50MB per file

To change:
```javascript
// In attachments.js
this.maxFileSize = 100 * 1024 * 1024; // 100MB
```

And update Supabase Storage bucket settings.

## Supported File Types

Currently allows all file types. To restrict:

```javascript
// In attachments.js
this.allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf'
];
```

## Next Steps

After successful deployment:
1. ✅ Test uploads from all user roles
2. ✅ Verify real-time updates work
3. ✅ Test file downloads
4. ✅ Monitor storage usage in Supabase Dashboard
5. ✅ Consider adding image preview for image files
6. ✅ Consider adding virus scanning for uploads (enterprise)

---

**Status:** Ready to Deploy  
**Date:** November 26, 2025  
**Version:** 1.0
