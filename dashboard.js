// Dashboard Interactive Features

// Authentication Check - Redirect if not logged in
if (!sessionStorage.getItem('isLoggedIn') || sessionStorage.getItem('loginType') !== 'customer') {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', function() {
    // Create modal container
    createModalContainer();
    
    // Mobile menu toggle for dashboard sidebar
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const dashboardSidebar = document.querySelector('.dashboard-sidebar');
    
    if (mobileMenuToggle && dashboardSidebar) {
        mobileMenuToggle.addEventListener('click', function() {
            dashboardSidebar.classList.toggle('active');
        });
    }

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
            const mainDashboard = document.querySelector('.dashboard-welcome');
            const healthIndicators = document.querySelector('.health-indicators');
            const dashboardGrid = document.querySelector('.dashboard-grid');
            
            // Show appropriate section based on href
            if (href === '#dashboard') {
                // Show main dashboard
                if (mainDashboard) mainDashboard.style.display = 'block';
                if (healthIndicators) healthIndicators.style.display = 'flex';
                if (dashboardGrid) dashboardGrid.style.display = 'grid';
            } else {
                // Hide main dashboard sections for all other tabs
                if (mainDashboard) mainDashboard.style.display = 'none';
                if (healthIndicators) healthIndicators.style.display = 'none';
                if (dashboardGrid) dashboardGrid.style.display = 'none';
                
                // Show the appropriate section
                if (href === '#projects') {
                    const projectsSection = document.getElementById('section-projects');
                    if (projectsSection) projectsSection.style.display = 'block';
                } else if (href === '#tickets') {
                    const ticketsSection = document.getElementById('section-tickets');
                    if (ticketsSection) ticketsSection.style.display = 'block';
                } else if (href === '#billing') {
                    const billingSection = document.getElementById('section-billing');
                    if (billingSection) billingSection.style.display = 'block';
                } else if (href === '#calendar') {
                    const calendarSection = document.getElementById('section-calendar');
                    if (calendarSection) calendarSection.style.display = 'block';
                } else if (href === '#investor-opportunities') {
                    const investorSection = document.getElementById('section-investor-opportunities');
                    if (investorSection) investorSection.style.display = 'block';
                } else if (href === '#settings') {
                    const settingsSection = document.getElementById('section-settings');
                    if (settingsSection) settingsSection.style.display = 'block';
                } else if (href === '#chat') {
                    showNotification('Live Chat coming soon', 'info');
                }
            }
        });
    });

    // Quick Action: New Ticket
    const newTicketBtn = document.querySelector('.quick-action-btn[title="New Ticket"]');
    if (newTicketBtn) {
        newTicketBtn.addEventListener('click', function() {
            showNewTicketModal();
        });
    }

    // Quick Action: Join Video Call
    const joinCallBtn = document.querySelector('.quick-action-btn[title="Join Video Call"]');
    if (joinCallBtn) {
        joinCallBtn.addEventListener('click', function() {
            showVideoCallModal();
        });
    }

    // Quick Action: Upload File
    const uploadBtn = document.querySelector('.quick-action-btn[title="Upload File"]');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            showUploadModal();
        });
    }

    // Notification icon click
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            showNotificationsPanel();
        });
    }

    // Card action buttons
    const cardActions = document.querySelectorAll('.card-action');
    cardActions.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const cardTitle = this.closest('.dashboard-card').querySelector('h2').textContent;
            
            if (this.textContent.includes('View All')) {
                showNotification(`Opening ${cardTitle}...`, 'info');
            } else if (this.textContent.includes('New Ticket')) {
                showNewTicketModal();
            } else if (this.textContent.includes('Manage')) {
                showNotification(`Opening ${cardTitle} management...`, 'info');
            }
        });
    });

    // Project items click
    const projectItems = document.querySelectorAll('.project-item');
    projectItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const projectName = this.querySelector('h4').textContent;
            showProjectDetailsModal(projectName);
        });
    });

    // Milestone items click
    const milestoneItems = document.querySelectorAll('.milestone-item');
    milestoneItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const milestoneName = this.querySelector('h4').textContent;
            showNotification(`Opening milestone: ${milestoneName}`, 'info');
        });
    });

    // Invoice items click
    const invoiceItems = document.querySelectorAll('.invoice-item');
    invoiceItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const invoiceNumber = this.querySelector('h4').textContent;
            showInvoiceModal(invoiceNumber);
        });
    });

    // Domain items click
    const domainItems = document.querySelectorAll('.domain-item');
    domainItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const domainName = this.querySelector('h4').textContent;
            showDomainModal(domainName);
        });
    });

    // Ticket items click
    const ticketItems = document.querySelectorAll('.ticket-item');
    ticketItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            const ticketTitle = this.querySelector('h4').textContent;
            const ticketNumber = this.querySelector('p').textContent.split('•')[0].trim();
            showTicketModal(ticketTitle, ticketNumber);
        });
    });
});

// Create modal container
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

// Show modal
function showModal(title, content) {
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div style="background: #1F2937; border: 1px solid #4B5563; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="color: #40E0D0; font-size: 1.5rem;">${title}</h2>
                <button onclick="closeModal()" style="background: none; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer; padding: 0; width: 30px; height: 30px;">&times;</button>
            </div>
            <div style="color: #9CA3AF;">${content}</div>
        </div>
    `;
    modal.style.display = 'flex';
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'none';
}

// Show New Ticket Modal
function showNewTicketModal() {
    const content = `
        <form onsubmit="submitTicket(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Subject</label>
                <input type="text" id="ticket-subject" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Priority</label>
                <select id="ticket-priority" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="low">Low</option>
                    <option value="standard" selected>Standard</option>
                    <option value="high">High</option>
                </select>
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Description</label>
                <textarea id="ticket-description" rows="5" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;"></textarea>
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Submit Ticket</button>
        </form>
    `;
    showModal('Create New Support Ticket', content);
}

// Submit ticket
function submitTicket(e) {
    e.preventDefault();
    const subject = document.getElementById('ticket-subject').value;
    const priority = document.getElementById('ticket-priority').value;
    const description = document.getElementById('ticket-description').value;
    
    closeModal();
    showNotification(`Ticket created: ${subject} (Priority: ${priority})`, 'success');
}

// Show Video Call Modal
function showVideoCallModal() {
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📹</div>
            <p style="margin-bottom: 1.5rem;">Ready to start a video call with your project manager?</p>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button onclick="startVideoCall()" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Start Call</button>
                <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    showModal('Join Video Call', content);
}

// Start video call
function startVideoCall() {
    closeModal();
    showNotification('Connecting to video call...', 'info');
    setTimeout(() => {
        showNotification('Video call feature coming soon!', 'info');
    }, 1500);
}

// Show Upload Modal
function showUploadModal() {
    const content = `
        <form onsubmit="uploadFile(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">File Name</label>
                <input type="text" id="file-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>
            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Category</label>
                <select id="file-category" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="design">Design Assets</option>
                    <option value="documents">Documents</option>
                    <option value="media">Media Files</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('file-input').click()">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📤</div>
                <p>Click to select file or drag and drop</p>
                <input type="file" id="file-input" style="display: none;">
            </div>
            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Upload File</button>
        </form>
    `;
    showModal('Upload File', content);
}

// Upload file
function uploadFile(e) {
    e.preventDefault();
    const fileName = document.getElementById('file-name').value;
    const category = document.getElementById('file-category').value;
    
    closeModal();
    showNotification(`Uploading ${fileName} to ${category}...`, 'info');
    setTimeout(() => {
        showNotification('File uploaded successfully!', 'success');
    }, 1500);
}

// Show Notifications Panel
function showNotificationsPanel() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">✅</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>Design approved</strong></p>
                        <p style="font-size: 0.875rem;">2 hours ago</p>
                    </div>
                </div>
            </div>
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">💬</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>New message from Sarah</strong></p>
                        <p style="font-size: 0.875rem;">4 hours ago</p>
                    </div>
                </div>
            </div>
            <div style="padding: 1rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="font-size: 1.5rem;">📄</span>
                    <div style="flex: 1;">
                        <p style="color: #fff; margin-bottom: 0.25rem;"><strong>Invoice #1234 paid</strong></p>
                        <p style="font-size: 0.875rem;">Yesterday</p>
                    </div>
                </div>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 1px solid #40E0D0; padding: 0.75rem; border-radius: 8px; cursor: pointer; margin-top: 1rem;">Mark all as read</button>
        </div>
    `;
    showModal('Notifications', content);
}

// Show Project Details Modal
function showProjectDetailsModal(projectName) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Project Status</h3>
                <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563;">
                    <p style="margin-bottom: 0.5rem;">Current Phase: <strong style="color: #40E0D0;">Development</strong></p>
                    <p>Team: Sarah Chen, Marcus Rodriguez</p>
                </div>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Recent Updates</h3>
                <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563;">
                    <p>✅ Backend API completed</p>
                    <p>🔄 Frontend integration in progress</p>
                    <p>📅 Next review: Oct 28, 2025</p>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button onclick="closeModal()" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">View Full Details</button>
                <button onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    showModal(projectName, content);
}

// Show Invoice Modal
function showInvoiceModal(invoiceNumber) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">Invoice Date</p>
                        <p style="color: #fff;">October 15, 2025</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="color: #9CA3AF; font-size: 0.875rem;">Due Date</p>
                        <p style="color: #fff;">October 30, 2025</p>
                    </div>
                </div>
                <div style="border-top: 1px solid #4B5563; padding-top: 1rem;">
                    <p style="margin-bottom: 0.5rem;">Development Services</p>
                    <p style="font-size: 2rem; color: #40E0D0; font-weight: 800;">$2,999.00</p>
                </div>
                <div style="margin-top: 1rem; padding: 0.5rem 1rem; background: rgba(16, 185, 129, 0.2); border-radius: 20px; display: inline-block;">
                    <span style="color: #10B981; font-weight: 600;">✓ Paid</span>
                </div>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button onclick="downloadInvoice()" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Download PDF</button>
                <button onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    showModal(invoiceNumber, content);
}

// Download invoice
function downloadInvoice() {
    closeModal();
    showNotification('Downloading invoice PDF...', 'info');
    setTimeout(() => {
        showNotification('Invoice downloaded successfully!', 'success');
    }, 1000);
}

// Show Domain Modal
function showDomainModal(domainName) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <p style="margin-bottom: 1rem;"><strong style="color: #fff;">Domain:</strong> ${domainName}</p>
                <p style="margin-bottom: 1rem;"><strong style="color: #fff;">Status:</strong> <span style="color: #10B981;">Active</span></p>
                <p style="margin-bottom: 1rem;"><strong style="color: #fff;">Expires:</strong> Dec 15, 2025</p>
                <p><strong style="color: #fff;">Auto-Renew:</strong> Enabled</p>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Quick Actions</h3>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    <button onclick="manageD NS()" style="background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">⚙️ Manage DNS Settings</button>
                    <button onclick="closeModal()" style="background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">🔄 Renew Domain</button>
                    <button onclick="closeModal()" style="background: #111827; color: #fff; border: 1px solid #4B5563; padding: 0.75rem; border-radius: 8px; cursor: pointer; text-align: left;">📧 Configure Email</button>
                </div>
            </div>
            <button onclick="closeModal()" style="background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Domain Management - ' + domainName, content);
}

// Manage DNS
function manageDNS() {
    closeModal();
    showNotification('Opening DNS management...', 'info');
}

// Show Ticket Modal
function showTicketModal(ticketTitle, ticketNumber) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <p style="margin-bottom: 0.5rem;"><strong style="color: #fff;">${ticketNumber}</strong></p>
                <p style="margin-bottom: 1rem; color: #9CA3AF;">Opened 3 hours ago</p>
                <div style="margin-bottom: 1rem; padding: 0.25rem 0.75rem; background: rgba(239, 68, 68, 0.2); border-radius: 20px; display: inline-block;">
                    <span style="color: #EF4444; font-weight: 600; font-size: 0.75rem;">HIGH PRIORITY</span>
                </div>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Description</h3>
                <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563;">
                    <p>SSL certificate renewal needed for the production environment.</p>
                </div>
            </div>
            <div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">Add Response</h3>
                <textarea placeholder="Type your message..." style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" rows="4"></textarea>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button onclick="sendTicketResponse()" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Send Response</button>
                <button onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    showModal(ticketTitle, content);
}

// Send ticket response
function sendTicketResponse() {
    closeModal();
    showNotification('Response sent successfully!', 'success');
}

// Customer Dashboard - Projects Tab Functions
function viewProjectDetails(projectId) {
    // Hide projects grid, show details view
    const projectsGrid = document.querySelector('.projects-grid');
    const detailsView = document.getElementById('project-details-view');
    
    if (projectsGrid) projectsGrid.style.display = 'none';
    if (detailsView) detailsView.style.display = 'block';
    
    showNotification('Loading project details...', 'info');
}

function hideProjectDetails() {
    // Show projects grid, hide details view
    const projectsGrid = document.querySelector('.projects-grid');
    const detailsView = document.getElementById('project-details-view');
    
    if (projectsGrid) projectsGrid.style.display = 'grid';
    if (detailsView) detailsView.style.display = 'none';
}

// Customer Dashboard - Tickets Tab Functions
function viewTicketDetails(ticketId) {
    // Hide tickets list, show details view
    const ticketsList = document.getElementById('tickets-list');
    const detailsView = document.getElementById('ticket-details-view');
    
    if (ticketsList) ticketsList.style.display = 'none';
    if (detailsView) detailsView.style.display = 'block';
    
    showNotification('Loading ticket details...', 'info');
}

function hideTicketDetails() {
    // Show tickets list, hide details view
    const ticketsList = document.getElementById('tickets-list');
    const detailsView = document.getElementById('ticket-details-view');
    
    if (ticketsList) ticketsList.style.display = 'flex';
    if (detailsView) detailsView.style.display = 'none';
}

function submitTicketResponse(e) {
    e.preventDefault();
    const response = document.getElementById('ticket-response');
    if (response && response.value.trim()) {
        showNotification('Response sent successfully!', 'success');
        response.value = '';
    } else {
        showNotification('Please enter a response', 'warning');
    }
}

function attachFile() {
    showNotification('File attachment feature coming soon', 'info');
}

// Customer Dashboard - Billing Tab Functions
function payInvoice(invoiceNumber, amount) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">💳</div>
                <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">Pay Invoice #${invoiceNumber}</h3>
                <p style="color: #fff; font-size: 2rem; font-weight: 800;">$${amount.toFixed(2)}</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Select Payment Method</h4>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div onclick="selectPaymentMethod('visa4242')" style="padding: 1rem; background: #1F2937; border: 2px solid #40E0D0; border-radius: 8px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="color: #fff; font-weight: 600; margin-bottom: 0.25rem;">💳 Visa ending in 4242</p>
                            <p style="color: #9CA3AF; font-size: 0.875rem;">Expires 12/2027</p>
                        </div>
                        <span style="color: #40E0D0; font-size: 1.5rem;">✓</span>
                    </div>
                    <div onclick="addPaymentMethod()" style="padding: 1rem; background: #1F2937; border: 2px dashed #4B5563; border-radius: 8px; cursor: pointer; text-align: center;">
                        <p style="color: #40E0D0; font-weight: 600;">+ Add New Payment Method</p>
                    </div>
                </div>
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p>✓ Secure payment via Stripe</p>
                <p>✓ Instant payment confirmation</p>
                <p>✓ Receipt sent to your email</p>
            </div>

            <button onclick="processPayment('${invoiceNumber}', ${amount})" style="width: 100%; padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1.125rem;">Complete Payment</button>
        </div>
    `;
    showModal('Pay Invoice', content);
}

function processPayment(invoiceNumber, amount) {
    closeModal();
    showNotification('Processing payment...', 'info');
    
    // Simulate payment processing
    setTimeout(() => {
        showNotification(`Payment of $${amount.toFixed(2)} successful!`, 'success');
        setTimeout(() => {
            showNotification('Receipt sent to your email', 'info');
        }, 1500);
    }, 2000);
}

function viewInvoiceDetails(invoiceNumber) {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <div>
                        <h4 style="color: #40E0D0; font-size: 1.25rem; margin-bottom: 0.5rem;">Invoice #${invoiceNumber}</h4>
                        <p style="color: #9CA3AF;">Issued: Oct 20, 2025</p>
                        <p style="color: #9CA3AF;">Due: Nov 5, 2025</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="background: rgba(251, 191, 36, 0.2); color: #FBB624; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600;">DUE NOW</span>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #4B5563; padding-top: 1.5rem;">
                    <h5 style="color: #fff; margin-bottom: 1rem;">Line Items</h5>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #9CA3AF;">E-Commerce Platform Development</span>
                        <span style="color: #fff;">$2,500.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #9CA3AF;">Payment Gateway Integration</span>
                        <span style="color: #fff;">$399.00</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #9CA3AF;">Security Audit</span>
                        <span style="color: #fff;">$100.00</span>
                    </div>
                    
                    <div style="border-top: 1px solid #4B5563; margin-top: 1rem; padding-top: 1rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: #9CA3AF;">Subtotal</span>
                            <span style="color: #fff;">$2,999.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: #9CA3AF;">Tax (0%)</span>
                            <span style="color: #fff;">$0.00</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1.25rem;">
                            <span style="color: #fff; font-weight: 700;">Total</span>
                            <span style="color: #40E0D0; font-weight: 800;">$2,999.00</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button onclick="downloadInvoicePDF('${invoiceNumber}')" style="flex: 1; padding: 0.75rem 1.5rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer;">📥 Download PDF</button>
                <button onclick="closeModal()" style="flex: 1; padding: 0.75rem 1.5rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    showModal('Invoice Details', content);
}

function downloadInvoicePDF(invoiceNumber) {
    closeModal();
    showNotification(`Downloading Invoice #${invoiceNumber}...`, 'info');
    setTimeout(() => {
        showNotification('Invoice PDF downloaded successfully!', 'success');
    }, 1000);
}

function downloadReceipt(invoiceNumber) {
    showNotification(`Downloading receipt for Invoice #${invoiceNumber}...`, 'info');
    setTimeout(() => {
        showNotification('Receipt PDF downloaded successfully!', 'success');
    }, 1000);
}

function addPaymentMethod() {
    const content = `
        <form onsubmit="submitPaymentMethod(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">💳</div>
                <h3 style="color: #40E0D0; font-size: 1.25rem;">Add Payment Method</h3>
                <p style="color: #9CA3AF; font-size: 0.875rem;">Enter your card details</p>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Card Number</label>
                <input type="text" id="card-number" placeholder="1234 5678 9012 3456" maxlength="19" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Expiry Date</label>
                    <input type="text" id="card-expiry" placeholder="MM/YY" maxlength="5" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">CVC</label>
                    <input type="text" id="card-cvc" placeholder="123" maxlength="4" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Cardholder Name</label>
                <input type="text" id="card-name" placeholder="John Davis" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p>🔒 Your payment information is encrypted and secure</p>
                <p>💳 Powered by Stripe</p>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Add Card</button>
        </form>
    `;
    showModal('Add Payment Method', content);
}

function submitPaymentMethod(e) {
    e.preventDefault();
    const cardNumber = document.getElementById('card-number').value;
    const last4 = cardNumber.slice(-4);
    
    closeModal();
    showNotification('Adding payment method...', 'info');
    
    setTimeout(() => {
        showNotification(`Card ending in ${last4} added successfully!`, 'success');
    }, 1500);
}

function updateBillingInfo() {
    const content = `
        <form onsubmit="submitBillingInfo(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📝</div>
                <h3 style="color: #40E0D0; font-size: 1.25rem;">Update Billing Information</h3>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Company Name</label>
                <input type="text" value="Davis Enterprises Ltd" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Contact Email</label>
                <input type="email" value="john@davisenterprises.com" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Business Number</label>
                <input type="text" value="ABN 12 345 678 901" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Street Address</label>
                <input type="text" value="123 Business Street" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">City</label>
                    <input type="text" value="Sydney" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">State</label>
                    <input type="text" value="NSW" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Postcode</label>
                    <input type="text" value="2000" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Save Changes</button>
        </form>
    `;
    showModal('Update Billing Information', content);
}

function submitBillingInfo(e) {
    e.preventDefault();
    closeModal();
    showNotification('Updating billing information...', 'info');
    
    setTimeout(() => {
        showNotification('Billing information updated successfully!', 'success');
    }, 1500);
}

function selectPaymentMethod(methodId) {
    showNotification('Payment method selected', 'info');
}

// Customer Dashboard - Calendar Tab Functions
function requestMeeting() {
    const content = `
        <form onsubmit="submitMeetingRequest(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">📅</div>
                <h3 style="color: #40E0D0; font-size: 1.25rem;">Request Meeting</h3>
                <p style="color: #9CA3AF; font-size: 0.875rem;">Schedule a meeting with your project team</p>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Meeting Purpose</label>
                <input type="text" id="meeting-purpose" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" placeholder="e.g., Progress Review">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Preferred Date</label>
                <input type="date" id="meeting-date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Preferred Time</label>
                <select id="meeting-time" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                </select>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Meeting Type</label>
                <select id="meeting-type" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="video">Video Call</option>
                    <option value="phone">Phone Call</option>
                    <option value="in-person">In-Person</option>
                </select>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Additional Notes (Optional)</label>
                <textarea id="meeting-notes" rows="3" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Any specific topics to discuss?"></textarea>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Submit Request</button>
        </form>
    `;
    showModal('Request Meeting', content);
}

function submitMeetingRequest(e) {
    e.preventDefault();
    const purpose = document.getElementById('meeting-purpose').value;
    const date = document.getElementById('meeting-date').value;
    
    closeModal();
    showNotification('Meeting request submitted successfully!', 'success');
    setTimeout(() => {
        showNotification(`Request for "${purpose}" on ${date} sent to your project team`, 'info');
    }, 1500);
}

function previousMonth() {
    showNotification('Navigating to previous month...', 'info');
}

function nextMonth() {
    showNotification('Navigating to next month...', 'info');
}

function viewEventDetails(eventId) {
    const events = {
        'team-chat-nov10': {
            title: 'Weekly Team Sync',
            date: 'November 10, 2025',
            time: '2:00 PM - 3:00 PM',
            type: 'Video Call',
            attendees: ['Mike Johnson (Lead Developer)', 'John Davis (You)'],
            description: 'Regular weekly sync to discuss project progress, address any blockers, and plan upcoming work.',
            icon: '💬'
        },
        'first-demo': {
            title: 'First Demo Session',
            date: 'November 16, 2025',
            time: '10:00 AM - 11:30 AM',
            type: 'Milestone',
            attendees: ['Sarah Miller (Project Lead)', 'Mike Johnson', 'John Davis (You)'],
            description: 'First live demonstration of the E-Commerce Platform. Review core functionality and gather feedback.',
            icon: '🎯'
        },
        'weekly-sync-nov20': {
            title: 'Weekly Progress Update',
            date: 'November 20, 2025',
            time: '3:00 PM - 4:00 PM',
            type: 'Video Call',
            attendees: ['Sarah Miller (Project Lead)', 'John Davis (You)'],
            description: 'Weekly progress update and planning session. Review completed work and discuss next steps.',
            icon: '💬'
        },
        'handover-day': {
            title: 'Project Handover Day',
            date: 'November 24, 2025',
            time: '11:00 AM - 1:00 PM',
            type: 'Milestone',
            attendees: ['Sarah Miller', 'Mike Johnson', 'John Davis (You)'],
            description: 'Final project handover meeting. Transfer of all documentation, credentials, and final deliverables.',
            icon: '🎉'
        },
        'project-end': {
            title: 'Project Completion',
            date: 'November 30, 2025',
            time: 'All Day',
            type: 'Milestone',
            attendees: ['All Team Members'],
            description: 'Official project completion date. All deliverables finalized and project closed.',
            icon: '🏁'
        }
    };
    
    const event = events[eventId];
    if (!event) return;
    
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">${event.icon}</div>
                <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">${event.title}</h3>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Date</p>
                        <p style="color: #fff; font-weight: 600;">${event.date}</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Time</p>
                        <p style="color: #fff; font-weight: 600;">${event.time}</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Type</p>
                        <p style="color: #fff; font-weight: 600;">${event.type}</p>
                    </div>
                </div>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Description</h4>
                <p style="color: #9CA3AF; line-height: 1.6;">${event.description}</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">Attendees</h4>
                <ul style="color: #9CA3AF; margin-left: 1.25rem;">
                    ${event.attendees.map(attendee => `<li style="margin-bottom: 0.5rem;">${attendee}</li>`).join('')}
                </ul>
            </div>

            <div style="display: flex; gap: 1rem;">
                ${event.type === 'Video Call' ? 
                    `<button onclick="joinVideoCall('${eventId}'); closeModal();" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Join Meeting</button>` : 
                    ''}
                <button onclick="closeModal()" style="flex: 1; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; padding: 0.75rem; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    showModal('Event Details', content);
}

function joinVideoCall(eventId) {
    showNotification('Connecting to video call...', 'info');
    setTimeout(() => {
        showNotification('Video call feature will open in your default browser', 'info');
    }, 1500);
}

// Settings Tab Functions
function switchSettingsTab(tab) {
    // Hide all settings content
    const allContent = document.querySelectorAll('.settings-content');
    allContent.forEach(content => content.style.display = 'none');
    
    // Remove active class from all nav buttons
    const allButtons = document.querySelectorAll('.settings-nav-btn');
    allButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = 'transparent';
        btn.style.color = '#9CA3AF';
    });
    
    // Show selected content
    const selectedContent = document.getElementById(`settings-${tab}`);
    if (selectedContent) {
        selectedContent.style.display = 'block';
    }
    
    // Activate selected button
    const selectedButton = document.querySelector(`[data-setting="${tab}"]`);
    if (selectedButton) {
        selectedButton.classList.add('active');
        selectedButton.style.background = 'rgba(64, 224, 208, 0.2)';
        selectedButton.style.color = '#40E0D0';
    }
    
    showNotification(`Switched to ${tab} settings`, 'info');
}

function saveProfileSettings(e) {
    e.preventDefault();
    showNotification('Saving profile changes...', 'info');
    setTimeout(() => {
        showNotification('Profile updated successfully!', 'success');
    }, 1000);
}

function uploadProfilePicture() {
    showNotification('Opening file picker...', 'info');
    setTimeout(() => {
        showNotification('Profile picture upload feature coming soon', 'info');
    }, 500);
}

function changePassword(e) {
    e.preventDefault();
    showNotification('Updating password...', 'info');
    setTimeout(() => {
        showNotification('Password changed successfully!', 'success');
    }, 1500);
}

function enable2FA() {
    showNotification('Enabling two-factor authentication...', 'info');
    setTimeout(() => {
        showNotification('2FA enabled! Please check your email for setup instructions', 'success');
    }, 1500);
}

function revokeSession() {
    showNotification('Revoking session...', 'info');
    setTimeout(() => {
        showNotification('Session revoked successfully', 'success');
    }, 1000);
}

function saveNotificationSettings() {
    showNotification('Saving notification preferences...', 'info');
    setTimeout(() => {
        showNotification('Notification settings saved!', 'success');
    }, 1000);
}

function selectTheme(theme) {
    showNotification(`Switching to ${theme} theme...`, 'info');
    setTimeout(() => {
        showNotification(`${theme.charAt(0).toUpperCase() + theme.slice(1)} theme activated!`, 'success');
    }, 500);
}

function saveAppearanceSettings() {
    showNotification('Saving appearance settings...', 'info');
    setTimeout(() => {
        showNotification('Appearance settings saved!', 'success');
    }, 1000);
}

function downloadData() {
    showNotification('Preparing your data for download...', 'info');
    setTimeout(() => {
        showNotification('Data archive will be sent to your email within 24 hours', 'info');
    }, 1500);
}

function exportProjects() {
    showNotification('Exporting project data...', 'info');
    setTimeout(() => {
        showNotification('Project data exported successfully!', 'success');
    }, 1000);
}

function confirmDeleteAccount() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; text-align: center;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
            <h3 style="color: #EF4444; font-size: 1.5rem;">Delete Account</h3>
            <p style="color: #9CA3AF;">This action cannot be undone. All your data, projects, and settings will be permanently deleted.</p>
            <div style="background: rgba(239, 68, 68, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid rgba(239, 68, 68, 0.3);">
                <p style="color: #EF4444; font-weight: 600; margin-bottom: 0.5rem;">You will lose:</p>
                <ul style="color: #9CA3AF; text-align: left; margin-left: 1.5rem;">
                    <li>All project data and files</li>
                    <li>Billing history and invoices</li>
                    <li>Support tickets and conversations</li>
                    <li>Calendar events and meetings</li>
                </ul>
            </div>
            <p style="color: #fff; font-weight: 600;">Type DELETE to confirm:</p>
            <input type="text" id="delete-confirm" placeholder="Type DELETE" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #EF4444; border-radius: 8px; color: #fff; text-align: center;">
            <div style="display: flex; gap: 1rem;">
                <button onclick="closeModal()" style="flex: 1; padding: 0.75rem; background: #111827; color: #fff; border: 1px solid #4B5563; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
                <button onclick="executeDeleteAccount()" style="flex: 1; padding: 0.75rem; background: #EF4444; color: #fff; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Delete Account</button>
            </div>
        </div>
    `;
    showModal('⚠️ Confirm Account Deletion', content);
}

function executeDeleteAccount() {
    const confirmText = document.getElementById('delete-confirm');
    if (confirmText && confirmText.value === 'DELETE') {
        closeModal();
        showNotification('Deleting account...', 'info');
        setTimeout(() => {
            showNotification('Account deletion request submitted. You will receive a confirmation email.', 'success');
        }, 2000);
    } else {
        showNotification('Please type DELETE to confirm', 'warning');
    }
}

// Ticket filtering
document.addEventListener('DOMContentLoaded', function() {
    const ticketFilters = document.querySelectorAll('.ticket-filter');
    ticketFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            ticketFilters.forEach(f => {
                f.classList.remove('active');
                f.style.background = 'transparent';
                f.style.color = '#9CA3AF';
                f.style.borderColor = '#4B5563';
            });
            
            // Add active class to clicked filter
            this.classList.add('active');
            this.style.background = 'rgba(64, 224, 208, 0.2)';
            this.style.color = '#40E0D0';
            this.style.borderColor = '#40E0D0';
            
            const filterType = this.getAttribute('data-filter');
            const tickets = document.querySelectorAll('.ticket-card');
            
            tickets.forEach(ticket => {
                const status = ticket.getAttribute('data-status');
                if (filterType === 'all' || status === filterType) {
                    ticket.style.display = 'block';
                } else {
                    ticket.style.display = 'none';
                }
            });
            
            showNotification(`Filtering: ${this.textContent}`, 'info');
        });
    });
    
    // Add hover effect to ticket cards
    const ticketCards = document.querySelectorAll('.ticket-card');
    ticketCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.borderColor = '#40E0D0';
            this.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.borderColor = '#374151';
            this.style.transform = 'translateY(0)';
        });
    });
});

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

// Investor Listing Modal
function showListingModal() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="text-align: center; margin-bottom: 1rem;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">💼</div>
                <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">List Your Project for Investment</h3>
                <p style="color: #9CA3AF;">Follow the steps below to create your investor listing</p>
            </div>

            <div class="listing-steps" style="display: flex; flex-direction: column; gap: 1rem;">
                <div class="listing-step" onclick="startVerification()" style="padding: 1.5rem; background: #111827; border: 2px solid #40E0D0; border-radius: 12px; cursor: pointer; transition: all 0.3s ease;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #111827; font-weight: 800; font-size: 1.2rem;">1</div>
                        <div style="flex: 1;">
                            <h4 style="color: #40E0D0; margin-bottom: 0.25rem;">Verification</h4>
                            <p style="font-size: 0.875rem; color: #9CA3AF;">100-point ID check and business verification</p>
                        </div>
                        <span style="color: #40E0D0;">→</span>
                    </div>
                </div>

                <div class="listing-step" style="padding: 1.5rem; background: #111827; border: 2px solid #4B5563; border-radius: 12px; cursor: not-allowed; opacity: 0.5;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: #4B5563; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-weight: 800; font-size: 1.2rem;">2</div>
                        <div style="flex: 1;">
                            <h4 style="color: #9CA3AF; margin-bottom: 0.25rem;">Investment Proposal</h4>
                            <p style="font-size: 0.875rem; color: #6B7280;">Create your white paper and pitch</p>
                        </div>
                        <span style="color: #4B5563;">🔒</span>
                    </div>
                </div>

                <div class="listing-step" style="padding: 1.5rem; background: #111827; border: 2px solid #4B5563; border-radius: 12px; cursor: not-allowed; opacity: 0.5;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: #4B5563; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-weight: 800; font-size: 1.2rem;">3</div>
                        <div style="flex: 1;">
                            <h4 style="color: #9CA3AF; margin-bottom: 0.25rem;">Upload Assets</h4>
                            <p style="font-size: 0.875rem; color: #6B7280;">Images, videos, pitch deck</p>
                        </div>
                        <span style="color: #4B5563;">🔒</span>
                    </div>
                </div>

                <div class="listing-step" style="padding: 1.5rem; background: #111827; border: 2px solid #4B5563; border-radius: 12px; cursor: not-allowed; opacity: 0.5;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <div style="width: 40px; height: 40px; background: #4B5563; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #9CA3AF; font-weight: 800; font-size: 1.2rem;">4</div>
                        <div style="flex: 1;">
                            <h4 style="color: #9CA3AF; margin-bottom: 0.25rem;">Review & Submit</h4>
                            <p style="font-size: 0.875rem; color: #6B7280;">Admin review before going live</p>
                        </div>
                        <span style="color: #4B5563;">🔒</span>
                    </div>
                </div>
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p>✓ All submissions are reviewed by Clippit Admin</p>
                <p>✓ Investor communication is handled securely</p>
                <p>✓ NDA protection for all parties</p>
            </div>
        </div>
    `;
    showModal('List for Investment', content);
}

function startVerification() {
    closeModal();
    setTimeout(() => showVerificationModal(), 300);
}

function showVerificationModal() {
    const content = `
        <form onsubmit="submitVerification(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem;">
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Step 1: Verification</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Complete your 100-point ID and business verification</p>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Full Legal Name</label>
                <input type="text" id="verify-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Business Name</label>
                <input type="text" id="verify-business" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Business Registration Number</label>
                <input type="text" id="verify-abn" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Proof of ID (Upload)</label>
                <div id="id-upload-area" style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('id-upload').click()">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                    <p style="font-size: 0.875rem;">Click to upload ID (Driver's License, Passport)</p>
                    <input type="file" id="id-upload" style="display: none;" accept=".pdf,.jpg,.png,.jpeg" onchange="handleFileUpload(this, 'id-upload-area', 'ID Document')">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Proof of Business Ownership</label>
                <div id="business-upload-area" style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('business-upload').click()">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                    <p style="font-size: 0.875rem;">Click to upload business registration</p>
                    <input type="file" id="business-upload" style="display: none;" accept=".pdf,.jpg,.png,.jpeg" onchange="handleFileUpload(this, 'business-upload-area', 'Business Document')">
                </div>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Continue to Investment Proposal</button>
        </form>
    `;
    showModal('Step 1: Verification', content);
}

function handleFileUpload(input, areaId, documentType) {
    const file = input.files[0];
    const uploadArea = document.getElementById(areaId);
    
    if (file && uploadArea) {
        // Keep the input element but hide it, and show the success message
        const inputElement = input;
        uploadArea.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #10B981;">✓</div>
            <p style="font-size: 0.875rem; color: #10B981; font-weight: 600;">${file.name}</p>
            <p style="font-size: 0.75rem; color: #9CA3AF; margin-top: 0.5rem;">${(file.size / 1024).toFixed(2)} KB</p>
            <button type="button" onclick="removeFile('${input.id}', '${areaId}', '${documentType}')" style="margin-top: 0.75rem; padding: 0.5rem 1rem; background: transparent; color: #EF4444; border: 1px solid #EF4444; border-radius: 6px; font-size: 0.875rem; cursor: pointer;">Remove File</button>
        `;
        
        // Re-append the input element (hidden) so the form can still access it
        inputElement.style.display = 'none';
        uploadArea.appendChild(inputElement);
        
        uploadArea.style.borderColor = '#10B981';
        uploadArea.style.background = 'rgba(16, 185, 129, 0.1)';
        uploadArea.style.cursor = 'default';
        uploadArea.onclick = null; // Remove the click handler
        
        showNotification(`${documentType} uploaded: ${file.name}`, 'success');
    }
}

function removeFile(inputId, areaId, documentType) {
    const input = document.getElementById(inputId);
    const uploadArea = document.getElementById(areaId);
    
    if (input) input.value = '';
    
    if (uploadArea) {
        const isIdUpload = areaId === 'id-upload-area';
        uploadArea.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
            <p style="font-size: 0.875rem;">${isIdUpload ? 'Click to upload ID (Driver\'s License, Passport)' : 'Click to upload business registration'}</p>
            <input type="file" id="${inputId}" style="display: none;" accept=".pdf,.jpg,.png,.jpeg" onchange="handleFileUpload(this, '${areaId}', '${documentType}')">
        `;
        uploadArea.style.borderColor = '#4B5563';
        uploadArea.style.background = 'transparent';
        uploadArea.style.cursor = 'pointer';
        uploadArea.onclick = () => document.getElementById(inputId).click();
        
        showNotification(`${documentType} removed`, 'info');
    }
}

function submitVerification(e) {
    e.preventDefault();
    
    // Check if both files are uploaded
    const idUpload = document.getElementById('id-upload');
    const businessUpload = document.getElementById('business-upload');
    
    if (!idUpload.files.length) {
        showNotification('Please upload your ID document', 'warning');
        return;
    }
    
    if (!businessUpload.files.length) {
        showNotification('Please upload your business registration document', 'warning');
        return;
    }
    
    closeModal();
    showNotification('Verification documents submitted!', 'success');
    setTimeout(() => showProposalModal(), 500);
}

function showProposalModal() {
    // Get any saved data from sessionStorage
    const storedData = sessionStorage.getItem('currentListingData');
    const savedData = storedData ? JSON.parse(storedData) : {};
    
    const content = `
        <form onsubmit="submitProposal(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem;">
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Step 2: Investment Proposal</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Create your white paper and investment pitch</p>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Name</label>
                <input type="text" id="project-name" value="${savedData.projectName || ''}" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Category</label>
                <select id="project-category" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select category</option>
                    <option value="app" ${savedData.category === 'app' ? 'selected' : ''}>Mobile App</option>
                    <option value="website" ${savedData.category === 'website' ? 'selected' : ''}>Website</option>
                    <option value="software" ${savedData.category === 'software' ? 'selected' : ''}>Software</option>
                    <option value="company" ${savedData.category === 'company' ? 'selected' : ''}>Company/Business</option>
                </select>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Investment Type</label>
                <select id="investment-type" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select type</option>
                    <option value="equity" ${savedData.investmentType === 'equity' ? 'selected' : ''}>Equity Funding</option>
                    <option value="buyout" ${savedData.investmentType === 'buyout' ? 'selected' : ''}>Full Buyout</option>
                    <option value="partnership" ${savedData.investmentType === 'partnership' ? 'selected' : ''}>Partnership</option>
                    <option value="acquisition" ${savedData.investmentType === 'acquisition' ? 'selected' : ''}>Acquisition</option>
                </select>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Seeking Amount (AUD)</label>
                <input type="number" id="seeking-amount" value="${savedData.seekingAmount || ''}" required min="1000" step="1000" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Current Valuation (if applicable)</label>
                <input type="number" id="valuation" value="${savedData.valuation || ''}" min="0" step="1000" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Overview</label>
                <textarea id="project-overview" rows="4" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Describe your project, what problem it solves, and the market opportunity...">${savedData.overview || ''}</textarea>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Use of Funds</label>
                <textarea id="use-of-funds" rows="3" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="How will the investment be used?">${savedData.useOfFunds || ''}</textarea>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Continue to Upload Assets</button>
        </form>
    `;
    showModal('Step 2: Investment Proposal', content);
}

function submitProposal(e) {
    e.preventDefault();
    
    // Store the proposal data in sessionStorage so it can be accessed later
    const proposalData = {
        projectName: document.getElementById('project-name').value,
        category: document.getElementById('project-category').value,
        investmentType: document.getElementById('investment-type').value,
        seekingAmount: document.getElementById('seeking-amount').value,
        valuation: document.getElementById('valuation').value || null,
        overview: document.getElementById('project-overview').value,
        useOfFunds: document.getElementById('use-of-funds').value
    };
    
    sessionStorage.setItem('currentListingData', JSON.stringify(proposalData));
    
    closeModal();
    showNotification(`Proposal for "${proposalData.projectName}" saved!`, 'success');
    setTimeout(() => showAssetsModal(), 500);
}

function showAssetsModal() {
    const content = `
        <form onsubmit="submitAssets(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem;">
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Step 3: Upload Assets</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Add images, videos, and documents to showcase your project</p>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Images</label>
                <div id="image-upload-area" style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('image-upload').click()">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🖼️</div>
                    <p>Click to upload images</p>
                    <input type="file" id="image-upload" multiple accept="image/*" style="display: none;" onchange="handleAssetUpload(this, 'image-upload-area', 'Project Images')">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Pitch Deck (PDF)</label>
                <div id="pitch-upload-area" style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('pitch-upload').click()">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
                    <p>Click to upload pitch deck</p>
                    <input type="file" id="pitch-upload" accept=".pdf,.ppt,.pptx" style="display: none;" onchange="handleAssetUpload(this, 'pitch-upload-area', 'Pitch Deck')">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Demo Video (Optional)</label>
                <div id="video-upload-area" style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('video-upload').click()">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎬</div>
                    <p>Click to upload demo video</p>
                    <input type="file" id="video-upload" accept="video/*" style="display: none;" onchange="handleAssetUpload(this, 'video-upload-area', 'Demo Video')">
                </div>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Continue to Review</button>
        </form>
    `;
    showModal('Step 3: Upload Assets', content);
}

function handleAssetUpload(input, areaId, assetType) {
    const uploadArea = document.getElementById(areaId);
    
    if (input.files.length > 0 && uploadArea) {
        const inputElement = input;
        const fileCount = input.files.length;
        const fileNames = Array.from(input.files).map(f => f.name).join(', ');
        const totalSize = Array.from(input.files).reduce((sum, f) => sum + f.size, 0);
        
        // Store file information for preview
        const fileInfo = {
            count: fileCount,
            names: Array.from(input.files).map(f => f.name),
            type: assetType
        };
        sessionStorage.setItem(`upload_${input.id}`, JSON.stringify(fileInfo));
        
        uploadArea.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 0.5rem; color: #10B981;">✓</div>
            <p style="font-size: 0.875rem; color: #10B981; font-weight: 600;">${fileCount} file${fileCount > 1 ? 's' : ''} selected</p>
            <p style="font-size: 0.75rem; color: #9CA3AF; margin-top: 0.5rem;">${(totalSize / 1024).toFixed(2)} KB</p>
            <p style="font-size: 0.75rem; color: #9CA3AF; margin-top: 0.25rem; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${fileNames}</p>
            <button type="button" onclick="removeAsset('${input.id}', '${areaId}', '${assetType}')" style="margin-top: 0.75rem; padding: 0.5rem 1rem; background: transparent; color: #EF4444; border: 1px solid #EF4444; border-radius: 6px; font-size: 0.875rem; cursor: pointer;">Remove</button>
        `;
        
        // Re-append the input element (hidden)
        inputElement.style.display = 'none';
        uploadArea.appendChild(inputElement);
        
        uploadArea.style.borderColor = '#10B981';
        uploadArea.style.background = 'rgba(16, 185, 129, 0.1)';
        uploadArea.style.cursor = 'default';
        uploadArea.onclick = null;
        
        showNotification(`${assetType} uploaded successfully`, 'success');
    }
}

function removeAsset(inputId, areaId, assetType) {
    const input = document.getElementById(inputId);
    const uploadArea = document.getElementById(areaId);
    
    if (input) input.value = '';
    
    if (uploadArea) {
        let icon = '🖼️';
        let text = 'Click to upload images';
        let accept = 'image/*';
        let multiple = '';
        
        if (areaId === 'pitch-upload-area') {
            icon = '📊';
            text = 'Click to upload pitch deck';
            accept = '.pdf,.ppt,.pptx';
        } else if (areaId === 'video-upload-area') {
            icon = '🎬';
            text = 'Click to upload demo video';
            accept = 'video/*';
        } else if (areaId === 'image-upload-area') {
            multiple = 'multiple';
        }
        
        uploadArea.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 0.5rem;">${icon}</div>
            <p>${text}</p>
            <input type="file" id="${inputId}" ${multiple} accept="${accept}" style="display: none;" onchange="handleAssetUpload(this, '${areaId}', '${assetType}')">
        `;
        uploadArea.style.borderColor = '#4B5563';
        uploadArea.style.background = 'transparent';
        uploadArea.style.cursor = 'pointer';
        uploadArea.onclick = () => document.getElementById(inputId).click();
        
        showNotification(`${assetType} removed`, 'info');
    }
}

function submitAssets(e) {
    e.preventDefault();
    closeModal();
    showNotification('Assets uploaded successfully!', 'success');
    setTimeout(() => showReviewModal(), 500);
}

function showReviewModal() {
    // Retrieve the stored listing data from sessionStorage
    const storedData = sessionStorage.getItem('currentListingData');
    const listingData = storedData ? JSON.parse(storedData) : {};
    
    // Use the stored data
    const projectName = listingData.projectName || 'Your Project Name';
    const category = listingData.category || 'category';
    const investmentType = listingData.investmentType || 'equity';
    const seekingAmount = listingData.seekingAmount || '0';
    const valuation = listingData.valuation || 'Not specified';
    const overview = listingData.overview || 'Project overview...';
    const useOfFunds = listingData.useOfFunds || 'Use of funds...';
    
    // Get file info
    const imageUpload = document.getElementById('image-upload');
    const pitchUpload = document.getElementById('pitch-upload');
    const videoUpload = document.getElementById('video-upload');
    
    const imageCount = imageUpload?.files.length || 0;
    const hasPitch = pitchUpload?.files.length > 0;
    const hasVideo = videoUpload?.files.length > 0;
    
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem; max-height: 70vh; overflow-y: auto;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem; text-align: center; position: sticky; top: 0; z-index: 10;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">👁️</div>
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Preview Your Listing</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">This is how investors will see your listing</p>
            </div>

            <!-- Investor View Preview -->
            <div style="background: #111827; padding: 2rem; border-radius: 12px; border: 2px solid #40E0D0;">
                <!-- Header -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                    <div style="flex: 1;">
                        <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem;">
                            <div style="font-size: 3rem;">💼</div>
                            <div>
                                <h2 style="color: #40E0D0; font-size: 1.75rem; margin-bottom: 0.5rem;">${projectName}</h2>
                                <p style="color: #9CA3AF; text-transform: capitalize;">${category.replace('-', ' ')}</p>
                            </div>
                        </div>
                    </div>
                    <div style="background: rgba(64, 224, 208, 0.2); color: #40E0D0; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600;">
                        ${investmentType.replace('-', ' ').toUpperCase()}
                    </div>
                </div>

                <!-- Investment Details -->
                <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem;">
                        <div>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Seeking Amount</p>
                            <p style="color: #40E0D0; font-size: 1.5rem; font-weight: 800;">$${parseFloat(seekingAmount).toLocaleString()} AUD</p>
                        </div>
                        <div>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Current Valuation</p>
                            <p style="color: #fff; font-size: 1.25rem; font-weight: 700;">${valuation !== 'Not specified' ? '$' + parseFloat(valuation).toLocaleString() + ' AUD' : valuation}</p>
                        </div>
                        <div>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Investment Type</p>
                            <p style="color: #fff; font-size: 1.25rem; font-weight: 700; text-transform: capitalize;">${investmentType.replace('-', ' ')}</p>
                        </div>
                    </div>
                </div>

                <!-- Project Overview -->
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #40E0D0; font-size: 1.25rem; margin-bottom: 1rem;">📋 Project Overview</h3>
                    <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px;">
                        <p style="color: #9CA3AF; line-height: 1.6; white-space: pre-wrap;">${overview}</p>
                    </div>
                </div>

                <!-- Use of Funds -->
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #40E0D0; font-size: 1.25rem; margin-bottom: 1rem;">💰 Use of Funds</h3>
                    <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px;">
                        <p style="color: #9CA3AF; line-height: 1.6; white-space: pre-wrap;">${useOfFunds}</p>
                    </div>
                </div>

                <!-- Assets -->
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: #40E0D0; font-size: 1.25rem; margin-bottom: 1rem;">📎 Assets & Materials</h3>
                    <div style="background: #1F2937; padding: 1.5rem; border-radius: 8px;">
                        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                            <div onclick="${imageCount > 0 ? 'previewImages()' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: 8px; ${imageCount > 0 ? 'background: rgba(64, 224, 208, 0.1); cursor: pointer; border: 1px solid rgba(64, 224, 208, 0.3);' : ''} transition: all 0.2s;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <span style="font-size: 1.5rem;">🖼️</span>
                                    <p style="color: ${imageCount > 0 ? '#10B981' : '#6B7280'};">
                                        ${imageCount > 0 ? `${imageCount} project image${imageCount > 1 ? 's' : ''} attached` : 'No images uploaded'}
                                    </p>
                                </div>
                                ${imageCount > 0 ? '<span style="color: #40E0D0; font-size: 1.25rem;">👁️</span>' : ''}
                            </div>
                            <div onclick="${hasPitch ? 'previewPitchDeck()' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: 8px; ${hasPitch ? 'background: rgba(64, 224, 208, 0.1); cursor: pointer; border: 1px solid rgba(64, 224, 208, 0.3);' : ''} transition: all 0.2s;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <span style="font-size: 1.5rem;">📊</span>
                                    <p style="color: ${hasPitch ? '#10B981' : '#6B7280'};">
                                        ${hasPitch ? 'Pitch deck attached' : 'No pitch deck uploaded'}
                                    </p>
                                </div>
                                ${hasPitch ? '<span style="color: #40E0D0; font-size: 1.25rem;">👁️</span>' : ''}
                            </div>
                            <div onclick="${hasVideo ? 'previewVideo()' : ''}" style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem; border-radius: 8px; ${hasVideo ? 'background: rgba(64, 224, 208, 0.1); cursor: pointer; border: 1px solid rgba(64, 224, 208, 0.3);' : ''} transition: all 0.2s;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <span style="font-size: 1.5rem;">🎬</span>
                                    <p style="color: ${hasVideo ? '#10B981' : '#6B7280'};">
                                        ${hasVideo ? 'Demo video attached' : 'No demo video uploaded'}
                                    </p>
                                </div>
                                ${hasVideo ? '<span style="color: #40E0D0; font-size: 1.25rem;">👁️</span>' : ''}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Investor Actions Preview -->
                <div style="padding: 1.5rem; background: #1F2937; border-radius: 8px; border: 1px dashed #4B5563;">
                    <p style="color: #9CA3AF; font-size: 0.875rem; text-align: center; margin-bottom: 1rem;">Investors will see these action buttons:</p>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 150px; padding: 0.75rem; background: rgba(64, 224, 208, 0.2); color: #40E0D0; border-radius: 8px; text-align: center; font-weight: 600;">💬 Ask Question</div>
                        <div style="flex: 1; min-width: 150px; padding: 0.75rem; background: rgba(64, 224, 208, 0.2); color: #40E0D0; border-radius: 8px; text-align: center; font-weight: 600;">💰 Make Offer</div>
                        <div style="flex: 1; min-width: 150px; padding: 0.75rem; background: rgba(64, 224, 208, 0.2); color: #40E0D0; border-radius: 8px; text-align: center; font-weight: 600;">📥 Request Details</div>
                    </div>
                </div>
            </div>

            <!-- What Happens Next -->
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #4B5563;">
                <h4 style="color: #fff; margin-bottom: 1rem;">✅ What Happens Next?</h4>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <div style="display: flex; gap: 1rem;">
                        <span style="color: #40E0D0;">1.</span>
                        <p style="font-size: 0.875rem; color: #9CA3AF;">Clippit Admin reviews your submission (24-48 hours)</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <span style="color: #40E0D0;">2.</span>
                        <p style="font-size: 0.875rem; color: #9CA3AF;">Once approved, your listing goes live in the Investor Lounge</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <span style="color: #40E0D0;">3.</span>
                        <p style="font-size: 0.875rem; color: #9CA3AF;">Investors can view, ask questions, or make offers</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <span style="color: #40E0D0;">4.</span>
                        <p style="font-size: 0.875rem; color: #9CA3AF;">All communication is handled securely through Clippit Admin</p>
                    </div>
                </div>
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem; border: 1px solid rgba(64, 224, 208, 0.3);">
                <p style="margin-bottom: 0.5rem;">✓ NDA protection for all parties</p>
                <p style="margin-bottom: 0.5rem;">✓ Track views, questions, and offers in real-time</p>
                <p>✓ Full analytics dashboard access</p>
            </div>

            <div style="display: flex; gap: 1rem; position: sticky; bottom: 0; background: #1F2937; padding: 1rem 0;">
                <button onclick="editListing()" style="flex: 1; background: transparent; color: #40E0D0; border: 2px solid #40E0D0; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer;">← Go Back & Edit</button>
                <button onclick="submitListing()" style="flex: 1; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Submit for Review →</button>
            </div>
        </div>
    `;
    showModal('Review & Submit', content);
}

function editListing() {
    closeModal();
    showNotification('Returning to edit your listing...', 'info');
    setTimeout(() => {
        showProposalModal();
    }, 500);
}

function submitListing() {
    // Get the listing data that was entered
    const listingData = {
        projectName: document.getElementById('project-name')?.value || 'Untitled Project',
        category: document.getElementById('project-category')?.value || 'app',
        investmentType: document.getElementById('investment-type')?.value || 'equity',
        seekingAmount: document.getElementById('seeking-amount')?.value || '0',
        valuation: document.getElementById('valuation')?.value || null,
        overview: document.getElementById('project-overview')?.value || '',
        useOfFunds: document.getElementById('use-of-funds')?.value || '',
        submittedDate: new Date().toISOString(),
        status: 'pending', // pending, active, paused
        views: 0,
        inquiries: 0,
        offers: 0
    };
    
    // Store in localStorage (in a real app, this would be sent to a server)
    let listings = JSON.parse(localStorage.getItem('investorListings') || '[]');
    listings.push(listingData);
    localStorage.setItem('investorListings', JSON.stringify(listings));
    
    closeModal();
    showNotification('Listing submitted for admin review!', 'success');
    setTimeout(() => {
        showNotification('You\'ll receive an email once approved (24-48 hours)', 'info');
        // Refresh the listings display
        displayUserListings();
    }, 2000);
}

function displayUserListings() {
    const listings = JSON.parse(localStorage.getItem('investorListings') || '[]');
    const listingsContainer = document.getElementById('active-listings-section');
    
    if (!listingsContainer) return;
    
    if (listings.length === 0) {
        listingsContainer.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📋</div>
                <h4 style="color: #fff; margin-bottom: 0.5rem;">No Active Listings</h4>
                <p style="color: #9CA3AF; margin-bottom: 1.5rem;">Create your first listing to attract investors</p>
                <button onclick="showListingModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Create Your First Listing</button>
            </div>
        `;
    } else {
        let listingsHTML = '';
        listings.forEach((listing, index) => {
            const statusColor = listing.status === 'active' ? '#10B981' : listing.status === 'paused' ? '#FBB624' : '#A855F7';
            const statusText = listing.status === 'active' ? 'ACTIVE' : listing.status === 'paused' ? 'PAUSED' : 'PENDING REVIEW';
            const daysAgo = Math.floor((new Date() - new Date(listing.submittedDate)) / (1000 * 60 * 60 * 24));
            
            listingsHTML += `
                <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div style="flex: 1;">
                            <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem;">
                                <h4 style="color: #40E0D0; font-size: 1.25rem;">${listing.projectName}</h4>
                                <span style="background: rgba(${statusColor === '#10B981' ? '16, 185, 129' : statusColor === '#FBB624' ? '251, 191, 36' : '168, 85, 247'}, 0.2); color: ${statusColor}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">${statusText}</span>
                            </div>
                            <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 1rem;">Seeking: $${parseFloat(listing.seekingAmount).toLocaleString()} AUD • ${listing.investmentType.replace('-', ' ').charAt(0).toUpperCase() + listing.investmentType.replace('-', ' ').slice(1)}</p>
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1.5rem;">
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Views</p>
                                    <p style="color: #fff; font-weight: 600; font-size: 1.25rem;">${listing.views}</p>
                                </div>
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Inquiries</p>
                                    <p style="color: #fff; font-weight: 600; font-size: 1.25rem;">${listing.inquiries}</p>
                                </div>
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Offers</p>
                                    <p style="color: #fff; font-weight: 600; font-size: 1.25rem;">${listing.offers}</p>
                                </div>
                                <div>
                                    <p style="color: #6B7280; font-size: 0.75rem;">Listed</p>
                                    <p style="color: #fff; font-weight: 600;">${daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : daysAgo + ' days ago'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 0.75rem; padding-top: 1rem; border-top: 1px solid #4B5563; flex-wrap: wrap;">
                        ${listing.status === 'active' ? `<button onclick="viewListingAnalytics(${index})" style="flex: 1; min-width: 150px; padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">View Analytics</button>` : ''}
                        ${listing.status === 'active' && listing.inquiries > 0 ? `<button onclick="viewListingOffers(${index})" style="padding: 0.5rem 1rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer;">View Inquiries (${listing.inquiries})</button>` : ''}
                        <button onclick="editUserListing(${index})" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; font-weight: 600;">✏️ Edit</button>
                        <button onclick="pauseListing(${index})" style="padding: 0.5rem 1rem; background: #111827; color: ${listing.status === 'paused' ? '#10B981' : '#FBB624'}; border: 1px solid #4B5563; border-radius: 8px; cursor: pointer; font-weight: 600;">${listing.status === 'paused' ? '▶️ Activate' : '⏸️ Pause'}</button>
                    </div>
                </div>
            `;
        });
        
        listingsContainer.innerHTML = listingsHTML;
    }
}

function editUserListing(index) {
    const listings = JSON.parse(localStorage.getItem('investorListings') || '[]');
    const listing = listings[index];
    
    if (!listing) {
        showNotification('Listing not found', 'error');
        return;
    }
    
    // Store the index being edited
    sessionStorage.setItem('editingListingIndex', index);
    
    // Show the proposal modal with pre-filled data
    showProposalModal();
    
    // Pre-fill the form fields after a short delay to ensure modal is rendered
    setTimeout(() => {
        if (document.getElementById('project-name')) document.getElementById('project-name').value = listing.projectName;
        if (document.getElementById('project-category')) document.getElementById('project-category').value = listing.category;
        if (document.getElementById('investment-type')) document.getElementById('investment-type').value = listing.investmentType;
        if (document.getElementById('seeking-amount')) document.getElementById('seeking-amount').value = listing.seekingAmount;
        if (document.getElementById('valuation') && listing.valuation) document.getElementById('valuation').value = listing.valuation;
        if (document.getElementById('project-overview')) document.getElementById('project-overview').value = listing.overview;
        if (document.getElementById('use-of-funds')) document.getElementById('use-of-funds').value = listing.useOfFunds;
    }, 100);
}

function pauseListing(index) {
    const listings = JSON.parse(localStorage.getItem('investorListings') || '[]');
    if (listings[index]) {
        listings[index].status = listings[index].status === 'paused' ? 'active' : 'paused';
        localStorage.setItem('investorListings', JSON.stringify(listings));
        showNotification(`Listing ${listings[index].status === 'paused' ? 'paused' : 'activated'} successfully`, 'success');
        displayUserListings();
    }
}

function viewListingAnalytics(index) {
    showNotification('Analytics feature coming soon - track views, clicks, and engagement', 'info');
}

function viewListingOffers(index) {
    showNotification('Inquiries & offers feature coming soon - all communication handled by Clippit Admin', 'info');
}

// Initialize listings display when the investor opportunities section is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Display user listings if we're on the investor opportunities page
    setTimeout(() => {
        displayUserListings();
    }, 500);
});

// Preview uploaded files
function previewImages() {
    const imageUpload = document.getElementById('image-upload');
    if (!imageUpload || !imageUpload.files.length) {
        showNotification('No images to preview', 'info');
        return;
    }
    
    let imagesHTML = '';
    Array.from(imageUpload.files).forEach((file, index) => {
        const url = URL.createObjectURL(file);
        imagesHTML += `
            <div style="margin-bottom: 1rem;">
                <p style="color: #fff; margin-bottom: 0.5rem; font-weight: 600;">${file.name}</p>
                <img src="${url}" style="width: 100%; border-radius: 8px; border: 1px solid #4B5563;" />
            </div>
        `;
    });
    
    const content = `
        <div style="max-height: 60vh; overflow-y: auto;">
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🖼️</div>
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Project Images</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">${imageUpload.files.length} image${imageUpload.files.length > 1 ? 's' : ''} uploaded</p>
            </div>
            ${imagesHTML}
            <button onclick="closeModal()" style="width: 100%; padding: 0.75rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 1rem;">Close Preview</button>
        </div>
    `;
    showModal('Image Preview', content);
}

function previewPitchDeck() {
    const pitchUpload = document.getElementById('pitch-upload');
    if (!pitchUpload || !pitchUpload.files.length) {
        showNotification('No pitch deck to preview', 'info');
        return;
    }
    
    const file = pitchUpload.files[0];
    const content = `
        <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">📊</div>
            <h3 style="color: #40E0D0; margin-bottom: 1rem;">Pitch Deck</h3>
            <div style="background: #111827; padding: 2rem; border-radius: 8px; border: 1px solid #4B5563; margin-bottom: 1.5rem;">
                <p style="color: #fff; font-weight: 600; margin-bottom: 0.5rem;">${file.name}</p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p style="color: #9CA3AF; font-size: 0.875rem; margin-top: 0.5rem;">Type: ${file.type || 'Unknown'}</p>
            </div>
            <p style="color: #9CA3AF; margin-bottom: 1.5rem;">✓ File uploaded and ready for submission</p>
            <button onclick="closeModal()" style="width: 100%; padding: 0.75rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
        </div>
    `;
    showModal('Pitch Deck Preview', content);
}

function previewVideo() {
    const videoUpload = document.getElementById('video-upload');
    if (!videoUpload || !videoUpload.files.length) {
        showNotification('No video to preview', 'info');
        return;
    }
    
    const file = videoUpload.files[0];
    const url = URL.createObjectURL(file);
    
    const content = `
        <div>
            <div style="text-align: center; margin-bottom: 1.5rem;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎬</div>
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Demo Video</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">${file.name}</p>
            </div>
            <video controls style="width: 100%; border-radius: 8px; border: 1px solid #4B5563; margin-bottom: 1rem;">
                <source src="${url}" type="${file.type}">
                Your browser does not support the video tag.
            </video>
            <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #4B5563; margin-bottom: 1rem;">
                <p style="color: #9CA3AF; font-size: 0.875rem;">Size: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <p style="color: #9CA3AF; font-size: 0.875rem;">Type: ${file.type}</p>
            </div>
            <button onclick="closeModal()" style="width: 100%; padding: 0.75rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; font-weight: 600; cursor: pointer;">Close Preview</button>
        </div>
    `;
    showModal('Video Preview', content);
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
    .listing-step:hover {
        transform: translateX(5px);
        border-color: #40E0D0 !important;
    }
`;
document.head.appendChild(style);
