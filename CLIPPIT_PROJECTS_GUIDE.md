# Clippit Projects - Complete Implementation Guide

## Overview
The Clippit Projects system allows admins to create and manage portfolio projects that can be showcased to investors in the Investor Lounge. This implementation includes full file upload support via Supabase Storage.

## Features Implemented

### ✅ Core Functionality
- **Create Projects**: Full form with all necessary fields
- **File Uploads**: 
  - Main project image (up to 5MB)
  - Multiple documents (PDF, DOC, XLS, PPT - up to 10MB each)
  - Drag-and-drop support
  - Real-time preview
- **Search & Filter**: By category, status, and keywords
- **Status Management**: Draft, Published, Archived
- **CRUD Operations**: Create, Read, Update, Delete

### 📁 File Upload System

#### Supabase Storage Setup
- **Bucket Name**: `project-files`
- **Configuration**: Public bucket with 50MB file size limit
- **Auto-initialization**: Bucket is created automatically on first load

#### Supported File Types
**Images:**
- JPG, PNG, GIF, WebP
- Max size: 5MB
- Stored at: `projects/{timestamp}_{filename}`

**Documents:**
- PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- Max size: 10MB per file
- Multiple files supported
- Stored at: `projects/{timestamp}_{filename}`

#### File Storage Structure
```
project-files/
  └── projects/
      ├── 1701234567890_project-logo.png
      ├── 1701234568901_business-plan.pdf
      └── 1701234569012_financial-projections.xlsx
```

### 🎯 Project Actions Available

1. **View Details** - Click on any project card
2. **Edit Project** - Modify project information (coming soon)
3. **Toggle Publish** - Switch between draft/published status
4. **Analytics** - View engagement metrics (coming soon)
5. **Duplicate** - Create a copy of existing project (coming soon)
6. **Delete** - Permanently remove project and its files

### 📊 Statistics Tracked
- Total Projects
- Published Projects
- Total Questions from Investors
- Total Offers Made

## Database Schema

### clippit_projects Table
```sql
- id (uuid, primary key)
- project_name (text)
- category (text)
- investment_type (text)
- overview (text)
- seeking_amount (numeric)
- valuation (numeric, nullable)
- technologies (text, nullable)
- timeline (text, nullable)
- team_size (integer, nullable)
- status (text) -- draft, published, archived
- main_image_url (text, nullable)
- documents (jsonb, nullable) -- [{ name, url, size }]
- questions_count (integer, default 0)
- offers_count (integer, default 0)
- created_at (timestamp)
- updated_at (timestamp)
```

## Usage Instructions

### Creating a New Project

1. **Navigate to Clippit Projects** section in admin dashboard
2. **Click "+ Create Project"** button
3. **Fill in Project Information:**
   - Project Name (required)
   - Category (required)
   - Investment Type (required)
   - Overview/Description (required)

4. **Upload Main Image (optional):**
   - Click or drag image into drop zone
   - Preview appears immediately
   - Click again to change image

5. **Upload Documents (optional):**
   - Click or drag documents into drop zone
   - Multiple files supported
   - Each file shows name and size
   - Click "Remove" to delete before submitting

6. **Enter Investment Details:**
   - Seeking Amount (required)
   - Valuation (optional)

7. **Add Additional Details (optional):**
   - Technologies used
   - Timeline
   - Team size

8. **Choose Status:**
   - 📝 Draft - Save for later review
   - ✅ Publish - Make visible to investors immediately

9. **Click "Create Project"**

### Managing Existing Projects

#### Toggle Publish Status
- Click ⋯ menu on project card
- Select "🚀 Toggle Publish"
- Instantly switches between draft/published

#### Delete Project
- Click ⋯ menu on project card
- Select "🗑️ Delete"
- Confirm deletion
- Files are automatically removed from storage

### Search and Filter

**Search Bar:**
- Searches project name, overview, and technologies
- Real-time filtering as you type

**Category Filter:**
- Technology, Real Estate, Healthcare, Finance, E-Commerce, SaaS, Other

**Status Filter:**
- Draft, Published, Archived

## Technical Implementation

### File Upload Flow

```javascript
1. User selects/drops files
2. Validation checks (size, type)
3. Files stored in memory (selectedMainImage, selectedDocuments)
4. Preview generated for images
5. On submit:
   a. Upload files to Supabase Storage
   b. Get public URLs
   c. Save project data with file URLs to database
```

### Error Handling

**File Validation:**
- Invalid file type → Notification shown
- File too large → Notification shown
- Upload failure → Error caught and displayed

**Database Operations:**
- Connection errors → Graceful fallback
- Validation errors → User-friendly messages
- Network issues → Retry logic built-in

### Security Considerations

1. **Storage Bucket**: Public read, authenticated write only
2. **File Size Limits**: Enforced at both client and server
3. **File Type Validation**: Strict MIME type checking
4. **Authentication**: Admin-only access verified

## Future Enhancements (Roadmap)

### Coming Soon:
- ✏️ **Edit Projects**: Full editing capability
- 📊 **Analytics Dashboard**: Detailed engagement metrics
- 📋 **Duplicate Projects**: Quick template creation
- 🔍 **Advanced Search**: Tags, date ranges
- 📧 **Investor Notifications**: Auto-notify on new projects
- 💬 **Q&A System**: Investor questions interface
- 💰 **Offer Management**: Track and respond to offers
- 📈 **Performance Metrics**: Views, clicks, conversions

### Future Features:
- Video upload support
- Multiple image galleries
- Version history
- Collaboration tools
- Export/Import functionality
- Integration with external data sources

## Troubleshooting

### Files not uploading?
1. Check Supabase Storage bucket exists
2. Verify file size under limits
3. Check browser console for errors
4. Ensure internet connection stable

### Projects not showing?
1. Check filter settings
2. Verify Supabase connection
3. Check browser console for errors
4. Refresh the page

### Images not displaying?
1. Verify bucket is public
2. Check URL in database
3. Ensure file was uploaded successfully
4. Check CORS settings in Supabase

## API Reference

### Functions Available

```javascript
// Load projects with filters
loadClippitProjects()

// Show creation modal
showCreateClippitProjectModal()

// Create new project
createClippitProject(event)

// View project details
viewClippitProjectDetails(projectId)

// Show action menu
showClippitProjectMenu(projectId)

// Toggle publish status
togglePublishStatus(projectId)

// Delete project
deleteClippitProject(projectId)

// File handling
handleMainImageSelect(event)
handleDocumentsSelect(event)
removeDocument(index)
```

## Configuration

### Supabase Storage Bucket Settings
```javascript
const STORAGE_BUCKET = 'project-files';

// Bucket configuration
{
  public: true,
  fileSizeLimit: 52428800 // 50MB
}
```

### File Size Limits
```javascript
// Images
MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

// Documents
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase connection
3. Review this guide
4. Contact development team

---

**Last Updated**: November 25, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
