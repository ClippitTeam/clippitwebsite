// Investor Dashboard with Stripe Subscription Integration
// Subscription: $14.95/week to view opportunities
// Pay-per-offer: $20/offer to make offers

// Initialize Stripe (Replace with your publishable key)
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');

// Subscription state management
let subscriptionStatus = {
    isSubscribed: false, // Change to false for testing subscription flow
    subscriptionId: null,
    nextBillingDate: null,
    offerCredits: 0 // Track purchased offer credits
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    createModalContainer();
    
    // Check subscription status and update UI
    checkSubscriptionStatus();
    
    // Navigation interactions
    setupNavigation();
    
    // Quick action buttons
    setupQuickActions();
    
    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon.investor');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', showInvestorNotifications);
    }

    // Opportunity filter chips
    setupFilters();
});

// Initialize dashboard and check subscription
function initializeDashboard() {
    // Simulate checking subscription status
    // In production, this would call your backend API
    const storedStatus = localStorage.getItem('investorSubscription');
    if (storedStatus) {
        subscriptionStatus = JSON.parse(storedStatus);
    }
    
    updateSubscriptionBanner();
    updateOpportunitiesAccess();
}

// Check and update subscription status
function checkSubscriptionStatus() {
    // In production, this would verify with your backend/Stripe
    if (!subscriptionStatus.isSubscribed) {
        lockOpportunities();
    } else {
        unlockOpportunities();
    }
}

// Update subscription banner based on status
function updateSubscriptionBanner() {
    const banner = document.getElementById('subscriptionBanner');
    if (!banner) return;
    
    if (subscriptionStatus.isSubscribed) {
        // Active subscription
        const nextBilling = subscriptionStatus.nextBillingDate || 'Nov 28, 2025';
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">✅</div>
                <div class="banner-text">
                    <h3>Active Subscription</h3>
                    <p>$14.95/week • Next billing: ${nextBilling}</p>
                </div>
            </div>
            <button class="btn btn-secondary" onclick="showSubscriptionModal()">Manage</button>
        `;
        banner.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; border-radius: 12px; margin-bottom: 2rem;';
    } else {
        // No active subscription
        banner.innerHTML = `
            <div class="banner-content">
                <div class="banner-icon">🔒</div>
                <div class="banner-text">
                    <h3>Subscribe to View Opportunities</h3>
                    <p>Get access to investment opportunities for just $14.95/week</p>
                </div>
            </div>
            <button class="btn btn-primary" onclick="showSubscribeModal()">Subscribe Now</button>
        `;
        banner.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: rgba(245, 158, 11, 0.1); border: 1px solid #F59E0B; border-radius: 12px; margin-bottom: 2rem;';
    }
}

// Lock opportunities if not subscribed
function lockOpportunities() {
    const opportunityCards = document.querySelectorAll('.opportunity-card:not(.locked)');
    opportunityCards.forEach(card => {
        // Blur the content
        card.style.filter = 'blur(5px)';
        card.style.pointerEvents = 'none';
        card.style.position = 'relative';
        
        // Add lock overlay
        const overlay = document.createElement('div');
        overlay.className = 'subscription-lock-overlay';
        overlay.innerHTML = `
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; z-index: 10;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
                <h3 style="color: #F59E0B; margin-bottom: 0.5rem;">Subscribe to View</h3>
                <p style="color: #9CA3AF; margin-bottom: 1rem;">$14.95/week for full access</p>
                <button class="btn btn-primary" onclick="showSubscribeModal()" style="pointer-events: auto;">Subscribe Now</button>
            </div>
        `;
        overlay.style.cssText = 'position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(17, 24, 39, 0.95); border-radius: 12px; pointer-events: auto;';
        card.style.position = 'relative';
        card.appendChild(overlay);
    });
}

// Unlock opportunities for subscribers
function unlockOpportunities() {
    const opportunityCards = document.querySelectorAll('.opportunity-card:not(.locked)');
    opportunityCards.forEach(card => {
        card.style.filter = 'none';
        card.style.pointerEvents = 'auto';
        const overlay = card.querySelector('.subscription-lock-overlay');
        if (overlay) {
            overlay.remove();
        }
    });
}

// Update opportunities access
function updateOpportunitiesAccess() {
    if (subscriptionStatus.isSubscribed) {
        unlockOpportunities();
    } else {
        lockOpportunities();
    }
}

// Show subscribe modal
function showSubscribeModal() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                <h3 style="color: #F59E0B; font-size: 1.8rem; margin-bottom: 0.5rem;">Investor Access Subscription</h3>
                <p style="color: #9CA3AF;">Get full access to investment opportunities</p>
            </div>
            
            <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); padding: 2rem; border: 2px solid #F59E0B; border-radius: 12px;">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 3rem; font-weight: 800; color: #F59E0B; margin-bottom: 0.5rem;">$14.95</div>
                    <div style="color: #9CA3AF; font-size: 1.1rem;">per week</div>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981; font-size: 1.2rem;">✓</span>
                        <span style="color: #fff;">View all investment opportunities</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981; font-size: 1.2rem;">✓</span>
                        <span style="color: #fff;">Access detailed project information</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981; font-size: 1.2rem;">✓</span>
                        <span style="color: #fff;">Ask questions about opportunities</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981; font-size: 1.2rem;">✓</span>
                        <span style="color: #fff;">Cancel anytime</span>
                    </div>
                </div>
                
                <div style="background: rgba(17, 24, 39, 0.5); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-size: 0.875rem; color: #9CA3AF;">
                    <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Additional Fees:</strong></p>
                    <p style="margin-bottom: 0.25rem;">• $20 per offer (pay-as-you-go)</p>
                    <p>• No fee for actual investments</p>
                </div>
                
                <button onclick="processSubscription()" style="width: 100%; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 1rem; border: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem; cursor: pointer; margin-bottom: 0.75rem;">
                    Subscribe with Stripe
                </button>
                
                <p style="text-align: center; font-size: 0.75rem; color: #9CA3AF;">
                    Secure payment processing by Stripe. Billed weekly. Cancel anytime.
                </p>
            </div>
        </div>
    `;
    showModal('Subscribe to Investor Lounge', content);
}

// Process subscription with Stripe
async function processSubscription() {
    try {
        showNotification('Redirecting to Stripe Checkout...', 'info');
        
        // In production, you would:
        // 1. Call your backend to create a Stripe Checkout Session
        // 2. Redirect to Stripe Checkout
        // 3. Handle the webhook when payment succeeds
        
        // Example backend call:
        /*
        const response = await fetch('/create-subscription-checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                priceId: 'price_WEEKLY_SUBSCRIPTION_ID',
                userId: 'user_id_here'
            })
        });
        const session = await response.json();
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });
        */
        
        // For demo purposes, simulate successful subscription
        setTimeout(() => {
            subscriptionStatus.isSubscribed = true;
            subscriptionStatus.nextBillingDate = getNextWeek();
            localStorage.setItem('investorSubscription', JSON.stringify(subscriptionStatus));
            closeModal();
            showNotification('Subscription activated! Welcome to the Investor Lounge 🎉', 'success');
            updateSubscriptionBanner();
            unlockOpportunities();
        }, 2000);
        
    } catch (error) {
        console.error('Subscription error:', error);
        showNotification('Subscription failed. Please try again.', 'error');
    }
}

// Show make offer modal with pay-per-offer
function showOfferModal(opportunityName) {
    if (!subscriptionStatus.isSubscribed) {
        showNotification('Please subscribe to make offers', 'warning');
        showSubscribeModal();
        return;
    }
    
    const content = `
        <form onsubmit="submitOffer(event, '${opportunityName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem;">Make an Offer</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Project:</strong> ${opportunityName}</p>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Handled through Clippit Admin</p>
            </div>
            
            <div style="background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid #F59E0B;">
                <p style="color: #F59E0B; font-weight: 600; margin-bottom: 0.5rem;">💳 Offer Fee: $20</p>
                <p style="font-size: 0.875rem; color: #9CA3AF;">One-time fee to submit your offer. This fee covers administrative costs and ensures serious offers only.</p>
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Offer Amount (AUD)</label>
                <input type="number" id="offer-amount" required min="10000" step="1000" placeholder="500000" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Payment Terms</label>
                <select id="offer-terms" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="full">Full Payment Upfront</option>
                    <option value="installments">Installment Plan</option>
                    <option value="negotiable">Negotiable</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Proposal Details</label>
                <textarea id="offer-details" rows="5" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Describe your offer, timeline, and any conditions..."></textarea>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Pay $20 & Submit Offer</button>
        </form>
    `;
    showModal('🤝 Make Offer for ' + opportunityName, content);
}

// Submit offer with payment
async function submitOffer(e, opportunityName) {
    e.preventDefault();
    const amount = document.getElementById('offer-amount').value;
    
    closeModal();
    showNotification('Processing $20 payment...', 'info');
    
    try {
        // In production, create Stripe payment intent for $20
        /*
        const response = await fetch('/create-offer-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                opportunityName: opportunityName,
                offerAmount: amount,
                paymentAmount: 2000 // $20 in cents
            })
        });
        const {clientSecret} = await response.json();
        const result = await stripe.confirmCardPayment(clientSecret);
        */
        
        // Demo: simulate payment
        setTimeout(() => {
            showNotification(`Offer submitted! $${parseInt(amount).toLocaleString()} offer for ${opportunityName}`, 'success');
            setTimeout(() => {
                showNotification('Clippit Admin will review your offer within 48 hours', 'info');
            }, 2000);
        }, 1500);
        
    } catch (error) {
        showNotification('Payment failed. Please try again.', 'error');
    }
}

// Invest Modal (no fee for investments)
function showInvestModal(opportunityName) {
    if (!subscriptionStatus.isSubscribed) {
        showNotification('Please subscribe to invest', 'warning');
        showSubscribeModal();
        return;
    }
    
    const content = `
        <form onsubmit="submitInvestment(event, '${opportunityName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem;">Investment Opportunity</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Project:</strong> ${opportunityName}</p>
                <p style="font-size: 0.875rem; color: #9CA3AF;">All communications handled through Clippit Admin</p>
            </div>
            
            <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid #10B981;">
                <p style="color: #10B981; font-weight: 600; margin-bottom: 0.5rem;">✓ No Investment Fee</p>
                <p style="font-size: 0.875rem; color: #9CA3AF;">There is no fee for making investments - only for making offers on buyout opportunities.</p>
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Investment Amount (AUD)</label>
                <input type="number" id="invest-amount" required min="1000" step="1000" placeholder="10000" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Equity Percentage (if applicable)</label>
                <input type="number" id="invest-equity" min="0" max="100" step="0.1" placeholder="15" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Additional Terms or Questions</label>
                <textarea id="invest-message" rows="4" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Any specific conditions or questions..."></textarea>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p>⚠️ Your investment offer will be reviewed by Clippit Admin who will coordinate with the project owner. You'll receive a response within 48 hours.</p>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Submit Investment Offer</button>
        </form>
    `;
    showModal('💰 Invest in ' + opportunityName, content);
}

function submitInvestment(e, opportunityName) {
    e.preventDefault();
    const amount = document.getElementById('invest-amount').value;
    closeModal();
    showNotification(`Investment offer of $${parseInt(amount).toLocaleString()} submitted for ${opportunityName}!`, 'success');
}

// Subscription management modal
function showSubscriptionModal() {
    if (!subscriptionStatus.isSubscribed) {
        showSubscribeModal();
        return;
    }
    
    const nextBilling = subscriptionStatus.nextBillingDate || 'Nov 28, 2025';
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem;">Current Subscription</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Plan:</strong> Weekly Investor Access</p>
                <p style="margin-bottom: 0.5rem;"><strong>Price:</strong> $14.95/week</p>
                <p style="margin-bottom: 0.5rem;"><strong>Status:</strong> <span style="color: #10B981;">Active ✓</span></p>
                <p><strong>Next Billing:</strong> ${nextBilling}</p>
            </div>
            
            <div>
                <h3 style="color: #fff; margin-bottom: 1rem;">Manage Subscription</h3>
                <button onclick="manageSubscription('payment')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem;">💳 Update Payment Method</button>
                <button onclick="manageSubscription('cancel')" style="width: 100%; background: transparent; color: #EF4444; border: 1px solid #EF4444; padding: 0.75rem; border-radius: 8px; cursor: pointer;">Cancel Subscription</button>
            </div>
            
            <div style="background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Reminder:</strong></p>
                <p style="color: #9CA3AF;">• Canceling will keep access until ${nextBilling}</p>
                <p style="color: #9CA3AF;">• You can resubscribe anytime</p>
            </div>
        </div>
    `;
    showModal('💳 Subscription Management', content);
}

function manageSubscription(action) {
    closeModal();
    if (action === 'payment') {
        showNotification('Redirecting to payment settings...', 'info');
        // Would open Stripe customer portal
    } else if (action === 'cancel') {
        confirmCancellation();
    }
}

function confirmCancellation() {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">😢</div>
            <h3 style="color: #fff; margin-bottom: 1rem;">Cancel Subscription?</h3>
            <p style="color: #9CA3AF; margin-bottom: 2rem;">You'll lose access to investment opportunities after your current billing period ends.</p>
            <div style="display: flex; gap: 1rem;">
                <button onclick="closeModal()" style="flex: 1; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer;">Keep Subscription</button>
                <button onclick="processCancellation()" style="flex: 1; background: #EF4444; color: white; padding: 0.75rem; border: none; border-radius: 8px; cursor: pointer;">Confirm Cancel</button>
            </div>
        </div>
    `;
    showModal('Cancel Subscription', content);
}

function processCancellation() {
    // Would call backend to cancel Stripe subscription
    subscriptionStatus.isSubscribed = false;
    localStorage.setItem('investorSubscription', JSON.stringify(subscriptionStatus));
    closeModal();
    showNotification('Subscription canceled. Access remains until billing period ends.', 'info');
    setTimeout(() => {
        updateSubscriptionBanner();
        lockOpportunities();
    }, 2000);
}

// Question modal
function showQuestionModal(opportunityName) {
    if (!subscriptionStatus.isSubscribed) {
        showNotification('Please subscribe to ask questions', 'warning');
        showSubscribeModal();
        return;
    }
    
    const content = `
        <form onsubmit="submitQuestion(event, '${opportunityName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; margin-bottom: 0.5rem;">Ask Clippit Admin</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Your question about <strong>${opportunityName}</strong> will be sent to Clippit Admin.</p>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Your Question</label>
                <textarea id="question-text" rows="6" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="What would you like to know?"></textarea>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Send Question</button>
        </form>
    `;
    showModal('💬 Ask About ' + opportunityName, content);
}

function submitQuestion(e, opportunityName) {
    e.preventDefault();
    closeModal();
    showNotification(`Question sent to Clippit Admin about ${opportunityName}`, 'success');
}

// Helper functions
function getNextWeek() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.getAttribute('href').replace('#', '');
            showSection(section);
        });
    });
}

function showSection(sectionName) {
    // Hide all sections
    const allSections = document.querySelectorAll('.dashboard-section');
    allSections.forEach(section => section.style.display = 'none');
    
    // Show the requested section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update welcome message based on section
    const welcomeSection = document.querySelector('.dashboard-welcome');
    if (welcomeSection) {
        const titles = {
            'dashboard': 'Welcome to the Investor Lounge 💼',
            'opportunities': 'Investment Opportunities 💡',
            'my-investments': 'My Active Investments 💼',
            'messages': 'Messages 💬',
            'subscription': 'Subscription Management 💳',
            'settings': 'Account Settings ⚙️'
        };
        const subtitles = {
            'dashboard': 'Discover exclusive investment opportunities built by Clippit',
            'opportunities': 'Browse all available investment opportunities',
            'my-investments': 'Track your portfolio and investment performance',
            'messages': 'Communication with Clippit Admin and project owners',
            'subscription': 'Manage your subscription and billing',
            'settings': 'Update your profile and preferences'
        };
        welcomeSection.querySelector('h1').textContent = titles[sectionName] || titles['dashboard'];
        welcomeSection.querySelector('p').textContent = subtitles[sectionName] || subtitles['dashboard'];
    }
}

function setupQuickActions() {
    const quickActionBtns = document.querySelectorAll('.quick-action-btn.investor');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            if (title.includes('Subscription')) {
                showSubscriptionModal();
            }
        });
    });
}

function setupFilters() {
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Filtering: ${this.textContent}`, 'info');
        });
    });
}

function showInvestorNotifications() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="padding: 1rem; background: #111827; border: 1px solid #F59E0B; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">💬</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>Response to your question</strong></p>
                        <p style="font-size: 0.875rem;">Clippit Admin replied about FitTracker Pro</p>
                        <p style="font-size: 0.75rem; color: #F59E0B;">2 hours ago</p>
                    </div>
                </div>
            </div>
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">✨</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>New opportunity available</strong></p>
                        <p style="font-size: 0.875rem;">Healthcare SaaS platform added</p>
                        <p style="font-size: 0.75rem; color: #9CA3AF;">5 hours ago</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    showModal('🔔 Notifications', content);
}

// Modal system
function createModalContainer() {
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modal-container';
    modalContainer.style.cssText = 'display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; justify-content: center; align-items: center;';
    document.body.appendChild(modalContainer);
    
    modalContainer.addEventListener('click', function(e) {
        if (e.target === modalContainer) {
            closeModal();
        }
    });
}

function showModal(title, content) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div style="background: #1F2937; border: 1px solid #F59E0B; border-radius: 16px; padding: 2rem; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #F59E0B; font-size: 1.5rem;">${title}</h2>
                <button onclick="closeModal()" style="background: none; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div style="color: #9CA3AF;">${content}</div>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'none';
}

// Show notification toast
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#F59E0B',
        warning: '#F59E0B'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: #1F2937;
        color: #fff;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border-left: 4px solid ${colors[type]};
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Message system functions
function showMessageThread(threadId) {
    showNotification('Loading conversation...', 'info');
    // In production, this would load the actual thread from backend
}

function sendMessage() {
    const input = document.querySelector('#section-messages input[placeholder="Type your message..."]');
    if (!input || !input.value.trim()) {
        showNotification('Please enter a message', 'warning');
        return;
    }
    
    const message = input.value.trim();
    showNotification('Message sent to Clippit Admin', 'success');
    input.value = '';
    
    // In production, this would send the message to backend
}

function showNewMessageModal() {
    const content = `
        <form onsubmit="submitNewMessage(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Select Project</label>
                <select id="new-message-project" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="fittracker">FitTracker Pro</option>
                    <option value="ecomarket">EcoMarket Platform</option>
                    <option value="taskflow">TaskFlow SaaS</option>
                    <option value="medicconnect">MediConnect App</option>
                    <option value="edutech">EduTech Platform</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Subject</label>
                <input type="text" id="new-message-subject" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="What is your message about?">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Message</label>
                <textarea id="new-message-body" rows="6" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Type your message to Clippit Admin..."></textarea>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p style="color: #9CA3AF;">💬 Your message will be sent to Clippit Admin who will coordinate with the project owner.</p>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Send Message</button>
        </form>
    `;
    showModal('New Message', content);
}

function submitNewMessage(e) {
    e.preventDefault();
    const project = document.getElementById('new-message-project').value;
    const subject = document.getElementById('new-message-subject').value;
    closeModal();
    showNotification('Message sent successfully to Clippit Admin!', 'success');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);
