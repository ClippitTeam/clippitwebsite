// Investor Listings Viewing
// Handles browsing and inquiring about approved investor listings

// Get supabase from window object (loaded via supabase-config.js)
const supabase = window.supabase;

/**
 * Get all approved listings for investors to browse
 */
export async function getApprovedListings(filters = {}) {
    try {
        let query = supabase
            .from('investor_listings')
            .select(`
                *,
                listing_assets (
                    id,
                    asset_type,
                    file_name,
                    file_url,
                    display_order
                )
            `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });
        
        // Apply filters
        if (filters.category) {
            query = query.eq('category', filters.category);
        }
        
        if (filters.investmentType) {
            query = query.eq('investment_type', filters.investmentType);
        }
        
        if (filters.minAmount) {
            query = query.gte('seeking_amount', filters.minAmount);
        }
        
        if (filters.maxAmount) {
            query = query.lte('seeking_amount', filters.maxAmount);
        }
        
        const { data: listings, error } = await query;
        
        if (error) throw error;
        
        return {
            success: true,
            listings: listings || []
        };
    } catch (error) {
        console.error('Error fetching approved listings:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get a single listing details (for approved listings only)
 */
export async function getListingDetails(listingId) {
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
                )
            `)
            .eq('id', listingId)
            .eq('status', 'approved')
            .single();
        
        if (error) throw error;
        
        // Increment view count
        await incrementViews(listingId);
        
        return {
            success: true,
            listing: listing
        };
    } catch (error) {
        console.error('Error fetching listing details:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Increment view count for a listing
 */
async function incrementViews(listingId) {
    try {
        const { error } = await supabase.rpc('increment_listing_views', {
            listing_uuid: listingId
        });
        
        if (error) console.error('Error incrementing views:', error);
    } catch (error) {
        console.error('Error incrementing views:', error);
    }
}

/**
 * Submit an inquiry for a listing
 */
export async function submitInquiry(listingId, inquiryType, message) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // Create the inquiry
        const { data: inquiry, error: inquiryError } = await supabase
            .from('listing_inquiries')
            .insert({
                listing_id: listingId,
                investor_id: user.id,
                inquiry_type: inquiryType,
                message: message
            })
            .select()
            .single();
        
        if (inquiryError) throw inquiryError;
        
        // Increment inquiries count on the listing
        const { error: updateError } = await supabase
            .from('investor_listings')
            .update({ inquiries: supabase.raw('inquiries + 1') })
            .eq('id', listingId);
        
        if (updateError) console.error('Error updating inquiry count:', updateError);
        
        // TODO: Send notification to listing owner and admin
        
        return {
            success: true,
            inquiry: inquiry,
            message: 'Inquiry submitted successfully'
        };
    } catch (error) {
        console.error('Error submitting inquiry:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Get investor's own inquiries
 */
export async function getMyInquiries() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data: inquiries, error } = await supabase
            .from('listing_inquiries')
            .select(`
                *,
                listing:investor_listings (
                    id,
                    project_name,
                    category,
                    seeking_amount
                )
            `)
            .eq('investor_id', user.id)
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
 * Get listing categories for filtering
 */
export function getCategories() {
    return [
        { value: 'app', label: 'Mobile App' },
        { value: 'website', label: 'Website' },
        { value: 'software', label: 'Software' },
        { value: 'company', label: 'Company/Business' }
    ];
}

/**
 * Get investment types for filtering
 */
export function getInvestmentTypes() {
    return [
        { value: 'equity', label: 'Equity Funding' },
        { value: 'buyout', label: 'Full Buyout' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'acquisition', label: 'Acquisition' }
    ];
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
    
    return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

/**
 * Get inquiry status color
 */
export function getInquiryStatusColor(status) {
    const colors = {
        'pending': '#F59E0B',
        'responded': '#10B981',
        'closed': '#6B7280'
    };
    return colors[status] || '#6B7280';
}

/**
 * Get inquiry type label
 */
export function getInquiryTypeLabel(type) {
    const labels = {
        'question': 'Question',
        'offer': 'Investment Offer',
        'request_details': 'Request More Details'
    };
    return labels[type] || type;
}
