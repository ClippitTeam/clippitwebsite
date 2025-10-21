// Dashboard Interactive Features

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
            e.preventDefault();
            // Remove active class from all nav items
            navLinks.forEach(item => item.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            const section = this.querySelector('.nav-label').textContent;
            
            // Handle Investor Opportunities section specially
            if (section === 'Investor Opportunities') {
                const investorSection = document.querySelector('.dashboard-card.span-2:last-child');
                if (investorSection) {
                    investorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    showNotification('Showing Investor Opportunities section', 'info');
                } else {
                    showNotification(`Navigating to ${section}...`, 'info');
                }
            } else {
                showNotification(`Navigating to ${section}...`, 'info');
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
