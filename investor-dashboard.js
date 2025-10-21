// Investor Dashboard Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Create modal container
    createModalContainer();
    
    // Navigation interactions
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.querySelector('.nav-label').textContent;
            showNotification(`Navigating to ${section}...`, 'info');
        });
    });

    // Quick action buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn.investor');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            if (title.includes('Subscription')) {
                showSubscriptionModal();
            } else if (title.includes('Upgrade')) {
                showUpgradeTierModal();
            }
        });
    });

    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon.investor');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', showInvestorNotifications);
    });

    // Opportunity filter chips
    const filterChips = document.querySelectorAll('.filter-chip');
    filterChips.forEach(chip => {
        chip.addEventListener('click', function() {
            filterChips.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            showNotification(`Filtering: ${this.textContent}`, 'info');
        });
    });
});

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

// Invest Modal
function showInvestModal(opportunityName) {
    const content = `
        <form onsubmit="submitInvestment(event, '${opportunityName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem;">Investment Opportunity</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Project:</strong> ${opportunityName}</p>
                <p style="font-size: 0.875rem; color: #9CA3AF;">All communications will be handled through Clippit Admin</p>
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
                <p>⚠️ Your offer will be reviewed by Clippit Admin who will coordinate with the project owner. You'll receive a response within 48 hours.</p>
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

// Make Offer Modal
function showOfferModal(opportunityName) {
    const content = `
        <form onsubmit="submitOffer(event, '${opportunityName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem;">Buyout Opportunity</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Project:</strong> ${opportunityName}</p>
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
            <button type="submit" style="background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Submit Buyout Offer</button>
        </form>
    `;
    showModal('🤝 Make Offer for ' + opportunityName, content);
}

function submitOffer(e, opportunityName) {
    e.preventDefault();
    const amount = document.getElementById('offer-amount').value;
    closeModal();
    showNotification(`Buyout offer of $${parseInt(amount).toLocaleString()} submitted for ${opportunityName}!`, 'success');
}

// Ask Question Modal
function showQuestionModal(opportunityName) {
    const content = `
        <form onsubmit="submitQuestion(event, '${opportunityName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; margin-bottom: 0.5rem;">Ask Clippit Admin</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Your question about <strong>${opportunityName}</strong> will be sent to Clippit Admin who will coordinate with the project owner.</p>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Your Question</label>
                <textarea id="question-text" rows="6" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="What would you like to know about this opportunity?"></textarea>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p>💬 All communications are handled by Clippit Admin to maintain confidentiality and professionalism.</p>
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

// Upgrade Tier Modal
function showUpgradeTierModal() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <h3 style="color: #F59E0B; font-size: 1.5rem; margin-bottom: 0.5rem;">Upgrade Your Subscription</h3>
                <p>Access more investment opportunities with a higher tier</p>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="tier-option" onclick="selectTier('standard')" style="padding: 1.5rem; background: #111827; border: 2px solid #4B5563; border-radius: 12px; cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #F59E0B;">Standard Access</h4>
                        <span style="color: #F59E0B; font-size: 1.5rem; font-weight: 800;">$10/mo</span>
                    </div>
                    <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">Access to 8 start-up opportunities</p>
                    <p style="font-size: 0.75rem; color: #9CA3AF;">Current Plan</p>
                </div>

                <div class="tier-option" onclick="selectTier('enhanced')" style="padding: 1.5rem; background: #111827; border: 2px solid #F59E0B; border-radius: 12px; cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #F59E0B;">Enhanced Access</h4>
                        <span style="color: #F59E0B; font-size: 1.5rem; font-weight: 800;">$15/mo</span>
                    </div>
                    <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">Access to 15 opportunities</p>
                    <p style="font-size: 0.75rem; color: #10B981;">⭐ Popular Choice</p>
                </div>

                <div class="tier-option" onclick="selectTier('top-tier')" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border: 2px solid #F59E0B; border-radius: 12px; cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <h4 style="color: #F59E0B;">Top Tier Access</h4>
                        <span style="color: #F59E0B; font-size: 1.5rem; font-weight: 800;">$100/mo</span>
                    </div>
                    <p style="font-size: 0.875rem; margin-bottom: 0.5rem;">5 premium, global investment opportunities</p>
                    <p style="font-size: 0.75rem; color: #F59E0B;">🔥 Exclusive High-Value Projects</p>
                </div>
            </div>
        </div>
    `;
    showModal('⭐ Upgrade Subscription Tier', content);
}

function selectTier(tier) {
    const tiers = {
        'standard': { name: 'Standard Access', price: '$10/mo', opportunities: '8' },
        'enhanced': { name: 'Enhanced Access', price: '$15/mo', opportunities: '15' },
        'top-tier': { name: 'Top Tier Access', price: '$100/mo', opportunities: '5 premium' }
    };
    
    const selected = tiers[tier];
    closeModal();
    
    if (tier === 'standard') {
        showNotification('You are already on the Standard tier', 'info');
    } else {
        showNotification(`Upgrading to ${selected.name} (${selected.opportunities} opportunities)`, 'success');
        setTimeout(() => {
            showNotification('Payment processing... Upgrade will be active immediately', 'info');
        }, 1500);
    }
}

// Subscription Modal
function showSubscriptionModal() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #F59E0B;">
                <h3 style="color: #F59E0B; margin-bottom: 1rem;">Current Subscription</h3>
                <p style="margin-bottom: 0.5rem;"><strong>Tier:</strong> Standard Access</p>
                <p style="margin-bottom: 0.5rem;"><strong>Price:</strong> $10/month</p>
                <p style="margin-bottom: 0.5rem;"><strong>Opportunities:</strong> 8 active</p>
                <p><strong>Next Billing:</strong> November 21, 2025</p>
            </div>
            
            <div>
                <h3 style="color: #fff; margin-bottom: 1rem;">Manage Subscription</h3>
                <button onclick="manageSubscription('upgrade')" style="width: 100%; background: linear-gradient(135deg, #F59E0B, #D97706); color: white; padding: 0.75rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin-bottom: 0.5rem;">⭐ Upgrade Tier</button>
                <button onclick="manageSubscription('payment')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; margin-bottom: 0.5rem;">💳 Update Payment Method</button>
                <button onclick="manageSubscription('cancel')" style="width: 100%; background: transparent; color: #EF4444; border: 1px solid #EF4444; padding: 0.75rem; border-radius: 8px; cursor: pointer;">Cancel Subscription</button>
            </div>
        </div>
    `;
    showModal('💳 Subscription Management', content);
}

function manageSubscription(action) {
    closeModal();
    if (action === 'upgrade') {
        showUpgradeTierModal();
    } else if (action === 'payment') {
        showNotification('Opening payment method settings...', 'info');
    } else if (action === 'cancel') {
        showNotification('Subscription cancellation requires confirmation', 'warning');
    }
}

// Investor Notifications
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
            <button onclick="closeModal()" style="background: transparent; color: #F59E0B; border: 1px solid #F59E0B; padding: 0.75rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">Mark all as read</button>
        </div>
    `;
    showModal('🔔 Notifications', content);
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
