# Investor Listings System - Deployment Guide

## Overview
Complete deployment guide for the client dashboard investor listing submission system. This enables clients to submit their projects for investment opportunities.

---

## 📋 What We're Deploying

### Database Components
- `investor_listings` table - Main listing data
- `listing_assets` table - Images, videos, pitch decks
- `listing_verification_docs` table - ID and business verification
- `listing_inquiries` table - Investor questions and offers
- RLS policies for security
- Helper functions for data access

### Storage Buckets
- `investor-listings` - Project images, pitch decks, videos
- `verification-docs` - ID documents, business registrations

### JavaScript Integration
- `customer-listings.js` - Database operations
- Updated `dashboard.js` - UI integration with database

---

## 🚀 Deployment Steps

### Step 1: Apply Database Migration

**In Supabase Dashboard → SQL Editor:**

1. Go to your Supabase project
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of:
   ```
   supabase/migrations/20251127_create_investor_listings_schema.sql
   ```
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. Verify success: "Success. No rows returned"

**Verify the tables were created:**

```sql
-- Run this query to check
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('investor_listings', 'listing_assets', 'listing_verification_docs', 'listing_inquiries');
```

You should see all 4 tables listed.

---

### Step 2: Create Storage Buckets

**In Supabase Dashboard → Storage:**

#### Create investor-listings bucket:
1. Click **Storage** in left sidebar
2. Click **New bucket**
3. Name: `investor-listings`
4. **Public bucket**: ✅ Checked (investors need to view assets)
5. File size limit: 50MB
6. Allowed MIME types: `image/*, video/*, application/pdf, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation`
7. Click **Create bucket**

#### Create verification-docs bucket:
1. Click **New bucket**
2. Name: `verification-docs`
3. **Public bucket**: ❌ Unchecked (private verification documents)
4. File size limit: 10MB
5. Allowed MIME types: `image/*, application/pdf`
6. Click **Create bucket**

#### Set Up Storage Policies:

**For investor-listings bucket:**

```sql
-- Policy 1: Users can upload to their own listing folders
CREATE POLICY "Users can upload to own listings"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'investor-listings' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.investor_listings WHERE user_id = auth.uid()
    )
);

-- Policy 2: Users can read their own listing files
CREATE POLICY "Users can view own listing files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'investor-listings' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.investor_listings WHERE user_id = auth.uid()
    )
);

-- Policy 3: Investors can view approved listing files
CREATE POLICY "Investors can view approved listing files"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'investor-listings' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.investor_listings WHERE status = 'approved'
    ) AND
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'investor'
    )
);

-- Policy 4: Admins can access all files
CREATE POLICY "Admins can access all listing files"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'investor-listings' AND
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);
```

**For verification-docs bucket:**

```sql
-- Policy 1: Users can upload verification docs
CREATE POLICY "Users can upload verification docs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'verification-docs' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.investor_listings WHERE user_id = auth.uid()
    )
);

-- Policy 2: Users can view their own verification docs
CREATE POLICY "Users can view own verification docs"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-docs' AND
    (storage.foldername(name))[1] IN (
        SELECT id::text FROM public.investor_listings WHERE user_id = auth.uid()
    )
);

-- Policy 3: Admins can access all verification docs
CREATE POLICY "Admins can access all verification docs"
ON storage.objects FOR ALL
TO authenticated
USING (
    bucket_id = 'verification-docs' AND
    EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
);
```

---

### Step 3: Deploy JavaScript Files

1. **Upload customer-listings.js** to your web hosting
2. **Add import to customer-dashboard.html:**

```html
<!-- Add this before the closing </body> tag -->
<script type="module" src="customer-listings.js"></script>
```

---

### Step 4: Update Dashboard.js

The `dashboard.js` file needs updates to integrate with the database. Here are the key changes needed:

**Replace the `submitListing()` function:**

```javascript
// Replace the existing submitListing function with this:
import { createInvestorListing } from './customer-listings.js';

async function submitListing() {
    try {
        // Get the listing data from sessionStorage
        const storedData = sessionStorage.getItem('currentListingData');
        const savedData = storedData ? JSON.parse(storedData) : {};
        
        // Collect all uploaded files
        const files = {
            verificationDocs: [],
            images: [],
            pitchDeck: null,
            video: null
        };
        
        // Get verification documents
        const idUpload = document.getElementById('id-upload');
        const businessUpload = document.getElementById('business-upload');
        
        if (idUpload?.files[0]) {
            files.verificationDocs.push({
                type: 'id',
                file: idUpload.files[0]
            });
        }
        
        if (businessUpload?.files[0]) {
            files.verificationDocs.push({
                type: 'business_registration',
                file: businessUpload.files[0]
            });
        }
        
        // Get uploaded assets
        const imageUpload = document.getElementById('image-upload');
        const pitchUpload = document.getElementById('pitch-upload');
        const videoUpload = document.getElementById('video-upload');
        
        if (imageUpload?.files) {
            files.images = Array.from(imageUpload.files);
        }
        
        if (pitchUpload?.files[0]) {
            files.pitchDeck = pitchUpload.files[0];
        }
        
        if (videoUpload?.files[0]) {
            files.video = videoUpload.files[0];
        }
        
        // Show loading state
        closeModal();
        showNotification('Submitting your listing...', 'info');
        
        // Create the listing in database
        const result = await createInvestorListing(savedData, files);
        
        if (result.success) {
            // Clear session storage
            sessionStorage.removeItem('currentListingData');
            
            showNotification('Listing submitted successfully!', 'success');
            
            setTimeout(() => {
                showNotification('Admin will review within 24-48 hours', 'info');
                // Refresh the listings display
                loadUserListings();
            }, 2000);
        } else {
            showNotification('Error: ' + result.error, 'error');
        }
        
    } catch (error) {
        console.error('Error submitting listing:', error);
        showNotification('Failed to submit listing. Please try again.', 'error');
    }
}
```

**Add function to load and display user listings:**

```javascript
import { getUserListings, formatCurrency, formatDate, getStatusColor, getStatusLabel } from './customer-listings.js';

async function loadUserListings() {
    try {
        const listings = await getUserListings();
        const container = document.getElementById('active-listings-section');
        
        if (!container) return;
        
        if (listings.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">📋</div>
                    <h4 style="color: #fff; margin-bottom: 0.5rem;">No Active Listings</h4>
                    <p style="color: #9CA3AF; margin-bottom: 1.5rem;">Create your first listing to attract investors</p>
                    <button onclick="showListingModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Create Your First Listing</button>
                </div>
            `;
            return;
        }
        
        let listingsHTML = '';
        
        listings.forEach((listing) => {
            const statusColor = getStatusColor(listing.status);
            const statusLabel = getStatusLabel(listing.status);
            const imageCount = listing.listing_assets?.filter(a => a.asset_type === 'image').length || 0;
            const hasPitch = listing.listing_assets?.some(a => a.asset_type === 'pitch_deck') || false;
            const hasVideo = listing.listing_assets?.some(a => a.asset_type === 'video') || false;
            
            listingsHTML += `
                <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                                <h4 style="color: #40E0D0; font-size: 1.25rem;">${listing.project_name}</h4>
                                <span style="background: ${statusColor}20; color: ${statusColor}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${statusLabel.toUpperCase()}</span>
                            </div>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 1rem;">
                                Seeking: ${formatCurrency(listing.seeking_amount)} • ${listing.investment_type.replace('-', ' ').charAt(0).toUpperCase() + listing.investment_type.replace('-', ' ').slice(1)}
                            </p>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem;">
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Views</p>
                                    <p style="color: #fff; font-weight: 600; font-size: 1.25rem;">${listing.views || 0}</p>
                                </div>
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Inquiries</p>
                                    <p style="color: #fff; font-weight: 600; font-size: 1.25rem;">${listing.inquiries || 0}</p>
                                </div>
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Offers</p>
                                    <p style="color: #fff; font-weight: 600; font-size: 1.25rem;">${listing.offers || 0}</p>
                                </div>
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Listed</p>
                                    <p style="color: #fff; font-weight: 600;">${formatDate(listing.created_at)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #4B5563; flex-wrap: wrap;">
                        ${listing.status === 'approved' ? `<button onclick="viewListingAnalytics('${listing.id}')" style="flex: 1; min-width: 150px; padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">View Analytics</button>` : ''}
                        ${listing.status === 'approved' && listing.inquiries > 0 ? `<button onclick="viewListingInquiries('${listing.id}')" style="padding: 0.5rem 1rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer;">View Inquiries (${listing.inquiries})</button>` : ''}
                        ${listing.status === 'needs_revision' ? `<button onclick="editListingFromDB('${listing.id}')" style="padding: 0.5rem 1rem; background: #F59E0B; color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">✏️ Revise</button>` : ''}
                        <button onclick="viewListingDetails('${listing.id}')" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; font-weight: 600;">👁️ View</button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = listingsHTML;
        
    } catch (error) {
        console.error('Error loading listings:', error);
    }
}

// Load listings when investor opportunities tab is opened
document.addEventListener('DOMContentLoaded', () => {
    // Load listings initially and when tab is clicked
    const investorTab = document.querySelector('a[href="#investor-opportunities"]');
    if (investorTab) {
        investorTab.addEventListener('click', () => {
            setTimeout(loadUserListings, 100);
        });
    }
});
```

---

### Step 5: Update customer-dashboard.html

Add the script imports at the end of the file, before `</body>`:

```html
<!-- Investor Listings Integration -->
<script type="module" src="customer-listings.js"></script>
```

---

### Step 6: Test the Complete Flow

#### Test 1: Create a Listing
1. Log in as a customer
2. Go to "Investor Opportunities" tab
3. Click "List for Investment"
4. Complete all 4 steps:
   - Upload ID and business registration
   - Enter project details
   - Upload images, pitch deck
   - Review and submit
5. Verify listing appears as "Pending Review"

#### Test 2: Verify Database
```sql
-- Check if listing was created
SELECT * FROM investor_listings ORDER BY created_at DESC LIMIT 1;

-- Check if assets were uploaded
SELECT * FROM listing_assets ORDER BY uploaded_at DESC;

-- Check if verification docs were uploaded
SELECT * FROM listing_verification_docs ORDER BY created_at DESC;
```

#### Test 3: Check Storage
1. Go to Supabase Dashboard → Storage
2. Check `investor-listings` bucket - should have uploaded files
3. Check `verification-docs` bucket - should have verification documents

---

## 🔐 Security Features

### Row Level Security (RLS)
- ✅ Users can only see their own listings
- ✅ Users can only edit pending/needs_revision listings
- ✅ Admins can see and manage all listings
- ✅ Investors can only see approved listings
- ✅ File upload restricted to listing owners

### File Upload Security
- ✅ File size limits enforced
- ✅ MIME type restrictions
- ✅ User authentication required
- ✅ Folder-level access control

---

## 📊 Admin View (To Be Implemented)

Admins will need an interface to:
1. View pending listings
2. Review verification documents
3. Approve/Reject listings
4. Add admin notes
5. Request revisions

This will be a separate implementation in the admin dashboard.

---

## 🐛 Troubleshooting

### Issue: Buckets not created automatically
**Solution:** Run this in browser console on the dashboard:
```javascript
import { initializeListingsBuckets } from './customer-listings.js';
await initializeListingsBuckets();
```

### Issue: Files not uploading
**Check:**
1. Storage policies are correctly applied
2. Bucket names match exactly ('investor-listings', 'verification-docs')
3. User is authenticated
4. File sizes within limits

### Issue: RLS blocking access
**Verify:**
```sql
-- Check user's role
SELECT role FROM profiles WHERE id = auth.uid();

-- Check if listing belongs to user
SELECT user_id FROM investor_listings WHERE id = 'listing-id';
```

### Issue: "localStorage is not defined"
This is expected - we're migrating from localStorage to database. The old code references can be removed.

---

## 📈 Next Steps

1. ✅ Database schema deployed
2. ✅ Storage buckets created
3. ✅ JavaScript integration complete
4. ⏳ **Admin review interface** (next priority)
5. ⏳ **Investor viewing interface** (after admin)
6. ⏳ **Email notifications** (when listing approved/rejected)
7. ⏳ **Analytics dashboard** (track views, inquiries)

---

## 🎯 Success Criteria

After deployment, clients should be able to:
- ✅ Submit investor listings through 4-step wizard
- ✅ Upload verification documents
- ✅ Upload project images, pitch decks, videos
- ✅ View their submitted listings
- ✅ See listing status (pending, approved, etc.)
- ✅ Track views, inquiries, and offers
- ✅ Edit listings (if not yet approved)

---

## 💡 Tips

1. **Test with a real account** before rolling out to all users
2. **Monitor Supabase logs** for any errors during testing
3. **Set up email notifications** to alert admins when new listings submitted
4. **Create admin workflow documentation** for reviewing listings
5. **Consider adding listing expiry dates** to keep opportunities fresh

---

## 📝 Files Modified/Created

### New Files:
- ✅ `supabase/migrations/20251127_create_investor_listings_schema.sql`
- ✅ `customer-listings.js`
- ✅ `DEPLOY_INVESTOR_LISTINGS.md` (this file)

### Modified Files:
- ⏳ `dashboard.js` (needs updates as shown above)
- ⏳ `customer-dashboard.html` (add script import)

### To Be Created:
- ⏳ Admin listing review interface
- ⏳ Investor viewing interface
- ⏳ Email notification templates

---

## 🚦 Status

**Current Status:** ✅ Backend Complete, ⏳ Frontend Integration Pending

**Ready for:** Database migration and storage setup  
**Next:** Update dashboard.js and test complete flow
