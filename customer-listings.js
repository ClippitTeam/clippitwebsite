// Customer Investor Listings - Database Integration
// Handles creating, viewing, and managing investor opportunity listings

import { supabase } from './supabase-config.js';

// Storage bucket names
const LISTINGS_BUCKET = 'investor-listings';
const VERIFICATION_BUCKET = 'verification-docs';

/**
 * Initialize storage buckets (run once on setup)
 */
export async function initializeListingsBuckets() {
    try {
        // Check if buckets exist, create if they don't
        const { data: buckets } = await supabase.storage.listBuckets();
        
        const listingsBucketExists = buckets?.some(b => b.name === LISTINGS_BUCKET);
        const verificationBucketExists = buckets?.some(b => b.name === VERIFICATION_BUCKET);
        
        if (!listingsBucketExists) {
            await supabase.storage.createBucket(LISTINGS_BUCKET, {
                public: false,
                fileSizeLimit: 52428800 // 50MB
            });
            console.log('Created investor-listings bucket');
        }
        
        if (!verificationBucketExists) {
            await supabase.storage.createBucket(VERIFICATION_BUCKET, {
                public: false,
                fileSizeLimit: 10485760 // 10MB
            });
            console.log('Created verification-docs bucket');
        }
    } catch (error) {
        console.error('Error initializing buckets:', error);
    }
}

/**
 * Upload file to Supabase Storage
 */
async function uploadFile(bucket, path, file) {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) throw error;
        
        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        
        return {
            success: true,
            path: data.path,
            url: urlData.publicUrl
        };
    } catch (error) {
        console.error('Error uploading file:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Create a new investor listing
 */
export async function createInvestorListing(listingData, files) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // 1. Create the listing record
        const { data: listing, error: listingError } = await supabase
            .from('investor_listings')
            .insert({
                user_id: user.id,
                project_name: listingData.projectName,
                category: listingData.category,
                investment_type: listingData.investmentType,
                seeking_amount: parseFloat(listingData.seekingAmount),
                valuation: listingData.valuation ? parseFloat(listingData.valuation) : null,
                overview: listingData.overview,
                use_of_funds: listingData.useOfFunds,
                status: 'pending'
            })
            .select()
            .single();
        
        if (listingError) throw listingError;
        
        const listingId = listing.id;
        
        // 2. Upload verification documents
        if (files.verificationDocs) {
            for (const doc of files.verificationDocs) {
                const fileName = `${listingId}/${doc.type}_${Date.now()}_${doc.file.name}`;
                const uploadResult = await uploadFile(VERIFICATION_BUCKET, fileName, doc.file);
                
                if (uploadResult.success) {
                    await supabase
                        .from('listing_verification_docs')
                        .insert({
                            listing_id: listingId,
                            doc_type: doc.type,
                            file_name: doc.file.name,
                            file_url: uploadResult.url
                        });
                }
            }
        }
        
        // 3. Upload project images
        if (files.images && files.images.length > 0) {
            for (let i = 0; i < files.images.length; i++) {
                const image = files.images[i];
                const fileName = `${listingId}/images/${Date.now()}_${i}_${image.name}`;
                const uploadResult = await uploadFile(LISTINGS_BUCKET, fileName, image);
                
                if (uploadResult.success) {
                    await supabase
                        .from('listing_assets')
                        .insert({
                            listing_id: listingId,
                            asset_type: 'image',
                            file_name: image.name,
                            file_url: uploadResult.url,
                            file_size: image.size,
                            display_order: i
                        });
                }
            }
        }
        
        // 4. Upload pitch deck
        if (files.pitchDeck) {
            const fileName = `${listingId}/pitch/${Date.now()}_${files.pitchDeck.name}`;
            const uploadResult = await uploadFile(LISTINGS_BUCKET, fileName, files.pitchDeck);
            
            if (uploadResult.success) {
                await supabase
                    .from('listing_assets')
                    .insert({
                        listing_id: listingId,
                        asset_type: 'pitch_deck',
                        file_name: files.pitchDeck.name,
                        file_url: uploadResult.url,
                        file_size: files.pitchDeck.size
                    });
            }
        }
        
        // 5. Upload demo video
        if (files.video) {
            const fileName = `${listingId}/video/${Date.now()}_${files.video.name}`;
            const uploadResult = await uploadFile(LISTINGS_BUCKET, fileName, files.video);
            
            if (uploadResult.success) {
                await supabase
                    .from('listing_assets')
                    .insert({
                        listing_id: listingId,
                        asset_type: 'video',
                        file_name: files.video.name,
                        file_url: uploadResult.url,
                        file_size: files.video.size
                    });
            }
        }
        
        return {
            success: true,
            listing: listing,
            message: 'Listing created successfully and submitted for admin review'
        };
        
    } catch (error) {
        console.error('Error creating listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get all listings for the current user
 */
export async function getUserListings() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data: listings, error } = await supabase
            .from('investor_listings')
            .select(`
                *,
                listing_assets (
                    id,
                    asset_type,
                    file_name,
                    file_url,
                    file_size,
                    display_order
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return listings || [];
    } catch (error) {
        console.error('Error fetching listings:', error);
        return [];
    }
}

/**
 * Get a single listing by ID with all related data
 */
export async function getListingById(listingId) {
    try {
        const { data: listing, error } = await supabase
            .from('investor_listings')
            .select(`
                *,
                listing_assets (
                    id,
                    asset_type,
                    file_name,
                    file_url,
                    file_size,
                    display_order
                ),
                listing_verification_docs (
                    id,
                    doc_type,
                    file_name,
                    verified
                )
            `)
            .eq('id', listingId)
            .single();
        
        if (error) throw error;
        
        return {
            success: true,
            listing: listing
        };
    } catch (error) {
        console.error('Error fetching listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update a listing (only allowed if pending or needs_revision)
 */
export async function updateListing(listingId, updates) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('investor_listings')
            .update({
                project_name: updates.projectName,
                category: updates.category,
                investment_type: updates.investmentType,
                seeking_amount: parseFloat(updates.seekingAmount),
                valuation: updates.valuation ? parseFloat(updates.valuation) : null,
                overview: updates.overview,
                use_of_funds: updates.useOfFunds
            })
            .eq('id', listingId)
            .eq('user_id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        
        return {
            success: true,
            listing: data,
            message: 'Listing updated successfully'
        };
    } catch (error) {
        console.error('Error updating listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Pause/Resume a listing
 */
export async function toggleListingStatus(listingId, currentStatus) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const newStatus = currentStatus === 'paused' ? 'approved' : 'paused';
        
        const { data, error } = await supabase
            .from('investor_listings')
            .update({ status: newStatus })
            .eq('id', listingId)
            .eq('user_id', user.id)
            .select()
            .single();
        
        if (error) throw error;
        
        return {
            success: true,
            listing: data,
            message: `Listing ${newStatus === 'paused' ? 'paused' : 'activated'} successfully`
        };
    } catch (error) {
        console.error('Error toggling listing status:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Delete a listing (cascade deletes assets and docs)
 */
export async function deleteListing(listingId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Get listing to find files to delete
        const { data: listing } = await supabase
            .from('investor_listings')
            .select('*, listing_assets(*)')
            .eq('id', listingId)
            .eq('user_id', user.id)
            .single();
        
        if (listing) {
            // Delete files from storage
            for (const asset of listing.listing_assets) {
                const path = asset.file_url.split('/').slice(-3).join('/');
                await supabase.storage.from(LISTINGS_BUCKET).remove([path]);
            }
        }
        
        // Delete listing record (cascade deletes related records)
        const { error } = await supabase
            .from('investor_listings')
            .delete()
            .eq('id', listingId)
            .eq('user_id', user.id);
        
        if (error) throw error;
        
        return {
            success: true,
            message: 'Listing deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get inquiries for a listing
 */
export async function getListingInquiries(listingId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data: inquiries, error } = await supabase
            .from('listing_inquiries')
            .select(`
                *,
                investor:profiles!listing_inquiries_investor_id_fkey (
                    full_name,
                    email,
                    company
                )
            `)
            .eq('listing_id', listingId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        return {
            success: true,
            inquiries: inquiries || []
        };
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get statistics for user's listings
 */
export async function getListingStats() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data: listings } = await supabase
            .from('investor_listings')
            .select('status, views, inquiries, offers')
            .eq('user_id', user.id);
        
        if (!listings) return { totalListings: 0, totalViews: 0, totalInquiries: 0, totalOffers: 0 };
        
        const stats = {
            totalListings: listings.length,
            activeListings: listings.filter(l => l.status === 'approved').length,
            pendingListings: listings.filter(l => l.status === 'pending').length,
            totalViews: listings.reduce((sum, l) => sum + (l.views || 0), 0),
            totalInquiries: listings.reduce((sum, l) => sum + (l.inquiries || 0), 0),
            totalOffers: listings.reduce((sum, l) => sum + (l.offers || 0), 0)
        };
        
        return stats;
    } catch (error) {
        console.error('Error fetching stats:', error);
        return { totalListings: 0, totalViews: 0, totalInquiries: 0, totalOffers: 0 };
    }
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

/**
 * Format date
 */
export function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get status badge color
 */
export function getStatusColor(status) {
    const colors = {
        'pending': '#A855F7',
        'approved': '#10B981',
        'rejected': '#EF4444',
        'needs_revision': '#F59E0B',
        'paused': '#6B7280'
    };
    return colors[status] || '#6B7280';
}

/**
 * Get status label
 */
export function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending Review',
        'approved': 'Active',
        'rejected': 'Rejected',
        'needs_revision': 'Needs Revision',
        'paused': 'Paused'
    };
    return labels[status] || status;
}

// Initialize buckets when module loads (only if authenticated)
supabase.auth.getUser().then(({ data: { user } }) => {
    if (user) {
        initializeListingsBuckets();
    }
});
