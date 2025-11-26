// Invoices Management System
// Handles invoice creation, editing, payment tracking, and email sending

let invoices = [];
let currentInvoiceId = null;

// Initialize invoices when the tab is shown
async function initializeInvoices() {
    await loadInvoices();
    await loadClientsForInvoiceDropdown();
}

// Load all invoices from database
async function loadInvoices() {
    try {
        const { data, error } = await supabase
            .from('invoice_summary')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        invoices = data || [];
        displayInvoices(invoices);
        updateInvoiceStats();
    } catch (error) {
        console.error('Error loading invoices:', error);
        showNotification('Failed to load invoices', 'error');
    }
}

// Display invoices in the list
function displayInvoices(invoicesToDisplay) {
    const container = document.getElementById('invoices-list-container');
    if (!container) return;

    const invoicesList = container.querySelector('#invoices-list') || createInvoicesList();

    if (invoicesToDisplay.length === 0) {
        invoicesList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #9CA3AF;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">📄</div>
                <p style="font-size: 1.125rem; margin-bottom: 0.5rem;">No invoices yet</p>
                <p style="font-size: 0.875rem;">Click "Create New Invoice" to get started</p>
            </div>
        `;
        return;
    }

    invoicesList.innerHTML = invoicesToDisplay.map(invoice => {
        const statusColors = {
            draft: '#6B7280',
            sent: '#3B82F6',
            paid: '#10B981',
            overdue: '#EF4444',
            cancelled: '#9CA3AF',
            refunded: '#F59E0B'
        };

        const statusColor = statusColors[invoice.status] || '#6B7280';
        const daysOverdue = invoice.days_overdue || 0;

        return `
            <div class="invoice-row" data-invoice-id="${invoice.id}" style="display: grid; grid-template-columns: 2fr 2fr 1.5fr 1.5fr 1fr auto; gap: 1rem; padding: 1.25rem; background: #111827; border: 1px solid #374151; border-radius: 8px; margin-bottom: 0.75rem; align-items: center; cursor: pointer; transition: all 0.2s;">
                <div>
                    <h4 style="color: #40E0D0; font-size: 1rem; margin-bottom: 0.25rem;">${invoice.invoice_number}</h4>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0;">${invoice.client_name || 'No Client'}</p>
                    ${invoice.client_company ? `<p style="color: #6B7280; font-size: 0.75rem; margin: 0.125rem 0 0 0;">${invoice.client_company}</p>` : ''}
                </div>
                <div>
                    ${invoice.project_name ? `<p style="color: #fff; font-size: 0.875rem; margin: 0 0 0.25rem 0;">📁 ${invoice.project_name}</p>` : ''}
                    <p style="color: #9CA3AF; font-size: 0.75rem; margin: 0;">Issued: ${new Date(invoice.issue_date).toLocaleDateString('en-AU')}</p>
                    <p style="color: ${daysOverdue > 0 ? '#EF4444' : '#9CA3AF'}; font-size: 0.75rem; margin: 0;">Due: ${new Date(invoice.due_date).toLocaleDateString('en-AU')}</p>
                </div>
                <div>
                    <p style="color: #9CA3AF; font-size: 0.75rem; margin: 0 0 0.25rem 0;">Total</p>
                    <p style="color: #fff; font-size: 1.125rem; font-weight: 700; margin: 0;">$${parseFloat(invoice.total_amount).toFixed(2)}</p>
                </div>
                <div>
                    <p style="color: #9CA3AF; font-size: 0.75rem; margin: 0 0 0.25rem 0;">Amount Due</p>
                    <p style="color: ${invoice.status === 'paid' ? '#10B981' : '#F59E0B'}; font-size: 1rem; font-weight: 700; margin: 0;">$${parseFloat(invoice.amount_due).toFixed(2)}</p>
                </div>
                <div>
                    <span style="display: inline-block; padding: 0.375rem 0.75rem; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${invoice.status}</span>
                    ${daysOverdue > 0 ? `<p style="color: #EF4444; font-size: 0.625rem; margin: 0.25rem 0 0 0; font-weight: 600;">${daysOverdue} days overdue</p>` : ''}
                </div>
                <button onclick="event.stopPropagation(); showInvoiceMenu('${invoice.id}')" style="padding: 0.5rem; background: transparent; border: 1px solid #4B5563; border-radius: 6px; color: #9CA3AF; cursor: pointer; transition: all 0.2s;">⋮</button>
            </div>
        `;
    }).join('');

    // Add click handlers
    document.querySelectorAll('.invoice-row').forEach(row => {
        row.addEventListener('click', () => {
            const invoiceId = row.dataset.invoiceId;
            viewInvoiceDetails(invoiceId);
        });
    });
}

function createInvoicesList() {
    const container = document.getElementById('invoices-list-container');
    const listDiv = document.createElement('div');
    listDiv.id = 'invoices-list';
    container.appendChild(listDiv);
    return listDiv;
}

// Update invoice statistics
function updateInvoiceStats() {
    const stats = {
        total: invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        paid: invoices.filter(i => i.status === 'paid').length,
        overdue: invoices.filter(i => i.status === 'overdue').length,
        totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + parseFloat(i.total_amount), 0),
        pendingRevenue: invoices.filter(i => ['sent', 'overdue'].includes(i.status)).reduce((sum, i) => sum + parseFloat(i.amount_due), 0)
    };

    // Update stats in UI if stats elements exist
    const statsContainer = document.querySelector('.invoice-stats');
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
                <span class="stat-value" style="color: #F59E0B;">${stats.sent}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Overdue</span>
                <span class="stat-value" style="color: #EF4444;">${stats.overdue}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Total Revenue</span>
                <span class="stat-value" style="color: #40E0D0;">$${stats.totalRevenue.toFixed(2)}</span>
            </div>
            <div class="stat-card">
                <span class="stat-label">Pending Amount</span>
                <span class="stat-value" style="color: #F59E0B;">$${stats.pendingRevenue.toFixed(2)}</span>
            </div>
        `;
    }
}

// Load clients for invoice dropdown
async function loadClientsForInvoiceDropdown() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email, company')
            .eq('role', 'customer')
            .order('full_name');

        if (error) throw error;

        const select = document.getElementById('invoice-client');
        if (select) {
            select.innerHTML = '<option value="">Select Client</option>' +
                data.map(client => `
                    <option value="${client.id}" data-name="${client.full_name}" data-email="${client.email}" data-company="${client.company || ''}">
                        ${client.full_name}${client.company ? ` (${client.company})` : ''}
                    </option>
                `).join('');
        }
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Show create invoice modal
async function showCreateInvoiceModal() {
    await loadClientsForInvoiceDropdown();
    
    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const content = `
        <form id="create-invoice-form" style="max-height: 70vh; overflow-y: auto; padding-right: 1rem;">
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem;">Create New Invoice</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client *</label>
                        <select id="invoice-client" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                            <option value="">Select Client</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project (Optional)</label>
                        <select id="invoice-project" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                            <option value="">No Project</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Invoice Number *</label>
                        <input type="text" id="invoice-number" value="${invoiceNumber}" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Issue Date *</label>
                        <input type="date" id="invoice-issue-date" value="${today}" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Due Date *</label>
                        <input type="date" id="invoice-due-date" value="${dueDateStr}" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                </div>

                <h4 style="color: #fff; margin: 1.5rem 0 1rem 0;">Line Items</h4>
                <div id="invoice-line-items">
                    <div class="invoice-line-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;">
                        <input type="text" placeholder="Description" required style="padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <input type="number" placeholder="Qty" value="1" min="0.01" step="0.01" required style="padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <input type="number" placeholder="Price" min="0" step="0.01" required onchange="calculateInvoiceTotal()" style="padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <input type="text" placeholder="$0.00" readonly style="padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #40E0D0; font-weight: 600;">
                        <button type="button" onclick="removeInvoiceLineItem(this)" style="padding: 0.75rem; background: #EF4444; border: none; border-radius: 8px; color: #fff; cursor: pointer;">🗑️</button>
                    </div>
                </div>
                
                <button type="button" onclick="addInvoiceLineItem()" style="padding: 0.75rem 1.5rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; cursor: pointer; margin-bottom: 1.5rem;">+ Add Line Item</button>

                <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem;">
                        <span style="color: #9CA3AF;">Subtotal:</span>
                        <span id="invoice-subtotal" style="color: #fff; font-weight: 600;">$0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                        <label style="color: #9CA3AF; display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" id="include-gst" checked onchange="calculateInvoiceTotal()">
                            GST (10%):
                        </label>
                        <span id="invoice-gst" style="color: #fff; font-weight: 600;">$0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-top: 0.75rem; border-top: 2px solid #374151;">
                        <span style="color: #40E0D0; font-size: 1.25rem; font-weight: 700;">TOTAL:</span>
                        <span id="invoice-total" style="color: #40E0D0; font-size: 1.5rem; font-weight: 800;">$0.00</span>
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Payment Instructions (Optional)</label>
                    <textarea id="invoice-payment-instructions" rows="2" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Bank details, payment methods, etc."></textarea>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Notes (Optional)</label>
                    <textarea id="invoice-notes" rows="2" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Additional notes for the client..."></textarea>
                </div>
            </div>

            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button type="button" onclick="saveInvoice('draft')" style="flex: 1; padding: 0.75rem 1.5rem; background: #374151; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Save as Draft</button>
                <button type="submit" style="flex: 1; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Create & Send</button>
            </div>
        </form>
    `;

    showModal('Create Invoice', content);

    // Load projects for selected client
    document.getElementById('invoice-client')?.addEventListener('change', async (e) => {
        const clientId = e.target.value;
        if (clientId) {
            await loadProjectsForClient(clientId);
        }
    });

    // Form submit handler
    document.getElementById('create-invoice-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveInvoice('sent');
    });

    // Calculate initial total
    setTimeout(() => calculateInvoiceTotal(), 100);
}

// Generate unique invoice number
async function generateInvoiceNumber() {
    try {
        const { data, error } = await supabase.rpc('generate_invoice_number');
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error generating invoice number:', error);
        // Fallback to timestamp-based number
        const year = new Date().getFullYear().toString().slice(-2);
        const timestamp = Date.now().toString().slice(-6);
        return `INV-${year}-${timestamp}`;
    }
}

// Load projects for a client
async function loadProjectsForClient(clientId) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('id, name')
            .eq('client_id', clientId)
            .order('name');

        if (error) throw error;

        const select = document.getElementById('invoice-project');
        if (select) {
            select.innerHTML = '<option value="">No Project</option>' +
                data.map(project => `<option value="${project.id}">${project.name}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// Add invoice line item
function addInvoiceLineItem() {
    const container = document.getElementById('invoice-line-items');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-line-item';
    newItem.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;';
    
    newItem.innerHTML = `
        <input type="text" placeholder="Description" required style="padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
        <input type="number" placeholder="Qty" value="1" min="0.01" step="0.01" required style="padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
        <input type="number" placeholder="Price" min="0" step="0.01" required onchange="calculateInvoiceTotal()" style="padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
        <input type="text" placeholder="$0.00" readonly style="padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #40E0D0; font-weight: 600;">
        <button type="button" onclick="removeInvoiceLineItem(this)" style="padding: 0.75rem; background: #EF4444; border: none; border-radius: 8px; color: #fff; cursor: pointer;">🗑️</button>
    `;
    
    container.appendChild(newItem);
    calculateInvoiceTotal();
}

// Remove invoice line item
function removeInvoiceLineItem(button) {
    const items = document.querySelectorAll('.invoice-line-item');
    if (items.length > 1) {
        button.closest('.invoice-line-item').remove();
        calculateInvoiceTotal();
    } else {
        showNotification('At least one line item is required', 'error');
    }
}

// Calculate invoice total
function calculateInvoiceTotal() {
    const items = document.querySelectorAll('.invoice-line-item');
    let subtotal = 0;

    items.forEach(item => {
        const qty = parseFloat(item.querySelectorAll('input')[1].value) || 0;
        const price = parseFloat(item.querySelectorAll('input')[2].value) || 0;
        const amount = qty * price;
        item.querySelectorAll('input')[3].value = `$${amount.toFixed(2)}`;
        subtotal += amount;
    });

    document.getElementById('invoice-subtotal').textContent = `$${subtotal.toFixed(2)}`;

    const includeGst = document.getElementById('include-gst')?.checked !== false;
    const gst = includeGst ? subtotal * 0.1 : 0;
    document.getElementById('invoice-gst').textContent = `$${gst.toFixed(2)}`;

    const total = subtotal + gst;
    document.getElementById('invoice-total').textContent = `$${total.toFixed(2)}`;
}

// Save invoice
async function saveInvoice(status = 'draft') {
    try {
        const clientId = document.getElementById('invoice-client').value;
        const projectId = document.getElementById('invoice-project').value || null;
        const invoiceNumber = document.getElementById('invoice-number').value;
        const issueDate = document.getElementById('invoice-issue-date').value;
        const dueDate = document.getElementById('invoice-due-date').value;
        const notes = document.getElementById('invoice-notes').value;
        const paymentInstructions = document.getElementById('invoice-payment-instructions').value;
        const includeGst = document.getElementById('include-gst')?.checked !== false;

        if (!clientId || !invoiceNumber || !issueDate || !dueDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Get line items
        const lineItemsElements = document.querySelectorAll('.invoice-line-item');
        const lineItems = Array.from(lineItemsElements).map((item, index) => {
            const inputs = item.querySelectorAll('input');
            const description = inputs[0].value;
            const quantity = parseFloat(inputs[1].value);
            const unitPrice = parseFloat(inputs[2].value);
            
            return {
                description,
                quantity,
                unit_price: unitPrice,
                amount: quantity * unitPrice,
                line_order: index
            };
        });

        if (lineItems.length === 0 || lineItems.some(item => !item.description || item.quantity <= 0 || item.unit_price < 0)) {
            showNotification('Please complete all line items', 'error');
            return;
        }

        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const taxRate = includeGst ? 10.00 : 0;
        const taxAmount = subtotal * (taxRate / 100);
        const totalAmount = subtotal + taxAmount;

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceNumber,
                client_id: clientId,
                project_id: projectId,
                issue_date: issueDate,
                due_date: dueDate,
                subtotal: subtotal,
                tax_rate: taxRate,
                tax_amount: taxAmount,
                total_amount: totalAmount,
                amount_due: totalAmount,
                status: status,
                notes: notes,
                payment_instructions: paymentInstructions,
                created_by: user.id
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Create line items
        const lineItemsWithInvoiceId = lineItems.map(item => ({
            ...item,
            invoice_id: invoice.id
        }));

        const { error: lineItemsError } = await supabase
            .from('invoice_line_items')
            .insert(lineItemsWithInvoiceId);

        if (lineItemsError) throw lineItemsError;

        closeModal();
        showNotification(`Invoice ${invoiceNumber} ${status === 'sent' ? 'created and will be sent' : 'saved as draft'}!`, 'success');
        
        await loadInvoices();

        // If status is 'sent', send the email
        if (status === 'sent') {
            await sendInvoiceEmail(invoice.id, 'initial');
        }

    } catch (error) {
        console.error('Error saving invoice:', error);
        showNotification('Failed to save invoice: ' + error.message, 'error');
    }
}

// Send invoice email
async function sendInvoiceEmail(invoiceId, emailType = 'initial') {
    try {
        showNotification('Sending invoice email...', 'info');

        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`${supabase.supabaseUrl}/functions/v1/send-invoice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({
                invoiceId: invoiceId,
                emailType: emailType
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to send email');
        }

        showNotification('Invoice email sent successfully!', 'success');
        await loadInvoices();

    } catch (error) {
        console.error('Error sending invoice email:', error);
        showNotification('Failed to send invoice email: ' + error.message, 'error');
    }
}

// View invoice details
async function viewInvoiceDetails(invoiceId) {
    try {
        const { data: invoice, error } = await supabase
            .from('invoices')
            .select(`
                *,
                client:profiles!client_id(full_name, email, company),
                project:projects(name),
                line_items:invoice_line_items(*),
                payments:invoice_payments(*)
            `)
            .eq('id', invoiceId)
            .single();

        if (error) throw error;

        const statusColors = {
            draft: '#6B7280',
            sent: '#3B82F6',
            paid: '#10B981',
            overdue: '#EF4444',
            cancelled: '#9CA3AF',
            refunded: '#F59E0B'
        };

        const statusColor = statusColors[invoice.status] || '#6B7280';

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
                    <h4 style="color: #fff; margin: 0 0 1rem 0;">Client Information</h4>
                    <p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Name:</strong> ${invoice.client.full_name}</p>
                    ${invoice.client.company ? `<p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Company:</strong> ${invoice.client.company}</p>` : ''}
                    <p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Email:</strong> ${invoice.client.email}</p>
                    ${invoice.project ? `<p style="color: #9CA3AF; margin: 0.25rem 0;"><strong style="color: #fff;">Project:</strong> ${invoice.project.name}</p>` : ''}
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
                    <h4 style="color: #065F46; margin: 0 0 1rem 0;">Payment History</h4>
                    ${invoice.payments.map(payment => `
                        <div style="display: flex; justify-content: space-between; color: #065F46; margin: 0.5rem 0;">
                            <span>${new Date(payment.payment_date).toLocaleDateString('en-AU')} - ${payment.payment_method}</span>
                            <strong>$${parseFloat(payment.amount).toFixed(2)}</strong>
                        </div>
                    `).join('')}
                </div>
                ` : ''}

                ${invoice.notes ? `
                <div style="background: #FEF3C7; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #F59E0B; margin-bottom: 1.5rem;">
                    <h4 style="color: #92400E; margin: 0 0 0.5rem 0;">Notes</h4>
                    <p style="color: #78350F; margin: 0; white-space: pre-line;">${invoice.notes}</p>
                </div>
                ` : ''}

                <div style="display: flex; gap: 0.75rem; margin-top: 2rem; flex-wrap: wrap;">
                    ${invoice.status !== 'paid' ? `
                        <button onclick="markInvoiceAsPaid('${invoice.id}')" style="padding: 0.75rem 1.5rem; background: #10B981; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">✅ Mark as Paid</button>
                    ` : ''}
                    ${invoice.status === 'draft' || invoice.status === 'sent' ? `
                        <button onclick="sendInvoiceEmail('${invoice.id}', '${invoice.status === 'draft' ? 'initial' : 'reminder'}')" style="padding: 0.75rem 1.5rem; background: #3B82F6; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">📧 ${invoice.status === 'draft' ? 'Send' : 'Send Reminder'}</button>
                    ` : ''}
                    <button onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: #374151; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
                </div>
            </div>
        `;

        showModal('Invoice Details', content);

    } catch (error) {
        console.error('Error viewing invoice:', error);
        showNotification('Failed to load invoice details', 'error');
    }
}

// Mark invoice as paid
async function markInvoiceAsPaid(invoiceId) {
    const content = `
        <form id="mark-paid-form" style="padding: 1rem;">
            <p style="color: #fff; margin-bottom: 1.5rem;">Record payment for this invoice:</p>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Payment Amount *</label>
                <input type="number" id="payment-amount" min="0" step="0.01" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Payment Date *</label>
                <input type="date" id="payment-date" value="${new Date().toISOString().split('T')[0]}" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Payment Method *</label>
                <select id="payment-method" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="stripe">Stripe</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Reference Number (Optional)</label>
                <input type="text" id="payment-reference" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Notes (Optional)</label>
                <textarea id="payment-notes" rows="2" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;"></textarea>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button type="button" onclick="closeModal()" style="flex: 1; padding: 0.75rem; background: #374151; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
                <button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Record Payment</button>
            </div>
        </form>
    `;

    showModal('Record Payment', content);

    document.getElementById('mark-paid-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const amount = parseFloat(document.getElementById('payment-amount').value);
            const paymentDate = document.getElementById('payment-date').value;
            const paymentMethod = document.getElementById('payment-method').value;
            const reference = document.getElementById('payment-reference').value;
            const notes = document.getElementById('payment-notes').value;

            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('invoice_payments')
                .insert({
                    invoice_id: invoiceId,
                    amount: amount,
                    payment_date: paymentDate,
                    payment_method: paymentMethod,
                    reference_number: reference,
                    notes: notes,
                    recorded_by: user.id
                });

            if (error) throw error;

            closeModal();
            showNotification('Payment recorded successfully!', 'success');
            await loadInvoices();

        } catch (error) {
            console.error('Error recording payment:', error);
            showNotification('Failed to record payment: ' + error.message, 'error');
        }
    });
}

// Show invoice menu
function showInvoiceMenu(invoiceId) {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;

    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <button onclick="viewInvoiceDetails('${invoiceId}')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">👁️ View Details</button>
            ${invoice.status !== 'paid' ? `
                <button onclick="sendInvoiceEmail('${invoiceId}', '${invoice.status === 'draft' ? 'initial' : 'reminder'}')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📧 ${invoice.status === 'draft' ? 'Send Invoice' : 'Send Reminder'}</button>
                <button onclick="markInvoiceAsPaid('${invoiceId}')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Mark as Paid</button>
            ` : ''}
            <button onclick="deleteInvoice('${invoiceId}')" style="width: 100%; padding: 0.75rem; background: #111827; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🗑️ Delete Invoice</button>
        </div>
    `;

    showModal('Invoice Actions', content);
}

// Delete invoice
async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', invoiceId);

        if (error) throw error;

        closeModal();
        showNotification('Invoice deleted successfully', 'success');
        await loadInvoices();

    } catch (error) {
        console.error('Error deleting invoice:', error);
        showNotification('Failed to delete invoice: ' + error.message, 'error');
    }
}

// Filter invoices
function filterInvoices() {
    const searchTerm = document.getElementById('invoice-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('invoice-status-filter')?.value || 'all';

    let filtered = invoices;

    if (searchTerm) {
        filtered = filtered.filter(invoice => 
            invoice.invoice_number.toLowerCase().includes(searchTerm) ||
            invoice.client_name?.toLowerCase().includes(searchTerm) ||
            invoice.client_company?.toLowerCase().includes(searchTerm) ||
            invoice.total_amount.toString().includes(searchTerm)
        );
    }

    if (statusFilter !== 'all') {
        filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    displayInvoices(filtered);
}

// Export invoices to CSV
function exportInvoices() {
    if (invoices.length === 0) {
        showNotification('No invoices to export', 'info');
        return;
    }

    const headers = ['Invoice Number', 'Client', 'Issue Date', 'Due Date', 'Status', 'Total Amount', 'Amount Paid', 'Amount Due'];
    const rows = invoices.map(invoice => [
        invoice.invoice_number,
        invoice.client_name || '',
        new Date(invoice.issue_date).toLocaleDateString('en-AU'),
        new Date(invoice.due_date).toLocaleDateString('en-AU'),
        invoice.status,
        parseFloat(invoice.total_amount).toFixed(2),
        parseFloat(invoice.amount_paid).toFixed(2),
        parseFloat(invoice.amount_due).toFixed(2)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Invoices exported successfully', 'success');
}
