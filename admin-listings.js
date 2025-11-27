// Admin Investor Listings Management
// Handles reviewing, approving, and managing investor listings

import { supabase } from './supabase-config.js';

/**
 * Get all listings for admin review (with filters)
 */
export async function getListingsForReview(status = 'pending') {
    try {
        let query = supabase
            .from('investor_listings')
            .select(`
                *,
                profiles!investor_listings_user_id_fkey (
                    full_name,
                    email,
                    company
                ),
                listing_assets (
                    id,
                    asset_type,
                    file_name,
                    file_url
                ),
                listing_verification_docs (
                    id,
                    doc_type,
                    file_name,
                    file_url,
                    verified
                )
            `)
            .order('created_at', { ascending: false });
        
        if (status !== 'all') {
            query = query.eq('status', status);
        }
        
        const { data: listings, error } = await query;
        
        if (error) throw error;
        
        return {
            success: true,
            listings: listings || []
        };
    } catch (error) {
        console.error('Error fetching listings for review:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get a single listing with all details for admin review
 */
export async function getListingForAdmin(listingId) {
    try {
        const { data: listing, error } = await supabase
            .from('investor_listings')
            .select(`
                *,
                profiles!investor_listings_user_id_fkey (
                    full_name,
                    email,
                    company,
                    phone
                ),
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
                    file_url,
                    verified,
                    verified_by,
                    verified_at
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
        console.error('Error fetching listing for admin:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Approve a listing
 */
export async function approveListing(listingId, adminNotes = '') {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('investor_listings')
            .update({
                status: 'approved',
                approved_at: new Date().toISOString(),
                admin_notes: adminNotes
            })
            .eq('id', listingId)
            .select()
            .single();
        
        if (error) throw error;
        
        // TODO: Send notification email to user
        
        return {
            success: true,
            listing: data,
            message: 'Listing approved successfully'
        };
    } catch (error) {
        console.error('Error approving listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Reject a listing
 */
export async function rejectListing(listingId, rejectionReason) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('investor_listings')
            .update({
                status: 'rejected',
                rejection_reason: rejectionReason
            })
            .eq('id', listingId)
            .select()
            .single();
        
        if (error) throw error;
        
        // TODO: Send notification email to user
        
        return {
            success: true,
            listing: data,
            message: 'Listing rejected'
        };
    } catch (error) {
        console.error('Error rejecting listing:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Request revisions on a listing
 */
export async function requestRevisions(listingId, revisionNotes) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
            .from('investor_listings')
            .update({
                status: 'needs_revision',
                admin_notes: revisionNotes
            })
            .eq('id', listingId)
            .select()
            .single();
        
        if (error) throw error;
        
        // TODO: Send notification email to user
        
        return {
            success: true,
            listing: data,
            message: 'Revision request sent'
        };
    } catch (error) {
        console.error('Error requesting revisions:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verify a verification document
 */
export async function verifyDocument(docId, verified = true) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const updateData = {
            verified: verified,
            verified_by: verified ? user.id : null,
            verified_at: verified ? new Date().toISOString() : null
        };
        
        const { data, error } = await supabase
            .from('listing_verification_docs')
            .update(updateData)
            .eq('id', docId)
            .select()
            .single();
        
        if (error) throw error;
        
        return {
            success: true,
            document: data,
            message: verified ? 'Document verified' : 'Verification removed'
        };
    } catch (error) {
        console.error('Error verifying document:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Update admin notes on a listing
 */
export async function updateAdminNotes(listingId, notes) {
    try {
        const { data, error } = await supabase
            .from('investor_listings')
            .update({ admin_notes: notes })
            .eq('id', listingId)
            .select()
            .single();
        
        if (error) throw error;
        
        return {
            success: true,
            listing: data,
            message: 'Notes updated'
        };
    } catch (error) {
        console.error('Error updating admin notes:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get listing statistics for admin dashboard
 */
export async function getListingStats() {
    try {
        const { data: listings, error } = await supabase
            .from('investor_listings')
            .select('status, created_at, seeking_amount');
        
        if (error) throw error;
        
        const stats = {
            total: listings.length,
            pending: listings.filter(l => l.status === 'pending').length,
            approved: listings.filter(l => l.status === 'approved').length,
            rejected: listings.filter(l => l.status === 'rejected').length,
            needsRevision: listings.filter(l => l.status === 'needs_revision').length,
            totalSeekingAmount: listings
                .filter(l => l.status === 'approved')
                .reduce((sum, l) => sum + parseFloat(l.seeking_amount || 0), 0),
            recentListings: listings
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
        };
        
        return stats;
    } catch (error) {
        console.error('Error fetching listing stats:', error);
        return {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0,
            needsRevision: 0,
            totalSeekingAmount: 0,
            recentListings: []
        };
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
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get status color
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
        'approved': 'Approved',
        'rejected': 'Rejected',
        'needs_revision': 'Needs Revision',
        'paused': 'Paused'
    };
    return labels[status] || status;
}
