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
                <div style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('id-upload').click()">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                    <p style="font-size: 0.875rem;">Click to upload ID (Driver's License, Passport)</p>
                    <input type="file" id="id-upload" style="display: none;" accept=".pdf,.jpg,.png">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Proof of Business Ownership</label>
                <div style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('business-upload').click()">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                    <p style="font-size: 0.875rem;">Click to upload business registration</p>
                    <input type="file" id="business-upload" style="display: none;" accept=".pdf,.jpg,.png">
                </div>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Continue to Investment Proposal</button>
        </form>
    `;
    showModal('Step 1: Verification', content);
}

function submitVerification(e) {
    e.preventDefault();
    closeModal();
    showNotification('Verification documents submitted!', 'success');
    setTimeout(() => showProposalModal(), 500);
}

function showProposalModal() {
    const content = `
        <form onsubmit="submitProposal(event)" style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem;">
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Step 2: Investment Proposal</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Create your white paper and investment pitch</p>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Name</label>
                <input type="text" id="project-name" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Category</label>
                <select id="project-category" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select category</option>
                    <option value="app">Mobile App</option>
                    <option value="website">Website</option>
                    <option value="software">Software</option>
                    <option value="company">Company/Business</option>
                </select>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Investment Type</label>
                <select id="investment-type" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    <option value="">Select type</option>
                    <option value="equity">Equity Funding</option>
                    <option value="buyout">Full Buyout</option>
                    <option value="partnership">Partnership</option>
                    <option value="acquisition">Acquisition</option>
                </select>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Seeking Amount (AUD)</label>
                <input type="number" id="seeking-amount" required min="1000" step="1000" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Current Valuation (if applicable)</label>
                <input type="number" id="valuation" min="0" step="1000" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Overview</label>
                <textarea id="project-overview" rows="4" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="Describe your project, what problem it solves, and the market opportunity..."></textarea>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Use of Funds</label>
                <textarea id="use-of-funds" rows="3" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;" placeholder="How will the investment be used?"></textarea>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Continue to Upload Assets</button>
        </form>
    `;
    showModal('Step 2: Investment Proposal', content);
}

function submitProposal(e) {
    e.preventDefault();
    const projectName = document.getElementById('project-name').value;
    closeModal();
    showNotification(`Proposal for "${projectName}" saved!`, 'success');
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
                <div style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('image-upload').click()">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🖼️</div>
                    <p>Click to upload images</p>
                    <input type="file" id="image-upload" multiple accept="image/*" style="display: none;">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Pitch Deck (PDF)</label>
                <div style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('pitch-upload').click()">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
                    <p>Click to upload pitch deck</p>
                    <input type="file" id="pitch-upload" accept=".pdf,.ppt,.pptx" style="display: none;">
                </div>
            </div>

            <div>
                <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Demo Video (Optional)</label>
                <div style="border: 2px dashed #4B5563; border-radius: 8px; padding: 2rem; text-align: center; cursor: pointer;" onclick="document.getElementById('video-upload').click()">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🎬</div>
                    <p>Click to upload demo video</p>
                    <input type="file" id="video-upload" accept="video/*" style="display: none;">
                </div>
            </div>

            <button type="submit" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Continue to Review</button>
        </form>
    `;
    showModal('Step 3: Upload Assets', content);
}

function submitAssets(e) {
    e.preventDefault();
    closeModal();
    showNotification('Assets uploaded successfully!', 'success');
    setTimeout(() => showReviewModal(), 500);
}

function showReviewModal() {
    const content = `
        <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #40E0D0; margin-bottom: 1rem; text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">✅</div>
                <h3 style="color: #40E0D0; margin-bottom: 0.5rem;">Step 4: Review & Submit</h3>
                <p style="font-size: 0.875rem; color: #9CA3AF;">Your listing is ready for admin review</p>
            </div>

            <div style="background: #111827; padding: 1.5rem; border-radius: 8px;">
                <h4 style="color: #fff; margin-bottom: 1rem;">What Happens Next?</h4>
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
                        <p style="font-size: 0.875rem; color: #9CA3AF;">All communication is handled through Clippit Admin</p>
                    </div>
                </div>
            </div>

            <div style="background: rgba(64, 224, 208, 0.1); padding: 1rem; border-radius: 8px; font-size: 0.875rem;">
                <p>✓ NDA protection for all parties</p>
                <p>✓ Track views, questions, and offers in real-time</p>
                <p>✓ Full analytics dashboard access</p>
            </div>

            <button onclick="submitListing()" style="background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; padding: 0.75rem 1.5rem; border: none; border-radius: 50px; font-weight: 600; cursor: pointer; width: 100%;">Submit for Review</button>
        </div>
    `;
    showModal('Review & Submit', content);
}

function submitListing() {
    closeModal();
    showNotification('Listing submitted for admin review!', 'success');
    setTimeout(() => {
        showNotification('You\'ll receive an email once approved (24-48 hours)', 'info');
    }, 2000);
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
