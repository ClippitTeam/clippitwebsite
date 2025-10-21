// Admin Dashboard Interactive Features

document.addEventListener('DOMContentLoaded', function() {
    // Create modal container
    createModalContainer();
    
    // Navigation item interactions
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
    });

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
        <form onsubmit="generateInvoice(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client</label>
                <select id="invoice-client" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select Client</option>
                    <option value="techstart">TechStart Inc.</option>
                    <option value="fitlife">FitLife App</option>
                    <option value="globalcorp">GlobalCorp</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Service Description</label>
                <input type="text" id="invoice-description" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="e.g., Website Development">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Amount (AUD)</label>
                <input type="number" id="invoice-amount" required min="0" step="0.01" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="5000.00">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Due Date</label>
                <input type="date" id="invoice-due-date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <input type="checkbox" id="invoice-send-email" style="width: 20px; height: 20px;">
                <label for="invoice-send-email" style="color: #fff;">Send invoice email to client</label>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Generate Invoice</button>
        </form>
    `;
    showModal('Create Invoice', content);
}

function generateInvoice(e) {
    e.preventDefault();
    const client = document.getElementById('invoice-client').selectedOptions[0].text;
    const amount = document.getElementById('invoice-amount').value;
    closeModal();
    showNotification(`Invoice for ${client} ($${amount}) generated successfully!`, 'success');
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
    closeModal();
    showNotification(`Client "${clientName}" added successfully!`, 'success');
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
