// Payment Integration Module
// Handles Stripe checkout and payment processing for customer invoices

let customerInvoices = [];

// Initialize payment system
async function initializePayments() {
    await loadCustomerInvoices();
}

// Load customer's invoices
async function loadCustomerInvoices() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Load invoices from database
        const { data, error } = await supabase
            .from('invoices')
            .select(`
                *,
                line_items:invoice_line_items(*),
                payments:invoice_payments(*),
                transactions:payment_transactions(*)
            `)
            .eq('client_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        customerInvoices = data || [];
        displayCustomerInvoices(customerInvoices);
        updatePaymentStats();

    } catch (error) {
        console.error('Error loading invoices:', error);
        showNotification('Failed to load invoices', 'error');
    }
}

// Display invoices for customer
function displayCustomerInvoices(invoices) {
    const container = document.getElementById('customer-invoices-container');
    if (!container) return;

    if (invoices.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #9CA3AF;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">No invoices yet</p>
                <p style="font-size: 0.875rem;">Your invoices will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = invoices.map(invoice => {
        const statusColors = {
            draft: '#6B7280',
            sent: '#3B82F6',
            paid: '#10B981',
            overdue: '#EF4444',
            cancelled: '#9CA3AF'
        };

        const statusColor = statusColors[invoice.status] || '#6B7280';
        const isPayable = ['sent', 'overdue'].includes(invoice.status) && invoice.amount_due > 0;

        return `
            <div class="invoice-card" style="background: #1F2937; border: 1px solid #374151; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="color: #40E0D0; font-size: 1.25rem; margin: 0 0 0.5rem 0;">${invoice.invoice_number}</h3>
                        <span style="display: inline-block; padding: 0.375rem 0.75rem; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${invoice.status}</span>
                    </div>
                    <div style="text-align: right;">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0;">Total Amount</p>
                        <p style="color: #40E0D0; font-size: 2rem; font-weight: 800; margin: 0.25rem 0;">$${parseFloat(invoice.total_amount).toFixed(2)}</p>
                        ${invoice.amount_due > 0 ? `
                            <p style="color: #F59E0B; font-size: 0.875rem; margin: 0;">Due: $${parseFloat(invoice.amount_due).toFixed(2)}</p>
                        ` : `
                            <p style="color: #10B981; font-size: 0.875rem; margin: 0;">✓ Paid</p>
                        `}
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; padding: 1rem; background: #111827; border-radius: 8px;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.75rem; margin: 0;">Issue Date</p>
                        <p style="color: #fff; margin: 0.25rem 0 0 0;">${new Date(invoice.issue_date).toLocaleDateString('en-AU')}</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.75rem; margin: 0;">Due Date</p>
                        <p style="color: ${invoice.status === 'overdue' ? '#EF4444' : '#fff'}; margin: 0.25rem 0 0 0;">${new Date(invoice.due_date).toLocaleDateString('en-AU')}</p>
                    </div>
                </div>

                ${invoice.line_items && invoice.line_items.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <h4 style="color: #fff; font-size: 0.875rem; margin: 0 0 0.5rem 0;">Items</h4>
                    ${invoice.line_items.slice(0, 3).map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #374151;">
                            <span style="color: #9CA3AF; font-size: 0.875rem;">${item.description}</span>
                            <span style="color: #fff; font-weight: 600;">$${parseFloat(item.amount).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    ${invoice.line_items.length > 3 ? `<p style="color: #40E0D0; font-size: 0.75rem; margin: 0.5rem 0 0 0;">+${invoice.line_items.length - 3} more items</p>` : ''}
                </div>
                ` : ''}

                <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
                    <button onclick="viewInvoiceDetails('${invoice.id}')" style="flex: 1; min-width: 150px; padding: 0.75rem 1.5rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        📄 View Details
                    </button>
                    
                    ${isPayable ? `
                        <button onclick="initiatePayment('${invoice.id}')" style="flex: 1; min-width: 150px; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(64, 224, 208, 0.3);">
                            💳 Pay Now
                        </button>
                    ` : ''}
                    
                    ${invoice.status === 'paid' ? `
                        <button onclick="downloadReceipt('${invoice.id}')" style="flex: 1; min-width: 150px; padding: 0.75rem 1.5rem; background: #10B981; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                            📥 Download Receipt
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Initiate payment for an invoice
async function initiatePayment(invoiceId) {
    try {
        showNotification('Preparing secure checkout...', 'info');

        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            throw new Error('Please log in to make a payment');
        }

        // Call Stripe checkout edge function
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/create-stripe-checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                invoiceId: invoiceId
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe checkout
        if (result.checkoutUrl) {
            showNotification('Redirecting to secure payment...', 'success');
            window.location.href = result.checkoutUrl;
        } else {
            throw new Error('No checkout URL received');
        }

    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment error: ' + error.message, 'error');
    }
}

// View invoice details (can be shared with admin view or customer-specific)
async function viewCustomerInvoiceDetails(invoiceId) {
    try {
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select(`
                *,
                line_items:invoice_line_items(*),
                payments:invoice_payments(*),
                transactions:payment_transactions(*)
            `)
            .eq('id', invoiceId)
            .single();

        if (error) throw error;

        const statusColors = {
            draft: '#6B7280',
            sent: '#3B82F6',
            paid: '#10B981',
            overdue: '#EF4444',
            cancelled: '#9CA3AF'
        };

        const statusColor = statusColors[invoice.status] || '#6B7280';
        const isPayable = ['sent', 'overdue'].includes(invoice.status) && invoice.amount_due > 0;

        const content = `
            <div style="max-height: 70vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                    <div>
                        <h2 style="color: #40E0D0; margin: 0 0 0.5rem 0;">${invoice.invoice_number}</h2>
                        <span style="display: inline-block; padding: 0.375rem 0.75rem; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}; border-radius: 6px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">${invoice.status}</span>
                    </div>
                    <div style="text-align: right;">
                        <p style="color: #40E0D0; font-size: 2rem; font-weight: 800; margin: 0;">$${parseFloat(invoice.total_amount).toFixed(2)}</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0.25rem 0 0 0;">Amount Due: $${parseFloat(invoice.amount_due).toFixed(2)}</p>
                    </div>
                </div>

                <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h4 style="color: #fff; margin: 0 0 1rem 0;">Invoice Details</h4>
                    <p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Issue Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString('en-AU')}</p>
                    <p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString('en-AU')}</p>
                    ${invoice.sent_at ? `<p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Sent:</strong> ${new Date(invoice.sent_at).toLocaleDateString('en-AU')}</p>` : ''}
                    ${invoice.paid_at ? `<p style="color: #10B981; margin: 0.25rem 0;"><strong>Paid:</strong> ${new Date(invoice.paid_at).toLocaleDateString('en-AU')}</p>` : ''}
                </div>

                <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <h4 style="color: #fff; margin: 0 0 1rem 0;">Line Items</h4>
                    ${invoice.line_items.map(item => `
                        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #374151;">
                            <div style="flex: 1;">
                                <p style="color: #fff; margin: 0;">${item.description}</p>
                                <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0.25rem 0 0 0;">${item.quantity} × $${parseFloat(item.unit_price).toFixed(2)}</p>
                            </div>
                            <p style="color: #40E0D0; font-weight: 600; margin: 0;">$${parseFloat(item.amount).toFixed(2)}</p>
                        </div>
                    `).join('')}
                    
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #374151;">
                        <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                            <span style="color: #9CA3AF;">Subtotal:</span>
                            <span style="color: #fff; font-weight: 600;">$${parseFloat(invoice.subtotal).toFixed(2)}</span>
                        </div>
                        ${invoice.tax_amount > 0 ? `
                        <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                            <span style="color: #9CA3AF;">GST (${invoice.tax_rate}%):</span>
                            <span style="color: #fff; font-weight: 600;">$${parseFloat(invoice.tax_amount).toFixed(2)}</span>
                        </div>
                        ` : ''}
                        <div style="display: flex; justify-content: space-between; margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #374151;">
                            <span style="color: #40E0D0; font-size: 1.25rem; font-weight: 700;">Total:</span>
                            <span style="color: #40E0D0; font-size: 1.25rem; font-weight: 800;">$${parseFloat(invoice.total_amount).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                ${invoice.payments && invoice.payments.length > 0 ? `
                <div style="background: #D1FAE5; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #10B981; margin-bottom: 1.5rem;">
                    <h4 style="color: #065F46; margin: 0 0 1rem 0;">✓ Payment History</h4>
                    ${invoice.payments.map(payment => `
                        <div style="display: flex; justify-content: space-between; color: #065F46; margin: 0.5rem 0;">
                            <span>${new Date(payment.payment_date).toLocaleDateString('en-AU')} - ${payment.payment_method}</span>
                            <strong>$${parseFloat(payment.amount).toFixed(2)}</strong>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${invoice.payment_instructions ? `
                <div style="background: #FEF3C7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 1.5rem;">
                    <h4 style="color: #92400E; margin: 0 0 0.5rem 0;">Payment Instructions</h4>
                    <p style="color: #78350F; margin: 0; white-space: pre-line;">${invoice.payment_instructions}</p>
                </div>
                ` : ''}

                ${invoice.notes ? `
                <div style="background: #E0F2FE; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #3B82F6; margin-bottom: 1.5rem;">
                    <h4 style="color: #1E40AF; margin: 0 0 0.5rem 0;">Notes</h4>
                    <p style="color: #1E3A8A; margin: 0; white-space: pre-line;">${invoice.notes}</p>
                </div>
                ` : ''}

                <div style="display: flex; gap: 0.75rem; margin-top: 2rem; flex-wrap: wrap;">
                    ${isPayable ? `
                        <button onclick="closeModal(); initiatePayment('${invoice.id}')" style="flex: 1; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(64, 224, 208, 0.3);">💳 Pay Now</button>
                    ` : ''}
                    ${invoice.status === 'paid' ? `
                        <button onclick="downloadReceipt('${invoice.id}')" style="flex: 1; padding: 0.75rem 1.5rem; background: #10B981; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">📥 Download Receipt</button>
                    ` : ''}
                    <button onclick="closeModal()" style="flex: 1; padding: 0.75rem 1.5rem; background: #374151; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
                </div>
            </div>
        `;

        showModal('Invoice Details', content);

    } catch (error) {
        console.error('Error viewing invoice:', error);
        showNotification('Failed to load invoice details', 'error');
    }
}

// Update payment statistics
function updatePaymentStats() {
    const stats = {
        total: customerInvoices.length,
        paid: customerInvoices.filter(i => i.status === 'paid').length,
        pending: customerInvoices.filter(i => ['sent', 'overdue'].includes(i.status)).length,
        overdue: customerInvoices.filter(i => i.status === 'overdue').length,
        totalOwed: customerInvoices
            .filter(i => ['sent', 'overdue'].includes(i.status))
            .reduce((sum, i) => sum + parseFloat(i.amount_due), 0),
        totalPaid: customerInvoices
            .filter(i => i.status === 'paid')
            .reduce((sum, i) => sum + parseFloat(i.total_amount), 0)
    };

    // Update stats in UI if container exists
    const statsContainer = document.querySelector('.payment-stats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="stat-card">
                <span class="stat-label">Total Invoices</span>
                <span class="stat-value">${stats.total}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Paid</span>
                <span class="stat-value" style="color: #10B981;">${stats.paid}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Pending</span>
                <span class="stat-value" style="color: #F59E0B;">${stats.pending}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Overdue</span>
                <span class="stat-value" style="color: #EF4444;">${stats.overdue}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Amount Owed</span>
                <span class="stat-value" style="color: #F59E0B;">$${stats.totalOwed.toFixed(2)}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Total Paid</span>
                <span class="stat-value" style="color: #10B981;">$${stats.totalPaid.toFixed(2)}</span>
            </div>
        `;
    }
}

// Download receipt (placeholder - you can implement PDF generation)
function downloadReceipt(invoiceId) {
    showNotification('Receipt download feature coming soon!', 'info');
    // TODO: Implement PDF receipt generation
}

// Check for payment success on page load (from redirect)
function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentCancelled = urlParams.get('payment_cancelled');
    const invoiceId = urlParams.get('invoice_id');

    if (paymentCancelled === 'true') {
        showNotification('Payment was cancelled. You can try again anytime.', 'info');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// Initialize on page load if on customer dashboard
if (document.getElementById('customer-invoices-container')) {
    checkPaymentStatus();
}
