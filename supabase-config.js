// Supabase Configuration
const SUPABASE_URL = 'https://ehaznoklcisgckglkjot.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoYXpub2tsY2lzZ2NrZ2xram90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxMzc1NjMsImV4cCI6MjA3NzcxMzU2M30.QylfRkiWzJ6rNbhxvbCsPskWZaH6_pYygMdvXYCTpJ4';

// Expose to window object for use in other scripts
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

// Initialize Supabase client and expose globally
// The CDN exposes createClient via window.supabase
const { createClient } = window.supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Expose the client globally as 'supabase'
window.supabase = supabaseClient;

// Also create a local reference for helper functions in this file
const supabase = supabaseClient;

// Helper function to get current user
async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

// Helper function to get user profile with role
async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error getting profile:', error);
        return null;
    }
    return data;
}

// Helper function to check if user is logged in
async function checkAuth() {
    const user = await getCurrentUser();
    if (!user) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// Helper function to sign out
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error signing out:', error);
    } else {
        window.location.href = 'login.html';
    }
}
