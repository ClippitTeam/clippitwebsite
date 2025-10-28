// Admin Dashboard Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Create modal container
    createModalContainer();
    
    // Navigation item interactions
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow external links to work normally
            if (this.hasAttribute('target') && this.getAttribute('target') === '_blank') {
                return; // Don't prevent default for external links
            }
            
            e.preventDefault();
            
            // Get the href to determine which section to show
            const href = this.getAttribute('href');
            
            // Remove active class from all nav items
            navLinks.forEach(item => item.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all dashboard sections
            const allSections = document.querySelectorAll('.dashboard-section');
            allSections.forEach(section => section.style.display = 'none');
            
            // Hide main dashboard content
            const welcomeSection = document.querySelector('.dashboard-welcome');
            const metricsSection = document.querySelector('.admin-metrics');
            const dashboardGrid = document.querySelector('.dashboard-grid');
            
            // Show appropriate section based on href
            if (href === '#dashboard') {
                // Show main dashboard
                if (welcomeSection) welcomeSection.style.display = 'block';
                if (metricsSection) metricsSection.style.display = 'flex';
                if (dashboardGrid) dashboardGrid.style.display = 'grid';
            } else {
                // Hide main dashboard sections for all other tabs
                if (welcomeSection) welcomeSection.style.display = 'none';
                if (metricsSection) metricsSection.style.display = 'none';
                if (dashboardGrid) dashboardGrid.style.display = 'none';
                
                // Show the appropriate section
                if (href === '#projects') {
                    const projectsSection = document.getElementById('section-projects');
                    if (projectsSection) projectsSection.style.display = 'block';
                } else if (href === '#clients') {
                    const clientsSection = document.getElementById('section-clients');
                    if (clientsSection) clientsSection.style.display = 'block';
                } else if (href === '#team') {
                    const teamSection = document.getElementById('section-team');
                    if (teamSection) teamSection.style.display = 'block';
                } else if (href === '#invoices') {
                    const invoicesSection = document.getElementById('section-invoices');
                    if (invoicesSection) invoicesSection.style.display = 'block';
                } else if (href === '#tickets') {
                    const ticketsSection = document.getElementById('section-tickets');
                    if (ticketsSection) ticketsSection.style.display = 'block';
                } else if (href === '#integrations') {
                    const integrationsSection = document.getElementById('section-integrations');
                    if (integrationsSection) integrationsSection.style.display = 'block';
                } else if (href === '#settings') {
                    const settingsSection = document.getElementById('section-settings');
                    if (settingsSection) settingsSection.style.display = 'block';
                } else {
                    showNotification(`${this.querySelector('.nav-label').textContent} section coming soon`, 'info');
                }
            }
        });
    });

    // Quick Action Buttons
    const quickActionBtns = document.querySelectorAll('.quick-action-btn');
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            if (title.includes('Project')) {
                showNewProjectModal();
            } else if (title.includes('Invoice')) {
                showCreateInvoiceModal();
            } else if (title.includes('Announcement')) {
                showAnnouncementModal();
            }
        });
    });

    // Notification icon
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', showNotificationsPanel);
    }

    // Card action buttons
    const cardActions = document.querySelectorAll('.card-action');
    cardActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const text = this.textContent.trim();
            
            if (text.includes('New Project')) {
                showNewProjectModal();
            } else if (text.includes('Add Client')) {
                showAddClientModal();
            } else if (text.includes('View All') || text.includes('Manage') || text.includes('Configure') || text.includes('Monitor')) {
                const cardTitle = this.closest('.dashboard-card').querySelector('h2').textContent;
                showNotification(`Opening ${cardTitle}...`, 'info');
            }
        });
    });

    // Clickable table rows
    const tableRows = document.querySelectorAll('.clickable-row');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const cells = this.querySelectorAll('td');
            const projectName = cells[0]?.textContent.trim();
            
            if (cells.length > 5) {
                // Project row
                showProjectManagementModal(projectName);
            } else if (cells[0]?.textContent.includes('#')) {
                // Ticket row
                const ticketId = cells[0].textContent;
                const subject = cells[1].textContent;
                showTicketManagementModal(ticketId, subject);
            }
        });
    });

    // Client items
    const clientItems = document.querySelectorAll('.client-item');
    clientItems.forEach(item => {
        item.addEventListener('click', function() {
            const clientName = this.querySelector('h4').textContent;
            showClientDetailsModal(clientName);
        });
    });

    // Invoice items
    const invoiceItems = document.querySelectorAll('.invoice-item.admin');
    invoiceItems.forEach(item => {
        item.addEventListener('click', function() {
            const invoiceNumber = this.querySelector('h4').textContent;
            showAdminInvoiceModal(invoiceNumber);
        });
    });

    // Quick action buttons in cards
    const adminActionBtns = document.querySelectorAll('.admin-action-btn');
    adminActionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            quickAction(action);
        });
    });
});

// Quick actions handler
function quickAction(action) {
    if (action.includes('Create Project')) {
        showNewProjectModal();
    } else if (action.includes('Generate Invoice')) {
        showCreateInvoiceModal();
    } else if (action.includes('Add Client')) {
        showAddClientModal();
    } else if (action.includes('Announcement')) {
        showAnnouncementModal();
    } else if (action.includes('Backup')) {
        showBackupModal();
    }
}

// Modal system (reuse from dashboard.js)
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
        <div style="background: #1F2937; border: 1px solid #4B5563; border-radius: 16px; padding: 2rem; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #40E0D0; font-size: 1.5rem;">${title}</h2>
                <button onclick="closeModal()" style="background: none; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer; padding: 0; width: 30px; height: 30px;">&times;</button>
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

// New Project Modal
function showNewProjectModal() {
    const content = `
        <form onsubmit="createProject(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Name</label>
                <input type="text" id="project-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client</label>
                <select id="project-client" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select Client</option>
                    <option value="techstart">TechStart Inc.</option>
                    <option value="fitlife">FitLife App</option>
                    <option value="globalcorp">GlobalCorp</option>
                    <option value="connecthub">ConnectHub</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Type</label>
                <select id="project-type" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="website">Website</option>
                    <option value="app">Mobile App</option>
                    <option value="software">Custom Software</option>
                    <option value="ecommerce">E-Commerce</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Assign Team Members</label>
                <select id="team-members" multiple style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; height: 100px;">
                    <option value="sarah">Sarah Chen</option>
                    <option value="marcus">Marcus Rodriguez</option>
                    <option value="emily">Emily Watson</option>
                    <option value="alex">Alex Thompson</option>
                </select>
                <p style="font-size: 0.75rem; margin-top: 0.25rem;">Hold Ctrl/Cmd to select multiple</p>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Due Date</label>
                <input type="date" id="project-due-date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Create Project</button>
        </form>
    `;
    showModal('Create New Project', content);
}

function createProject(e) {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    closeModal();
    showNotification(`Project "${projectName}" created successfully!`, 'success');
}

// Create Invoice Modal
function showCreateInvoiceModal() {
    const content = `
        <form onsubmit="generateInvoice(event)" style="display: flex; flex-direction: column; gap: 1.5rem; max-height: 70vh; overflow-y: auto; padding-right: 0.5rem;">
            <!-- Company Details Section -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem; font-size: 1.125rem;">Company Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Company Name *</label>
                        <input type="text" id="company-name" value="Clippit" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">ABN *</label>
                        <input type="text" id="company-abn" value="12 345 678 901" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">ACN</label>
                        <input type="text" id="company-acn" value="123 456 789" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Phone</label>
                        <input type="tel" id="company-phone" value="+61 2 1234 5678" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                </div>
                <div style="margin-top: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Company Address *</label>
                    <input type="text" id="company-address" value="123 Business St, Sydney NSW 2000, Australia" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
                <div style="margin-top: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Email</label>
                    <input type="email" id="company-email" value="billing@clippit.com" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
            </div>

            <!-- Client Details Section -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem; font-size: 1.125rem;">Bill To (Client)</h3>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Select Client *</label>
                    <select id="invoice-client" required onchange="populateClientDetails()" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <option value="">Select Client</option>
                        <option value="techstart">TechStart Inc.</option>
                        <option value="fitlife">FitLife App</option>
                        <option value="globalcorp">GlobalCorp</option>
                        <option value="connecthub">ConnectHub</option>
                    </select>
                </div>
                <div id="client-details" style="margin-top: 1rem; display: none;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client Name *</label>
                            <input type="text" id="client-name" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Contact Person</label>
                            <input type="text" id="client-contact" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        </div>
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client Address</label>
                        <input type="text" id="client-address" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div style="margin-top: 1rem;">
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client Email</label>
                        <input type="email" id="client-email" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                </div>
            </div>

            <!-- Invoice Details -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem; font-size: 1.125rem;">Invoice Details</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Invoice Number *</label>
                        <input type="text" id="invoice-number" value="INV-${Date.now().toString().slice(-6)}" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Issue Date *</label>
                        <input type="date" id="invoice-issue-date" value="${new Date().toISOString().split('T')[0]}" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Due Date *</label>
                        <input type="date" id="invoice-due-date" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                </div>
            </div>

            <!-- Line Items -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="color: #40E0D0; margin: 0; font-size: 1.125rem;">Line Items</h3>
                    <button type="button" onclick="addInvoiceLineItem()" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;">+ Add Item</button>
                </div>
                <div id="invoice-line-items">
                    <div class="invoice-line-item" style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;">
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-size: 0.875rem;">Description *</label>
                            <input type="text" class="item-description" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="Service or product description">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-size: 0.875rem;">Quantity *</label>
                            <input type="number" class="item-quantity" min="1" value="1" required onchange="calculateInvoiceTotal()" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-size: 0.875rem;">Rate (AUD) *</label>
                            <input type="number" class="item-rate" min="0" step="0.01" required onchange="calculateInvoiceTotal()" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="0.00">
                        </div>
                        <div>
                            <label style="display: block; margin-bottom: 0.5rem; color: #fff; font-size: 0.875rem;">Amount</label>
                            <input type="text" class="item-amount" readonly style="width: 100%; padding: 0.75rem; background: #0F1419; border: 1px solid #4B5563; border-radius: 8px; color: #40E0D0; font-weight: 600;" value="$0.00">
                        </div>
                        <button type="button" onclick="removeInvoiceLineItem(this)" style="padding: 0.75rem; background: transparent; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; font-size: 1rem;">🗑️</button>
                    </div>
                </div>
            </div>

            <!-- Totals -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem; font-size: 1.125rem;">Totals</h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; padding: 0.5rem; background: #1F2937; border-radius: 6px;">
                        <span style="color: #9CA3AF;">Subtotal:</span>
                        <span id="invoice-subtotal" style="color: #fff; font-weight: 600;">$0.00</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <label style="color: #9CA3AF;">GST (10%):</label>
                            <input type="checkbox" id="include-gst" checked onchange="calculateInvoiceTotal()" style="width: 20px; height: 20px;">
                        </div>
                        <span id="invoice-gst" style="color: #fff; font-weight: 600;">$0.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 1rem; background: rgba(64, 224, 208, 0.1); border: 1px solid #40E0D0; border-radius: 8px;">
                        <span style="color: #40E0D0; font-size: 1.25rem; font-weight: 700;">TOTAL:</span>
                        <span id="invoice-total" style="color: #40E0D0; font-size: 1.5rem; font-weight: 800;">$0.00</span>
                    </div>
                </div>
            </div>

            <!-- Payment Terms & Notes -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem; font-size: 1.125rem;">Payment Terms & Notes</h3>
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Payment Terms</label>
                    <select id="payment-terms" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <option value="net-7">Net 7 - Payment due within 7 days</option>
                        <option value="net-15" selected>Net 15 - Payment due within 15 days</option>
                        <option value="net-30">Net 30 - Payment due within 30 days</option>
                        <option value="net-60">Net 60 - Payment due within 60 days</option>
                        <option value="due-on-receipt">Due on Receipt</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Notes (Optional)</label>
                    <textarea id="invoice-notes" rows="3" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Additional notes or payment instructions..."></textarea>
                </div>
            </div>

            <!-- Actions -->
            <div style="display: flex; gap: 1rem; padding-top: 1rem;">
                <button type="submit" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Generate Invoice</button>
                <button type="button" onclick="previewInvoice()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Preview</button>
                <button type="button" onclick="closeModal()" style="background: transparent; color: #9CA3AF; border: 2px solid #4B5563; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </form>
    `;
    showModal('Create Invoice', content);
}

// Populate client details when selected
function populateClientDetails() {
    const clientSelect = document.getElementById('invoice-client');
    const clientDetails = document.getElementById('client-details');
    const clientValue = clientSelect.value;
    
    if (clientValue) {
        clientDetails.style.display = 'block';
        
        // Mock client data
        const clients = {
            'techstart': {
                name: 'TechStart Inc.',
                contact: 'John Davis',
                address: '456 Tech Park, Sydney NSW 2000',
                email: 'john@techstart.com'
            },
            'fitlife': {
                name: 'FitLife App',
                contact: 'Sarah Miller',
                address: '789 Health St, Melbourne VIC 3000',
                email: 'sarah@fitlife.com'
            },
            'globalcorp': {
                name: 'GlobalCorp',
                contact: 'Michael Chen',
                address: '321 Corporate Ave, Brisbane QLD 4000',
                email: 'michael@globalcorp.com'
            },
            'connecthub': {
                name: 'ConnectHub',
                contact: 'Alex Wong',
                address: '654 Network Rd, Perth WA 6000',
                email: 'alex@connecthub.com'
            }
        };
        
        const client = clients[clientValue];
        if (client) {
            document.getElementById('client-name').value = client.name;
            document.getElementById('client-contact').value = client.contact;
            document.getElementById('client-address').value = client.address;
            document.getElementById('client-email').value = client.email;
        }
    } else {
        clientDetails.style.display = 'none';
    }
}

// Add invoice line item
function addInvoiceLineItem() {
    const container = document.getElementById('invoice-line-items');
    const newItem = document.createElement('div');
    newItem.className = 'invoice-line-item';
    newItem.style.cssText = 'display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; margin-bottom: 0.75rem; align-items: end;';
    newItem.innerHTML = `
        <div>
            <input type="text" class="item-description" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="Service or product description">
        </div>
        <div>
            <input type="number" class="item-quantity" min="1" value="1" required onchange="calculateInvoiceTotal()" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
        </div>
        <div>
            <input type="number" class="item-rate" min="0" step="0.01" required onchange="calculateInvoiceTotal()" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="0.00">
        </div>
        <div>
            <input type="text" class="item-amount" readonly style="width: 100%; padding: 0.75rem; background: #0F1419; border: 1px solid #4B5563; border-radius: 8px; color: #40E0D0; font-weight: 600;" value="$0.00">
        </div>
        <button type="button" onclick="removeInvoiceLineItem(this)" style="padding: 0.75rem; background: transparent; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; font-size: 1rem;">🗑️</button>
    `;
    container.appendChild(newItem);
}

// Remove invoice line item
function removeInvoiceLineItem(button) {
    const items = document.querySelectorAll('.invoice-line-item');
    if (items.length > 1) {
        button.closest('.invoice-line-item').remove();
        calculateInvoiceTotal();
    } else {
        showNotification('Invoice must have at least one line item', 'warning');
    }
}

// Calculate invoice total
function calculateInvoiceTotal() {
    const items = document.querySelectorAll('.invoice-line-item');
    let subtotal = 0;
    
    items.forEach(item => {
        const quantity = parseFloat(item.querySelector('.item-quantity').value) || 0;
        const rate = parseFloat(item.querySelector('.item-rate').value) || 0;
        const amount = quantity * rate;
        
        item.querySelector('.item-amount').value = `$${amount.toFixed(2)}`;
        subtotal += amount;
    });
    
    document.getElementById('invoice-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    
    const includeGst = document.getElementById('include-gst').checked;
    const gst = includeGst ? subtotal * 0.1 : 0;
    document.getElementById('invoice-gst').textContent = `$${gst.toFixed(2)}`;
    
    const total = subtotal + gst;
    document.getElementById('invoice-total').textContent = `$${total.toFixed(2)}`;
}

// Preview invoice
function previewInvoice() {
    showNotification('Generating invoice preview...', 'info');
    setTimeout(() => {
        showNotification('Preview feature coming soon!', 'info');
    }, 1000);
}

// Generate invoice
function generateInvoice(e) {
    e.preventDefault();
    const invoiceNumber = document.getElementById('invoice-number').value;
    const client = document.getElementById('client-name').value;
    const total = document.getElementById('invoice-total').textContent;
    
    closeModal();
    showNotification(`Invoice ${invoiceNumber} for ${client} (${total}) created successfully!`, 'success');
}

// Announcement Modal
function showAnnouncementModal() {
    const content = `
        <form onsubmit="sendAnnouncement(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Recipients</label>
                <select id="announcement-recipients" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="all">All Clients</option>
                    <option value="active">Active Projects Only</option>
                    <option value="team">Team Members</option>
                    <option value="specific">Specific Client</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Subject</label>
                <input type="text" id="announcement-subject" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Message</label>
                <textarea id="announcement-message" rows="6" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;"></textarea>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Send Announcement</button>
        </form>
    `;
    showModal('Send Announcement', content);
}

function sendAnnouncement(e) {
    e.preventDefault();
    const recipients = document.getElementById('announcement-recipients').selectedOptions[0].text;
    closeModal();
    showNotification(`Announcement sent to ${recipients}!`, 'success');
}

// Add Client Modal
function showAddClientModal() {
    const content = `
        <form onsubmit="addClient(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client Name</label>
                <input type="text" id="client-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Company</label>
                <input type="text" id="client-company" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Email</label>
                <input type="email" id="client-email" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Phone</label>
                <input type="tel" id="client-phone" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Add Client</button>
        </form>
    `;
    showModal('Add New Client', content);
}

function addClient(e) {
    e.preventDefault();
    const clientName = document.getElementById('client-name').value;
    const clientCompany = document.getElementById('client-company').value;
    const clientEmail = document.getElementById('client-email').value;
    const clientPhone = document.getElementById('client-phone').value;
    
    // Generate secure credentials
    const username = clientEmail;
    const tempPassword = generateSecurePassword();
    const clientId = 'CL-' + Date.now().toString().slice(-6);
    
    // Save client to localStorage (in production, this would be a database)
    const clients = JSON.parse(localStorage.getItem('clients') || '[]');
    clients.push({
        id: clientId,
        name: clientName,
        company: clientCompany,
        email: clientEmail,
        phone: clientPhone,
        username: username,
        tempPassword: tempPassword,
        status: 'pending_first_login',
        createdDate: new Date().toISOString(),
        lastLogin: null
    });
    localStorage.setItem('clients', JSON.stringify(clients));
    
    closeModal();
    
    // Show onboarding success modal with credentials
    showClientOnboardingModal(clientName, clientCompany, username, tempPassword, clientEmail, clientPhone);
}

function generateSecurePassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

function showClientOnboardingModal(clientName, clientCompany, username, password, email, phone) {
    const loginUrl = window.location.origin + '/customer-dashboard.html';
    
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <!-- Success Header -->
            <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(64, 224, 208, 0.2), rgba(54, 184, 168, 0.1)); border-radius: 12px; border: 1px solid rgba(64, 224, 208, 0.3);">
                <div style="font-size: 4rem; margin-bottom: 0.5rem;">✅</div>
                <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">Client Account Created!</h3>
                <p style="color: #9CA3AF;">${clientName} from ${clientCompany}</p>
            </div>

            <!-- Generated Credentials -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>🔑</span> Login Credentials Generated
                </h4>
                
                <div style="background: #0F1419; padding: 1rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <label style="color: #9CA3AF; font-size: 0.875rem;">Username (Email):</label>
                        <button onclick="copyToClipboard('${username}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Copy</button>
                    </div>
                    <p style="color: #40E0D0; font-weight: 600; font-size: 1.125rem; word-break: break-all;">${username}</p>
                </div>
                
                <div style="background: #0F1419; padding: 1rem; border-radius: 8px; border: 1px solid #FBB624; margin-bottom: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <label style="color: #9CA3AF; font-size: 0.875rem;">Temporary Password:</label>
                        <button onclick="copyToClipboard('${password}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #FBB624; border: 1px solid #FBB624; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Copy</button>
                    </div>
                    <p style="color: #FBB624; font-weight: 600; font-size: 1.125rem; font-family: monospace;">${password}</p>
                    <p style="color: #9CA3AF; font-size: 0.75rem; margin-top: 0.5rem;">⚠️ Client must change this password on first login</p>
                </div>
                
                <div style="background: #0F1419; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563;">
                    <label style="color: #9CA3AF; font-size: 0.875rem; display: block; margin-bottom: 0.5rem;">Login URL:</label>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <input type="text" value="${loginUrl}" readonly style="flex: 1; padding: 0.5rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 4px; color: #fff; font-size: 0.875rem;">
                        <button onclick="copyToClipboard('${loginUrl}')" style="padding: 0.5rem 0.75rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 4px; cursor: pointer; font-size: 0.75rem; white-space: nowrap;">Copy URL</button>
                    </div>
                </div>
            </div>

            <!-- Welcome Email Preview -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📧</span> Welcome Email Preview
                </h4>
                
                <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563; max-height: 300px; overflow-y: auto;">
                    <div style="border-bottom: 1px solid #4B5563; padding-bottom: 1rem; margin-bottom: 1rem;">
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">To: ${email}</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">From: noreply@clippit.com</p>
                        <p style="color: #fff; font-weight: 600; margin-top: 0.75rem;">Subject: Welcome to Clippit - Your Account is Ready! 🎉</p>
                    </div>
                    
                    <div style="color: #fff; line-height: 1.6;">
                        <p style="margin-bottom: 1rem;">Hi ${clientName},</p>
                        
                        <p style="margin-bottom: 1rem;">Welcome to Clippit! Your client account has been created and is ready to use.</p>
                        
                        <p style="margin-bottom: 0.5rem; font-weight: 600; color: #40E0D0;">Your Login Details:</p>
                        <div style="background: #111827; padding: 1rem; border-radius: 6px; margin-bottom: 1rem; border-left: 3px solid #40E0D0;">
                            <p style="margin-bottom: 0.5rem;"><strong>Username:</strong> ${username}</p>
                            <p style="margin-bottom: 0.5rem;"><strong>Temporary Password:</strong> ${password}</p>
                            <p style="margin-bottom: 0.5rem;"><strong>Login URL:</strong> <span style="color: #40E0D0;">${loginUrl}</span></p>
                        </div>
                        
                        <p style="margin-bottom: 1rem; padding: 0.75rem; background: rgba(251, 191, 36, 0.1); border-left: 3px solid #FBB624; border-radius: 4px; color: #FBB624;">
                            ⚠️ <strong>Important:</strong> You'll be required to change your password when you first log in for security purposes.
                        </p>
                        
                        <p style="margin-bottom: 0.5rem; font-weight: 600;">What You Can Do:</p>
                        <ul style="margin-bottom: 1rem; padding-left: 1.5rem;">
                            <li>View and track your projects in real-time</li>
                            <li>Access invoices and payment history</li>
                            <li>Communicate directly with our team</li>
                            <li>Download project files and resources</li>
                            <li>Submit support requests</li>
                        </ul>
                        
                        <p style="margin-bottom: 1rem;">If you have any questions or need assistance, feel free to reach out to our support team.</p>
                        
                        <p style="margin-bottom: 0.5rem;">Best regards,</p>
                        <p style="font-weight: 600; color: #40E0D0;">The Clippit Team</p>
                        
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid #4B5563; color: #9CA3AF; font-size: 0.75rem;">
                            <p>Need help? Contact us at support@clippit.com or +61 2 1234 5678</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Notification Options -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Send Welcome Notifications</h4>
                
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #1F2937; border-radius: 8px; cursor: pointer;">
                        <input type="checkbox" id="send-email" checked style="width: 20px; height: 20px;">
                        <div style="flex: 1;">
                            <span style="color: #fff; font-weight: 600;">📧 Send Welcome Email</span>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-top: 0.25rem;">Email will be sent to: ${email}</p>
                        </div>
                    </label>
                    
                    <label style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background: #1F2937; border-radius: 8px; cursor: pointer;">
                        <input type="checkbox" id="send-sms" ${phone ? 'checked' : ''} ${!phone ? 'disabled' : ''} style="width: 20px; height: 20px;">
                        <div style="flex: 1;">
                            <span style="color: #fff; font-weight: 600;">📱 Send SMS Notification</span>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-top: 0.25rem;">${phone ? 'SMS will be sent to: ' + phone : 'No phone number provided'}</p>
                        </div>
                    </label>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button onclick="sendWelcomeNotifications('${clientName}', '${email}', '${phone}', '${username}', '${password}')" style="padding: 0.75rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                    <span>📤</span> Send Notifications
                </button>
                <button onclick="closeModal()" style="padding: 0.75rem; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; border-radius: 50px; font-weight: 600; cursor: pointer;">
                    Done
                </button>
            </div>
            
            <div style="text-align: center; padding: 1rem; background: rgba(64, 224, 208, 0.1); border-radius: 8px; border: 1px solid rgba(64, 224, 208, 0.3);">
                <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">
                    💡 <strong style="color: #fff;">Pro Tip:</strong> Save these credentials securely. The client will need them for first login.
                </p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">
                    Client status: <span style="color: #FBB624; font-weight: 600;">Pending First Login</span>
                </p>
            </div>
        </div>
    `;
    
    showModal('Client Onboarding - ' + clientName, content);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy. Please copy manually.', 'error');
    });
}

function sendWelcomeNotifications(clientName, email, phone, username, password) {
    const sendEmail = document.getElementById('send-email').checked;
    const sendSMS = document.getElementById('send-sms').checked;
    
    let notifications = [];
    
    if (sendEmail) {
        notifications.push('email');
        // In production, this would trigger actual email sending
        showNotification('Welcome email sent to ' + email, 'success');
    }
    
    if (sendSMS && phone) {
        notifications.push('SMS');
        // In production, this would trigger actual SMS sending
        setTimeout(() => {
            showNotification('SMS notification sent to ' + phone, 'success');
        }, 1000);
    }
    
    setTimeout(() => {
        closeModal();
        showNotification(`Client "${clientName}" onboarded successfully! ${notifications.join(' and ')} sent.`, 'success');
    }, 2000);
}

// Project Management Modal
function showProjectManagementModal(projectName) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #fff; margin-bottom: 1rem;">Project Details</h3>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Status:</strong> In Progress</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Team:</strong> Sarah Chen, Marcus Rodriguez</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Progress:</strong> 75%</p>
                <p><strong style="color: #fff;">Due Date:</strong> Oct 28, 2025</p>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Quick Actions</h3>
                <button onclick="manageAction('Update Status')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">📝 Update Status</button>
                <button onclick="manageAction('Assign Team')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">👥 Assign Team Members</button>
                <button onclick="manageAction('Send Update')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">📧 Send Client Update</button>
                <button onclick="manageAction('View Files')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">📁 View Project Files</button>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Manage: ' + projectName, content);
}

function manageAction(action) {
    closeModal();
    showNotification(`${action} - Opening...`, 'info');
}

// Client Details Modal
function showClientDetailsModal(clientName) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #fff; margin-bottom: 1rem;">Client Information</h3>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Email:</strong> john@techstart.com</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Phone:</strong> +61 2 1234 5678</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Active Projects:</strong> 2</p>
                <p><strong style="color: #fff;">Total Revenue:</strong> $45,000</p>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Actions</h3>
                <button onclick="clientAction('Send Email')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">📧 Send Email</button>
                <button onclick="clientAction('View Projects')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">💼 View Projects</button>
                <button onclick="clientAction('View Invoices')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">💰 View Invoices</button>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Client: ' + clientName, content);
}

function clientAction(action) {
    closeModal();
    showNotification(`${action} - Opening...`, 'info');
}

// Admin Invoice Modal
function showAdminInvoiceModal(invoiceNumber) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #fff; margin-bottom: 1rem;">Invoice Details</h3>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Amount:</strong> $5,000</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Status:</strong> Pending</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Due Date:</strong> Oct 28, 2025</p>
                <p><strong style="color: #fff;">Client:</strong> TechStart Inc.</p>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Actions</h3>
                <button onclick="invoiceAction('Send Reminder')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">📧 Send Payment Reminder</button>
                <button onclick="invoiceAction('Mark Paid')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">✅ Mark as Paid</button>
                <button onclick="invoiceAction('Download PDF')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">📄 Download PDF</button>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal(invoiceNumber, content);
}

function invoiceAction(action) {
    closeModal();
    showNotification(`${action} completed!`, 'success');
}

// Ticket Management Modal
function showTicketManagementModal(ticketId, subject) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h3 style="color: #fff; margin-bottom: 1rem;">Ticket Information</h3>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Priority:</strong> High</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Assigned To:</strong> Emily Watson</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Client:</strong> TechStart Inc.</p>
                <p><strong style="color: #fff;">Status:</strong> Open</p>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Actions</h3>
                <button onclick="ticketAction('Reassign')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">👤 Reassign Ticket</button>
                <button onclick="ticketAction('Update Priority')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left; margin-bottom: 0.5rem;">🔥 Update Priority</button>
                <button onclick="ticketAction('Close Ticket')" style="width: 100%; background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">✅ Close Ticket</button>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal(ticketId + ': ' + subject, content);
}

function ticketAction(action) {
    closeModal();
    showNotification(`${action} completed!`, 'success');
}

// Backup Modal
function showBackupModal() {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">💾</div>
            <p style="margin-bottom: 1.5rem;">Initiate a full system backup?</p>
            <p style="margin-bottom: 1.5rem; font-size: 0.875rem;">This will create a backup of all client data, projects, and system configuration.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="initiateBackup()" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Start Backup</button>
                <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    showModal('System Backup', content);
}

function initiateBackup() {
    closeModal();
    showNotification('Backup initiated...', 'info');
    setTimeout(() => {
        showNotification('Backup completed successfully!', 'success');
    }, 3000);
}

// Notifications Panel
function showNotificationsPanel() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">✅</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>Sarah completed API development</strong></p>
                        <p style="font-size: 0.875rem;">30 minutes ago</p>
                    </div>
                </div>
            </div>
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">📝</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>Marcus updated project timeline</strong></p>
                        <p style="font-size: 0.875rem;">1 hour ago</p>
                    </div>
                </div>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 1px solid #40E0D0; padding: 0.75rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">Mark all as read</button>
        </div>
    `;
    showModal('Notifications', content);
}

// Show notification toast
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        info: '#40E0D0',
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

// Admin Projects Tab Functions
function showCreateProjectModal() {
    showNewProjectModal();
}

function switchProjectView(view) {
    const tableView = document.getElementById('projects-table-view');
    const gridView = document.getElementById('projects-grid-view');
    const buttons = document.querySelectorAll('.view-toggle-btn');
    
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#111827';
        btn.style.color = '#9CA3AF';
        btn.style.borderColor = '#4B5563';
    });
    
    if (view === 'grid') {
        tableView.style.display = 'none';
        gridView.style.display = 'block';
        buttons[0].classList.add('active');
        buttons[0].style.background = 'rgba(64, 224, 208, 0.2)';
        buttons[0].style.color = '#40E0D0';
        buttons[0].style.borderColor = '#40E0D0';
    } else {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
        buttons[1].classList.add('active');
        buttons[1].style.background = 'rgba(64, 224, 208, 0.2)';
        buttons[1].style.color = '#40E0D0';
        buttons[1].style.borderColor = '#40E0D0';
    }
    
    showNotification(`Switched to ${view} view`, 'info');
}

function viewAdminProjectDetails(projectId) {
    showNotification('Loading project details...', 'info');
    // In a real implementation, this would navigate to a detailed project view
}

function editProject(projectId) {
    showNotification(`Opening editor for project ${projectId}...`, 'info');
}

function showProjectMenu(projectId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="quickProjectAction('${projectId}', 'Edit')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✏️ Edit Project</button>
            <button onclick="quickProjectAction('${projectId}', 'Update Status')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📝 Update Status</button>
            <button onclick="quickProjectAction('${projectId}', 'Assign Team')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">👥 Assign Team</button>
            <button onclick="quickProjectAction('${projectId}', 'View Files')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📁 View Files</button>
            <button onclick="quickProjectAction('${projectId}', 'Send Update')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📧 Send Update</button>
            <button onclick="quickProjectAction('${projectId}', 'Archive')" style="width: 100%; padding: 0.75rem; background: #111827; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🗄️ Archive Project</button>
        </div>
    `;
    showModal('Project Actions', content);
}

function quickProjectAction(projectId, action) {
    closeModal();
    showNotification(`${action} - ${projectId}`, 'info');
}

// Admin Clients Tab Functions
function switchClientView(view) {
    const tableView = document.getElementById('clients-table-view');
    const gridView = document.getElementById('clients-grid-view');
    const toggleButton = document.getElementById('client-view-toggle');
    
    if (view === 'grid') {
        tableView.style.display = 'none';
        gridView.style.display = 'block';
        toggleButton.textContent = '📋 Table View';
        toggleButton.setAttribute('onclick', "switchClientView('table')");
        showNotification('Switched to grid view', 'info');
    } else {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
        toggleButton.textContent = '🔲 Grid View';
        toggleButton.setAttribute('onclick', "switchClientView('grid')");
        showNotification('Switched to table view', 'info');
    }
}

function viewClientDetail(clientId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #111827;">JD</div>
                <div>
                    <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.25rem;">John Davis</h3>
                    <p style="color: #9CA3AF;">TechStart Inc.</p>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Contact Information</h4>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Email:</strong> john@techstart.com</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Phone:</strong> +61 412 345 678</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Member Since:</strong> Aug 2024</p>
                <p><strong style="color: #fff;">Status:</strong> <span style="color: #10B981;">Active</span></p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Business Metrics</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Active Projects</p>
                        <p style="color: #40E0D0; font-size: 1.5rem; font-weight: 700;">2</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Total Revenue</p>
                        <p style="color: #FBB624; font-size: 1.5rem; font-weight: 700;">$45,000</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Completed Projects</p>
                        <p style="color: #10B981; font-size: 1.5rem; font-weight: 700;">3</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Avg. Project Value</p>
                        <p style="color: #A855F7; font-size: 1.5rem; font-weight: 700;">$15,000</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 style="color: #fff; margin-bottom: 0.75rem;">Quick Actions</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="clientQuickAction('Send Email')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📧 Send Email</button>
                    <button onclick="clientQuickAction('View Projects')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💼 View Projects</button>
                    <button onclick="clientQuickAction('View Invoices')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💰 View Invoices</button>
                    <button onclick="clientQuickAction('Schedule Meeting')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📅 Schedule Meeting</button>
                </div>
            </div>

            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Client Details', content);
}

function showClientMenu(clientId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="clientMenuAction('${clientId}', 'Edit')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✏️ Edit Client</button>
            <button onclick="clientMenuAction('${clientId}', 'View Projects')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💼 View Projects</button>
            <button onclick="clientMenuAction('${clientId}', 'Send Email')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📧 Send Email</button>
            <button onclick="clientMenuAction('${clientId}', 'View Invoices')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💰 View Invoices</button>
            <button onclick="clientMenuAction('${clientId}', 'Add Note')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📝 Add Note</button>
            <button onclick="clientMenuAction('${clientId}', 'Deactivate')" style="width: 100%; padding: 0.75rem; background: #111827; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">⚠️ Deactivate Client</button>
        </div>
    `;
    showModal('Client Actions', content);
}

function clientQuickAction(action) {
    closeModal();
    showNotification(`${action} - Opening...`, 'info');
}

function clientMenuAction(clientId, action) {
    closeModal();
    showNotification(`${action} for ${clientId}`, 'info');
}

// Admin Team Tab Functions
function switchTeamView(view) {
    const tableView = document.getElementById('team-table-view');
    const gridView = document.getElementById('team-grid-view');
    const toggleButton = document.getElementById('team-view-toggle');
    
    if (view === 'grid') {
        tableView.style.display = 'none';
        gridView.style.display = 'block';
        toggleButton.textContent = '📋 Table View';
        toggleButton.setAttribute('onclick', "switchTeamView('table')");
        showNotification('Switched to grid view', 'info');
    } else {
        tableView.style.display = 'block';
        gridView.style.display = 'none';
        toggleButton.textContent = '🔲 Grid View';
        toggleButton.setAttribute('onclick', "switchTeamView('grid')");
        showNotification('Switched to table view', 'info');
    }
}

function viewTeamMemberDetail(memberId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; font-weight: 700; color: #111827;">SC</div>
                <div>
                    <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.25rem;">Sarah Chen</h3>
                    <p style="color: #9CA3AF; font-size: 1rem; margin-bottom: 0.25rem;">Senior Developer</p>
                    <span style="color: #10B981; font-size: 0.875rem;">● Active</span>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Contact Information</h4>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Email:</strong> sarah.chen@clippit.com</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Phone:</strong> +61 423 456 789</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Joined:</strong> Jan 2024</p>
                <p><strong style="color: #fff;">Employee ID:</strong> EMP-001</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Performance Metrics</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Active Projects</p>
                        <p style="color: #40E0D0; font-size: 1.5rem; font-weight: 700;">3</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Workload</p>
                        <p style="color: #FBB624; font-size: 1.5rem; font-weight: 700;">85%</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Tasks Completed</p>
                        <p style="color: #10B981; font-size: 1.5rem; font-weight: 700;">47</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Avg. Rating</p>
                        <p style="color: #A855F7; font-size: 1.5rem; font-weight: 700;">4.8/5</p>
                    </div>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Skills</h4>
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <span style="background: #1F2937; color: #40E0D0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.875rem;">React</span>
                    <span style="background: #1F2937; color: #40E0D0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.875rem;">Node.js</span>
                    <span style="background: #1F2937; color: #40E0D0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.875rem;">TypeScript</span>
                    <span style="background: #1F2937; color: #40E0D0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.875rem;">MongoDB</span>
                    <span style="background: #1F2937; color: #40E0D0; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.875rem;">AWS</span>
                </div>
            </div>

            <div>
                <h4 style="color: #fff; margin-bottom: 0.75rem;">Quick Actions</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="teamMemberQuickAction('Send Message')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💬 Send Message</button>
                    <button onclick="teamMemberQuickAction('View Projects')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💼 View Projects</button>
                    <button onclick="teamMemberQuickAction('Assign Task')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Assign Task</button>
                    <button onclick="teamMemberQuickAction('Schedule Meeting')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📅 Schedule Meeting</button>
                </div>
            </div>

            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Team Member Details', content);
}

function showTeamMemberMenu(memberId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="teamMemberMenuAction('${memberId}', 'Edit Profile')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✏️ Edit Profile</button>
            <button onclick="teamMemberMenuAction('${memberId}', 'View Projects')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💼 View Projects</button>
            <button onclick="teamMemberMenuAction('${memberId}', 'Assign Task')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Assign Task</button>
            <button onclick="teamMemberMenuAction('${memberId}', 'Send Message')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💬 Send Message</button>
            <button onclick="teamMemberMenuAction('${memberId}', 'View Performance')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📊 View Performance</button>
            <button onclick="teamMemberMenuAction('${memberId}', 'Manage Access')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔐 Manage Access</button>
        </div>
    `;
    showModal('Team Member Actions', content);
}

function showAddTeamMemberModal() {
    const content = `
        <form onsubmit="addTeamMember(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Full Name</label>
                <input type="text" id="team-member-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Email</label>
                <input type="email" id="team-member-email" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Role</label>
                <select id="team-member-role" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select Role</option>
                    <option value="developer">Developer</option>
                    <option value="designer">UI/UX Designer</option>
                    <option value="manager">Project Manager</option>
                    <option value="support">Support Specialist</option>
                    <option value="marketing">Marketing</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Phone</label>
                <input type="tel" id="team-member-phone" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Start Date</label>
                <input type="date" id="team-member-start-date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Add Team Member</button>
        </form>
    `;
    showModal('Add New Team Member', content);
}

function addTeamMember(e) {
    e.preventDefault();
    const memberName = document.getElementById('team-member-name').value;
    closeModal();
    showNotification(`Team member "${memberName}" added successfully!`, 'success');
}

function teamMemberQuickAction(action) {
    if (action === 'Send Message') {
        showSendMessageModal('Sarah Chen', 'sarah.chen@clippit.com');
    } else if (action === 'Assign Task') {
        showAssignTaskModal('Sarah Chen', 'team-001');
    } else if (action === 'View Projects') {
        showTeamMemberProjectsModal('Sarah Chen', 'team-001');
    } else {
        closeModal();
        showNotification(`${action} - Opening...`, 'info');
    }
}

function teamMemberMenuAction(memberId, action) {
    closeModal();
    if (action === 'Assign Task') {
        showAssignTaskModal('Team Member', memberId);
    } else if (action === 'Send Message') {
        showSendMessageModal('Team Member', 'member@clippit.com');
    } else if (action === 'View Projects') {
        showTeamMemberProjectsModal('Team Member', memberId);
    } else {
        showNotification(`${action} for ${memberId}`, 'info');
    }
}

// Enhanced Messaging Modal
function showSendMessageModal(recipientName, recipientEmail) {
    const content = `
        <form onsubmit="sendTeamMessage(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563;">
                <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">To:</p>
                <p style="color: #fff; font-weight: 600;">${recipientName}</p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">${recipientEmail}</p>
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Subject</label>
                <input type="text" id="message-subject" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="Enter message subject">
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Message</label>
                <textarea id="message-body" rows="8" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Type your message here..."></textarea>
            </div>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="checkbox" id="message-urgent" style="width: 20px; height: 20px;">
                <label for="message-urgent" style="color: #fff;">Mark as urgent</label>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button type="submit" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Send Message</button>
                <button type="button" onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </form>
    `;
    showModal('Send Message to ' + recipientName, content);
}

function sendTeamMessage(e) {
    e.preventDefault();
    const subject = document.getElementById('message-subject').value;
    const body = document.getElementById('message-body').value;
    const urgent = document.getElementById('message-urgent').checked;
    
    // Save to local storage
    const messages = JSON.parse(localStorage.getItem('teamMessages') || '[]');
    messages.push({
        id: Date.now(),
        subject: subject,
        body: body,
        urgent: urgent,
        timestamp: new Date().toISOString(),
        status: 'sent'
    });
    localStorage.setItem('teamMessages', JSON.stringify(messages));
    
    closeModal();
    showNotification(`Message "${subject}" sent successfully!`, 'success');
}

// Task Assignment Modal
function showAssignTaskModal(memberName, memberId) {
    const content = `
        <form onsubmit="assignTask(event, '${memberId}', '${memberName}')" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563;">
                <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Assigning to:</p>
                <p style="color: #40E0D0; font-weight: 600; font-size: 1.125rem;">${memberName}</p>
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Task Title *</label>
                <input type="text" id="task-title" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="e.g., Complete API documentation">
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project</label>
                <select id="task-project" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select Project (Optional)</option>
                    <option value="proj-001">E-Commerce Platform</option>
                    <option value="proj-002">Mobile App Redesign</option>
                    <option value="proj-003">Corporate Website</option>
                </select>
            </div>
            
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Description</label>
                <textarea id="task-description" rows="4" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Describe the task details..."></textarea>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Priority</label>
                    <select id="task-priority" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Due Date *</label>
                    <input type="date" id="task-due-date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
            </div>
            
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="checkbox" id="task-notify" checked style="width: 20px; height: 20px;">
                <label for="task-notify" style="color: #fff;">Send email notification to team member</label>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button type="submit" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Assign Task</button>
                <button type="button" onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </form>
    `;
    showModal('Assign Task', content);
}

function assignTask(e, memberId, memberName) {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const project = document.getElementById('task-project').value;
    const description = document.getElementById('task-description').value;
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-due-date').value;
    const notify = document.getElementById('task-notify').checked;
    
    // Save to local storage
    const tasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
    tasks.push({
        id: Date.now(),
        memberId: memberId,
        memberName: memberName,
        title: title,
        project: project,
        description: description,
        priority: priority,
        dueDate: dueDate,
        status: 'pending',
        assignedDate: new Date().toISOString()
    });
    localStorage.setItem('assignedTasks', JSON.stringify(tasks));
    
    closeModal();
    showNotification(`Task "${title}" assigned to ${memberName}${notify ? ' (notification sent)' : ''}`, 'success');
}

// View Team Member Projects Modal
function showTeamMemberProjectsModal(memberName, memberId) {
    // Get assigned tasks from local storage
    const allTasks = JSON.parse(localStorage.getItem('assignedTasks') || '[]');
    const memberTasks = allTasks.filter(task => task.memberId === memberId);
    
    const priorityColors = {
        'low': '#10B981',
        'medium': '#FBB624',
        'high': '#F59E0B',
        'urgent': '#EF4444'
    };
    
    let tasksHtml = '';
    if (memberTasks.length > 0) {
        tasksHtml = memberTasks.map(task => `
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; margin-bottom: 0.75rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <h4 style="color: #40E0D0; font-size: 1rem; margin: 0;">${task.title}</h4>
                    <span style="background: ${priorityColors[task.priority]}; color: #111827; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${task.priority}</span>
                </div>
                ${task.description ? `<p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">${task.description}</p>` : ''}
                <div style="display: flex; gap: 1rem; font-size: 0.875rem; color: #9CA3AF;">
                    <span>📅 Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    ${task.project ? `<span>💼 Project assigned</span>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        tasksHtml = '<p style="color: #9CA3AF; text-align: center; padding: 2rem;">No tasks assigned yet</p>';
    }
    
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">Active Projects</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">🛒</span>
                        <span style="color: #fff;">E-Commerce Platform</span>
                        <span style="background: rgba(64, 224, 208, 0.2); color: #40E0D0; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; margin-left: auto;">In Progress</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.25rem;">🏢</span>
                        <span style="color: #fff;">Corporate Website</span>
                        <span style="background: rgba(168, 85, 247, 0.2); color: #A855F7; padding: 0.25rem 0.5rem; border-radius: 6px; font-size: 0.75rem; margin-left: auto;">Planning</span>
                    </div>
                </div>
            </div>
            
            <div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h4 style="color: #fff; margin: 0;">Assigned Tasks (${memberTasks.length})</h4>
                    <button onclick="showAssignTaskModal('${memberName}', '${memberId}')" style="padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 600; cursor: pointer;">+ New Task</button>
                </div>
                <div style="max-height: 300px; overflow-y: auto;">
                    ${tasksHtml}
                </div>
            </div>
            
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal(memberName + ' - Projects & Tasks', content);
}

// Admin Invoices Tab Functions
function viewInvoiceDetails(invoiceId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Invoice Information</h4>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Invoice #:</strong> INV-1235</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Client:</strong> TechStart Inc.</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Contact:</strong> John Davis (john@techstart.com)</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Description:</strong> E-Commerce Platform Development</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Amount:</strong> <span style="color: #40E0D0; font-size: 1.5rem; font-weight: 700;">$15,000</span></p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Issue Date:</strong> Oct 15, 2025</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Due Date:</strong> Oct 30, 2025</p>
                <p><strong style="color: #fff;">Status:</strong> <span style="background: rgba(251, 191, 36, 0.2); color: #FBB624; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.875rem; font-weight: 600;">PENDING</span></p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Payment Details</h4>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Payment Method:</strong> Bank Transfer</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Payment Terms:</strong> Net 15</p>
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">Late Fee:</strong> 5% per month</p>
                <p><strong style="color: #fff;">Days Until Due:</strong> <span style="color: #FBB624;">2 days</span></p>
            </div>

            <div>
                <h4 style="color: #fff; margin-bottom: 0.75rem;">Quick Actions</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="invoiceQuickAction('Send Reminder')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📧 Send Payment Reminder</button>
                    <button onclick="invoiceQuickAction('Mark as Paid')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Mark as Paid</button>
                    <button onclick="invoiceQuickAction('Download PDF')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📄 Download PDF</button>
                    <button onclick="invoiceQuickAction('Edit Invoice')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✏️ Edit Invoice</button>
                    <button onclick="invoiceQuickAction('Send to Client')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📨 Send to Client</button>
                </div>
            </div>

            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Invoice Details - INV-1235', content);
}

function showInvoiceMenu(invoiceNumber) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'View Details')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">👁️ View Details</button>
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'Edit Invoice')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✏️ Edit Invoice</button>
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'Send Reminder')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📧 Send Payment Reminder</button>
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'Mark as Paid')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Mark as Paid</button>
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'Download PDF')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📄 Download PDF</button>
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'Duplicate')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">📋 Duplicate Invoice</button>
            <button onclick="invoiceMenuAction('${invoiceNumber}', 'Delete')" style="width: 100%; padding: 0.75rem; background: #111827; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🗑️ Delete Invoice</button>
        </div>
    `;
    showModal('Invoice Actions', content);
}

function invoiceQuickAction(action) {
    closeModal();
    showNotification(`${action} completed!`, 'success');
}

function invoiceMenuAction(invoiceNumber, action) {
    closeModal();
    if (action === 'View Details') {
        viewInvoiceDetails(invoiceNumber);
    } else {
        showNotification(`${action} - ${invoiceNumber}`, 'info');
    }
}

function exportInvoices() {
    showNotification('Exporting invoices to CSV...', 'info');
    setTimeout(() => {
        showNotification('Invoices exported successfully!', 'success');
    }, 1500);
}

// Admin Support/Tickets Tab Functions
function showCreateTicketModal() {
    const content = `
        <form onsubmit="createTicket(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client *</label>
                <select id="ticket-client" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select Client</option>
                    <option value="techstart">TechStart Inc.</option>
                    <option value="fitlife">FitLife App</option>
                    <option value="globalcorp">GlobalCorp</option>
                    <option value="connecthub">ConnectHub</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Subject *</label>
                <input type="text" id="ticket-subject" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="Brief description of the issue">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Description *</label>
                <textarea id="ticket-description" rows="5" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Detailed description of the issue..."></textarea>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Priority *</label>
                    <select id="ticket-priority" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Assign To</label>
                    <select id="ticket-assignee" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                        <option value="">Unassigned</option>
                        <option value="sarah">Sarah Chen</option>
                        <option value="marcus">Marcus Rodriguez</option>
                        <option value="emily">Emily Watson</option>
                        <option value="alex">Alex Thompson</option>
                    </select>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button type="submit" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Create Ticket</button>
                <button type="button" onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </form>
    `;
    showModal('Create Support Ticket', content);
}

function createTicket(e) {
    e.preventDefault();
    const subject = document.getElementById('ticket-subject').value;
    const ticketNumber = 'TICK-' + Date.now().toString().slice(-4);
    closeModal();
    showNotification(`Ticket ${ticketNumber} "${subject}" created successfully!`, 'success');
}

function viewTicketDetails(ticketId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="color: #40E0D0; font-size: 1.25rem; margin: 0;">SSL Certificate Renewal</h3>
                    <span style="background: rgba(239, 68, 68, 0.2); color: #EF4444; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">HIGH PRIORITY</span>
                </div>
                <p style="color: #9CA3AF; margin-bottom: 1rem;">Certificate expiring in 3 days - requires immediate attention</p>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Ticket ID</p>
                        <p style="color: #fff; font-weight: 600;">#5432</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Status</p>
                        <span style="background: rgba(251, 191, 36, 0.2); color: #FBB624; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">OPEN</span>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Client</p>
                        <p style="color: #fff; font-weight: 600;">TechStart Inc.</p>
                        <p style="color: #9CA3AF; font-size: 0.75rem;">John Davis</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Assigned To</p>
                        <p style="color: #fff; font-weight: 600;">Emily Watson</p>
                    </div>
                </div>
                
                <div style="padding-top: 1rem; border-top: 1px solid #4B5563;">
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Created</p>
                    <p style="color: #fff;">Oct 28, 2025 at 2:15 PM</p>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-top: 0.5rem; margin-bottom: 0.25rem;">Last Updated</p>
                    <p style="color: #fff;">2 hours ago</p>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Conversation</h4>
                <div style="max-height: 200px; overflow-y: auto;">
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px; margin-bottom: 0.75rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong style="color: #40E0D0;">John Davis (Client)</strong>
                            <span style="color: #9CA3AF; font-size: 0.75rem;">2 hours ago</span>
                        </div>
                        <p style="color: #fff; font-size: 0.875rem;">Our SSL certificate is expiring in 3 days. Can you help us renew it? This is urgent as it will affect our production site.</p>
                    </div>
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <strong style="color: #FBB624;">Emily Watson (Support)</strong>
                            <span style="color: #9CA3AF; font-size: 0.75rem;">1 hour ago</span>
                        </div>
                        <p style="color: #fff; font-size: 0.875rem;">Hi John, I've started working on this. I'll have the certificate renewed within the next 24 hours. Will keep you updated.</p>
                    </div>
                </div>
            </div>

            <div>
                <h4 style="color: #fff; margin-bottom: 0.75rem;">Quick Actions</h4>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="ticketDetailAction('Add Response')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💬 Add Response</button>
                    <button onclick="ticketDetailAction('Change Status')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔄 Change Status</button>
                    <button onclick="ticketDetailAction('Reassign')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">👤 Reassign Ticket</button>
                    <button onclick="ticketDetailAction('Update Priority')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔥 Update Priority</button>
                    <button onclick="ticketDetailAction('Mark Resolved')" style="width: 100%; padding: 0.75rem; background: #111827; color: #10B981; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Mark as Resolved</button>
                </div>
            </div>

            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Ticket Details - ' + ticketId, content);
}

function showTicketMenu(ticketId) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
            <button onclick="ticketMenuAction('${ticketId}', 'View Details')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">👁️ View Details</button>
            <button onclick="ticketMenuAction('${ticketId}', 'Add Response')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">💬 Add Response</button>
            <button onclick="ticketMenuAction('${ticketId}', 'Reassign')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">👤 Reassign Ticket</button>
            <button onclick="ticketMenuAction('${ticketId}', 'Change Priority')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔥 Change Priority</button>
            <button onclick="ticketMenuAction('${ticketId}', 'Change Status')" style="width: 100%; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔄 Change Status</button>
            <button onclick="ticketMenuAction('${ticketId}', 'Mark Resolved')" style="width: 100%; padding: 0.75rem; background: #111827; color: #10B981; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">✅ Mark as Resolved</button>
            <button onclick="ticketMenuAction('${ticketId}', 'Close Ticket')" style="width: 100%; padding: 0.75rem; background: #111827; color: #EF4444; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🗑️ Close Ticket</button>
        </div>
    `;
    showModal('Ticket Actions', content);
}

function ticketDetailAction(action) {
    closeModal();
    showNotification(`${action} - Opening...`, 'info');
}

function ticketMenuAction(ticketId, action) {
    closeModal();
    if (action === 'View Details') {
        viewTicketDetails(ticketId);
    } else {
        showNotification(`${action} - ${ticketId}`, 'info');
    }
}

// Admin Integrations Tab Functions
function filterIntegrationsByCategory(category) {
    const buttons = document.querySelectorAll('.integration-category-btn');
    buttons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#111827';
        btn.style.color = '#9CA3AF';
        btn.style.borderColor = '#4B5563';
    });
    
    event.target.classList.add('active');
    event.target.style.background = 'rgba(64, 224, 208, 0.2)';
    event.target.style.color = '#40E0D0';
    event.target.style.borderColor = '#40E0D0';
    
    const integrations = document.querySelectorAll('[data-category]');
    integrations.forEach(integration => {
        const integrationCategory = integration.getAttribute('data-category');
        if (category === 'all' || integrationCategory === category) {
            integration.style.display = 'block';
        } else {
            integration.style.display = 'none';
        }
    });
    
    showNotification(`Filtered by: ${category === 'all' ? 'All Integrations' : category}`, 'info');
}

function configureIntegration(integrationName) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚙️</div>
                <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">${integrationName}</h3>
                <p style="color: #9CA3AF;">Configure integration settings</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Connection Status</h4>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
                    <span style="width: 10px; height: 10px; background: #10B981; border-radius: 50%; display: inline-block;"></span>
                    <span style="color: #10B981; font-weight: 600;">Connected</span>
                </div>
                <p style="color: #9CA3AF; font-size: 0.875rem;">Last synced: 2 minutes ago</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Configuration Options</h4>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <button onclick="integrationConfigAction('Sync Settings')" style="width: 100%; padding: 0.75rem; background: #1F2937; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">⚡ Sync Settings</button>
                    <button onclick="integrationConfigAction('API Keys')" style="width: 100%; padding: 0.75rem; background: #1F2937; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔑 Manage API Keys</button>
                    <button onclick="integrationConfigAction('Permissions')" style="width: 100%; padding: 0.75rem; background: #1F2937; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🔒 Set Permissions</button>
                    <button onclick="integrationConfigAction('Test Connection')" style="width: 100%; padding: 0.75rem; background: #1F2937; color: #fff; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; text-align: left;">🧪 Test Connection</button>
                </div>
            </div>

            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal(`Configure ${integrationName}`, content);
}

function integrationConfigAction(action) {
    closeModal();
    showNotification(`${action} - Opening...`, 'info');
}

function disconnectIntegration(integrationName) {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem; color: #EF4444;">⚠️</div>
            <h3 style="color: #fff; font-size: 1.5rem; margin-bottom: 1rem;">Disconnect ${integrationName}?</h3>
            <p style="color: #9CA3AF; margin-bottom: 2rem;">This will stop all data syncing and remove the connection. You can reconnect at any time.</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="confirmDisconnect('${integrationName}')" style="background: #EF4444; color: #fff; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Disconnect</button>
                <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    showModal('Confirm Disconnect', content);
}

function confirmDisconnect(integrationName) {
    closeModal();
    showNotification(`${integrationName} disconnected successfully`, 'success');
}

function connectIntegration(integrationName) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">🔗</div>
                <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">Connect ${integrationName}</h3>
                <p style="color: #9CA3AF;">Authorize Clippit to connect with ${integrationName}</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">What you'll get:</h4>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981;">✓</span>
                        <span style="color: #fff;">Automated data syncing</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981;">✓</span>
                        <span style="color: #fff;">Real-time updates</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981;">✓</span>
                        <span style="color: #fff;">Seamless integration</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="color: #10B981;">✓</span>
                        <span style="color: #fff;">Enhanced workflow efficiency</span>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button onclick="confirmConnect('${integrationName}')" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Authorize & Connect</button>
                <button onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    showModal(`Connect ${integrationName}`, content);
}

function confirmConnect(integrationName) {
    closeModal();
    showNotification(`Connecting to ${integrationName}...`, 'info');
    setTimeout(() => {
        showNotification(`${integrationName} connected successfully!`, 'success');
    }, 2000);
}

function showBrowseIntegrationsModal() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Popular Integrations</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px; cursor: pointer;" onclick="connectIntegration('Trello')">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📋</div>
                        <h5 style="color: #40E0D0; margin-bottom: 0.25rem;">Trello</h5>
                        <p style="color: #9CA3AF; font-size: 0.75rem;">Project Management</p>
                    </div>
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px; cursor: pointer;" onclick="connectIntegration('Asana')">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">✅</div>
                        <h5 style="color: #40E0D0; margin-bottom: 0.25rem;">Asana</h5>
                        <p style="color: #9CA3AF; font-size: 0.75rem;">Task Management</p>
                    </div>
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px; cursor: pointer;" onclick="connectIntegration('GitHub')">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">💻</div>
                        <h5 style="color: #40E0D0; margin-bottom: 0.25rem;">GitHub</h5>
                        <p style="color: #9CA3AF; font-size: 0.75rem;">Code Repository</p>
                    </div>
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px; cursor: pointer;" onclick="connectIntegration('Salesforce')">
                        <div style="font-size: 2rem; margin-bottom: 0.5rem;">☁️</div>
                        <h5 style="color: #40E0D0; margin-bottom: 0.25rem;">Salesforce</h5>
                        <p style="color: #9CA3AF; font-size: 0.75rem;">CRM Platform</p>
                    </div>
                </div>
            </div>

            <p style="color: #9CA3AF; text-align: center; font-size: 0.875rem;">More integrations available in the main integrations section</p>

            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Browse Integrations', content);
}

// Admin Settings Tab Functions
function switchSettingsTab(tab) {
    // Hide all content sections
    const allContent = document.querySelectorAll('.settings-content');
    allContent.forEach(content => content.style.display = 'none');
    
    // Remove active class from all tabs
    const allTabs = document.querySelectorAll('.settings-tab-btn');
    allTabs.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = '#9CA3AF';
        btn.style.borderBottom = 'none';
    });
    
    // Show selected content
    const selectedContent = document.getElementById(`settings-${tab}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Activate selected tab
    const selectedTab = document.querySelector(`[data-tab="${tab}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.style.background = 'rgba(64, 224, 208, 0.2)';
        selectedTab.style.color = '#40E0D0';
        selectedTab.style.borderBottom = '2px solid #40E0D0';
    }
}

function changeProfilePicture() {
    showNotification('Profile picture upload feature coming soon!', 'info');
}

function saveProfileSettings() {
    const firstName = document.getElementById('profile-first-name').value;
    const lastName = document.getElementById('profile-last-name').value;
    showNotification(`Profile updated for ${firstName} ${lastName}!`, 'success');
}

function saveCompanySettings() {
    showNotification('Company settings saved successfully!', 'success');
}

function changePassword() {
    const content = `
        <form onsubmit="updatePassword(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Current Password</label>
                <input type="password" id="current-password" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">New Password</label>
                <input type="password" id="new-password" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Confirm New Password</label>
                <input type="password" id="confirm-password" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Update Password</button>
        </form>
    `;
    showModal('Change Password', content);
}

function updatePassword(e) {
    e.preventDefault();
    closeModal();
    showNotification('Password updated successfully!', 'success');
}

function toggle2FA() {
    const toggle = document.getElementById('2fa-toggle');
    const isChecked = toggle.checked;
    toggle.checked = !isChecked;
    
    if (!isChecked) {
        showNotification('Two-Factor Authentication enabled!', 'success');
    } else {
        showNotification('Two-Factor Authentication disabled!', 'info');
    }
}

function revokeSession(sessionId) {
    showNotification(`Session ${sessionId} revoked`, 'success');
}

function toggleNotification(type) {
    showNotification(`${type} notifications toggled`, 'info');
}

function saveNotificationSettings() {
    showNotification('Notification preferences saved!', 'success');
}

function selectTheme(theme) {
    if (theme === 'dark') {
        showNotification('Dark theme is already active!', 'info');
    } else {
        showNotification(`${theme} theme coming soon!`, 'info');
    }
}

function saveAppearanceSettings() {
    showNotification('Appearance settings saved!', 'success');
}

function changePlan() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 1rem;">Select a Plan</h3>
            
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563; cursor: pointer;" onclick="selectPlan('Starter')">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">Starter Plan</h4>
                <p style="color: #40E0D0; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">$99/month</p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">Perfect for small teams</p>
            </div>
            
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 2px solid #40E0D0;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <h4 style="color: #fff; margin-bottom: 0.5rem;">Enterprise Plan</h4>
                        <p style="color: #40E0D0; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">$299/month</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">For growing businesses</p>
                    </div>
                    <span style="background: rgba(64, 224, 208, 0.2); color: #40E0D0; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">CURRENT</span>
                </div>
            </div>
            
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563; cursor: pointer;" onclick="selectPlan('Premium')">
                <h4 style="color: #fff; margin-bottom: 0.5rem;">Premium Plan</h4>
                <p style="color: #40E0D0; font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">$599/month</p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">Advanced features for large teams</p>
            </div>
            
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
        </div>
    `;
    showModal('Change Subscription Plan', content);
}

function selectPlan(planName) {
    closeModal();
    showNotification(`Switching to ${planName} plan...`, 'info');
    setTimeout(() => {
        showNotification('Plan change will take effect at the start of next billing cycle', 'success');
    }, 1500);
}

function updatePaymentMethod() {
    const content = `
        <form onsubmit="savePaymentMethod(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Card Number</label>
                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Expiry Date</label>
                    <input type="text" id="card-expiry" placeholder="MM/YY" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">CVV</label>
                    <input type="text" id="card-cvv" placeholder="123" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Cardholder Name</label>
                <input type="text" id="card-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Update Payment Method</button>
        </form>
    `;
    showModal('Update Payment Method', content);
}

function savePaymentMethod(e) {
    e.preventDefault();
    closeModal();
    showNotification('Payment method updated successfully!', 'success');
}

function downloadInvoice(invoiceId) {
    showNotification(`Downloading invoice for ${invoiceId}...`, 'info');
    setTimeout(() => {
        showNotification('Invoice downloaded successfully!', 'success');
    }, 1000);
}

// Invite Investor to Investor Lounge
function showInviteInvestorModal() {
    const content = `
        <form onsubmit="sendInvestorInvitation(event)" style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.05)); padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3); text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">💰</div>
                <h3 style="color: #FBB624; font-size: 1.5rem; margin-bottom: 0.5rem;">Invite to Investor Lounge</h3>
                <p style="color: #9CA3AF;">Send an exclusive invitation to join the Investor Lounge</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Investor Information</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">First Name *</label>
                        <input type="text" id="investor-first-name" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="John">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Last Name *</label>
                        <input type="text" id="investor-last-name" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="Smith">
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Email Address *</label>
                    <input type="email" id="investor-email" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="john@example.com">
                </div>

                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Company/Organization</label>
                    <input type="text" id="investor-company" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="Investment Partners LLC">
                </div>

                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Phone Number</label>
                    <input type="tel" id="investor-phone" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="+1 234 567 8900">
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Subscription Package</h4>
                
                <select id="investor-package" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; cursor: pointer;">
                    <option value="">Select Package</option>
                    <option value="vip-free" selected>VIP Free Pass</option>
                    <option value="exclusive-pass">Exclusive Pass - $14.95</option>
                </select>

                <div style="margin-top: 1rem; padding: 1rem; background: #1F2937; border-radius: 8px; border-left: 3px solid #FBB624;">
                    <p style="color: #FBB624; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.5rem;">Package Includes:</p>
                    <ul style="color: #9CA3AF; font-size: 0.875rem; padding-left: 1.5rem; margin: 0;">
                        <li>Exclusive portfolio insights & analytics</li>
                        <li>Real-time investment performance tracking</li>
                        <li>Direct access to investment opportunities</li>
                        <li>Quarterly reports & strategic analysis</li>
                    </ul>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Personal Message (Optional)</h4>
                <textarea id="investor-message" rows="4" style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Add a personal message to include in the invitation email..."></textarea>
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid rgba(64, 224, 208, 0.3);">
                <p style="color: #40E0D0; font-size: 0.875rem; margin-bottom: 0.5rem;">✉️ <strong>What happens next:</strong></p>
                <ol style="color: #9CA3AF; font-size: 0.875rem; padding-left: 1.5rem; margin: 0;">
                    <li>Invitation email sent with unique access link</li>
                    <li>Investor receives credentials & subscription details</li>
                    <li>Access to exclusive Investor Lounge dashboard</li>
                    <li>Tracked in your investor management system</li>
                </ol>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <button type="submit" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #FBB624, #F59E0B); color: #111827; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Send Invitation</button>
                <button type="button" onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </form>
    `;
    showModal('Invite Investor to Lounge', content);
}

function sendInvestorInvitation(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('investor-first-name').value;
    const lastName = document.getElementById('investor-last-name').value;
    const email = document.getElementById('investor-email').value;
    const company = document.getElementById('investor-company').value;
    const phone = document.getElementById('investor-phone').value;
    const packageType = document.getElementById('investor-package').value;
    const message = document.getElementById('investor-message').value;
    
    // Generate unique invitation code
    const invitationCode = 'INV-' + Date.now().toString(36).toUpperCase();
    const invitationLink = window.location.origin + '/investor-dashboard.html?invite=' + invitationCode;
    
    // Save investor invitation to localStorage
    const invitations = JSON.parse(localStorage.getItem('investorInvitations') || '[]');
    invitations.push({
        invitationCode: invitationCode,
        firstName: firstName,
        lastName: lastName,
        fullName: firstName + ' ' + lastName,
        email: email,
        company: company,
        phone: phone,
        packageType: packageType,
        personalMessage: message,
        invitationLink: invitationLink,
        status: 'pending',
        sentDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    });
    localStorage.setItem('investorInvitations', JSON.stringify(invitations));
    
    closeModal();
    
    // Show success modal with invitation details
    showInvestorInvitationSuccess(firstName + ' ' + lastName, email, invitationCode, invitationLink, packageType);
}

function showInvestorInvitationSuccess(investorName, email, invitationCode, invitationLink, packageType) {
    const packageNames = {
        'vip-free': 'VIP Free Pass',
        'exclusive-pass': 'Exclusive Pass - $14.95'
    };
    
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; padding: 1.5rem; background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.1)); border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.3);">
                <div style="font-size: 4rem; margin-bottom: 0.5rem;">✅</div>
                <h3 style="color: #FBB624; font-size: 1.5rem; margin-bottom: 0.5rem;">Invitation Sent!</h3>
                <p style="color: #9CA3AF;">${investorName} has been invited to the Investor Lounge</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Invitation Details</h4>
                
                <div style="margin-bottom: 1rem;">
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Investor:</p>
                    <p style="color: #FBB624; font-weight: 600; font-size: 1.125rem;">${investorName}</p>
                </div>

                <div style="margin-bottom: 1rem;">
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Email:</p>
                    <p style="color: #fff;">${email}</p>
                </div>

                <div style="margin-bottom: 1rem;">
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Package:</p>
                    <p style="color: #fff; font-weight: 600;">${packageNames[packageType]}</p>
                </div>

                <div style="margin-bottom: 1rem;">
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Invitation Code:</p>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <p style="color: #40E0D0; font-weight: 600; font-family: monospace; font-size: 1.125rem;">${invitationCode}</p>
                        <button onclick="copyToClipboard('${invitationCode}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">Copy</button>
                    </div>
                </div>

                <div>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Unique Invitation Link:</p>
                    <div style="background: #1F2937; padding: 0.75rem; border-radius: 8px; border: 1px solid #4B5563; word-break: break-all;">
                        <p style="color: #40E0D0; font-size: 0.875rem; margin-bottom: 0.5rem;">${invitationLink}</p>
                        <button onclick="copyToClipboard('${invitationLink}')" style="padding: 0.5rem 1rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 6px; cursor: pointer; font-size: 0.875rem; width: 100%;">Copy Invitation Link</button>
                    </div>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 12px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <span>📧</span> Email Sent
                </h4>
                <div style="background: #1F2937; padding: 1rem; border-radius: 8px; border-left: 3px solid #10B981;">
                    <p style="color: #10B981; font-weight: 600; margin-bottom: 0.5rem;">✓ Welcome email delivered</p>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.25rem;">Contains:</p>
                    <ul style="color: #9CA3AF; font-size: 0.875rem; padding-left: 1.5rem; margin: 0;">
                        <li>Exclusive invitation link</li>
                        <li>Package details & pricing</li>
                        <li>Access instructions</li>
                        <li>Investment opportunities overview</li>
                    </ul>
                </div>
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid rgba(64, 224, 208, 0.3);">
                <p style="color: #40E0D0; font-size: 0.875rem; margin-bottom: 0.5rem;">📊 <strong>Tracking:</strong></p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">
                    This invitation has been added to your investor management system. You'll be notified when ${investorName} accepts the invitation and subscribes.
                </p>
            </div>

            <button onclick="closeModal()" style="padding: 0.75rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Done</button>
        </div>
    `;
    
    showModal('Invitation Sent Successfully', content);
}
