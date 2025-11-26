// Notification System for Admin Dashboard
// Handles real-time notifications, preferences, and user interactions

let notificationSubscription = null;
let unreadCount = 0;
let allNotifications = [];
let notificationSound = null;

// Initialize notification system
document.addEventListener('DOMContentLoaded', function() {
    if (typeof supabase !== 'undefined' && sessionStorage.getItem('isLoggedIn')) {
        initializeNotifications();
    }
});

async function initializeNotifications() {
    try {
        // Load notification sound
        notificationSound = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVqzn77BfGAk+ltryxnMpBSuBzvLZiTYIG2m9NQ==');
        
        // Load notifications
        await loadNotifications();
        
        // Setup real-time subscription
        setupRealtimeSubscription();
        
        // Update unread count periodically
        setInterval(updateUnreadCount, 30000); // Every 30 seconds
        
        // Setup notification icon click handler
        const notificationIcon = document.querySelector('.notification-icon');
        if (notificationIcon) {
            notificationIcon.addEventListener('click', toggleNotificationPanel);
        }
    } catch (error) {
        console.error('Failed to initialize notifications:', error);
    }
}

async function loadNotifications() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;

        allNotifications = data || [];
        updateNotificationUI();
    } catch (error) {
        console.error('Failed to load notifications:', error);
    }
}

function setupRealtimeSubscription() {
    const channel = supabase
        .channel('notifications')
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            },
            async (payload) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (payload.new.user_id === user?.id) {
                    allNotifications.unshift(payload.new);
                    updateNotificationUI();
                    showToastNotification(payload.new);
                    playNotificationSound();
                }
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'UPDATE',
                schema: 'public',
                table: 'notifications'
            },
            async (payload) => {
                const { data: { user } } = await supabase.auth.getUser();
                if (payload.new.user_id === user?.id) {
                    const index = allNotifications.findIndex(n => n.id === payload.new.id);
                    if (index !== -1) {
                        allNotifications[index] = payload.new;
                        updateNotificationUI();
                    }
                }
            }
        )
        .subscribe();

    notificationSubscription = channel;
}

function updateNotificationUI() {
    unreadCount = allNotifications.filter(n => !n.is_read).length;
    
    // Update badge
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    // Update panel if open
    const panel = document.getElementById('notification-panel');
    if (panel && panel.style.display === 'block') {
        renderNotificationPanel();
    }
}

async function updateUnreadCount() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase.rpc('get_unread_count');
        if (error) throw error;

        unreadCount = data || 0;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
    } catch (error) {
        console.error('Failed to update unread count:', error);
    }
}

function toggleNotificationPanel(event) {
    event.stopPropagation();
    
    let panel = document.getElementById('notification-panel');
    
    if (!panel) {
        panel = createNotificationPanel();
        document.body.appendChild(panel);
    }
    
    if (panel.style.display === 'block') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'block';
        renderNotificationPanel();
        
        // Position panel
        const icon = document.querySelector('.notification-icon');
        const rect = icon.getBoundingClientRect();
        panel.style.top = `${rect.bottom + 10}px`;
        panel.style.right = `${window.innerWidth - rect.right}px`;
    }
}

function createNotificationPanel() {
    const panel = document.createElement('div');
    panel.id = 'notification-panel';
    panel.style.cssText = `
        position: fixed;
        width: 400px;
        max-height: 600px;
        background: #1F2937;
        border: 1px solid #4B5563;
        border-radius: 12px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        display: none;
        overflow: hidden;
    `;
    
    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
        if (!panel.contains(e.target) && !e.target.closest('.notification-icon')) {
            panel.style.display = 'none';
        }
    });
    
    return panel;
}

function renderNotificationPanel() {
    const panel = document.getElementById('notification-panel');
    if (!panel) return;

    const unreadNotifications = allNotifications.filter(n => !n.is_read);
    const readNotifications = allNotifications.filter(n => n.is_read).slice(0, 20);

    panel.innerHTML = `
        <div style="padding: 1rem; border-bottom: 1px solid #4B5563; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="color: #fff; font-size: 1.125rem; font-weight: 600; margin: 0;">Notifications</h3>
            <div style="display: flex; gap: 0.5rem;">
                ${unreadCount > 0 ? `<button onclick="markAllAsRead()" style="padding: 0.25rem 0.75rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">Mark all read</button>` : ''}
                <button onclick="showNotificationSettings()" style="padding: 0.25rem 0.5rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 6px; cursor: pointer;">⚙️</button>
            </div>
        </div>
        
        <div style="max-height: 520px; overflow-y: auto;">
            ${unreadNotifications.length > 0 ? `
                <div style="padding: 0.75rem 1rem; background: #111827;">
                    <p style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">New (${unreadNotifications.length})</p>
                </div>
                ${unreadNotifications.map(notification => renderNotificationItem(notification)).join('')}
            ` : ''}
            
            ${readNotifications.length > 0 ? `
                <div style="padding: 0.75rem 1rem; background: #111827;">
                    <p style="color: #9CA3AF; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Earlier</p>
                </div>
                ${readNotifications.map(notification => renderNotificationItem(notification)).join('')}
            ` : ''}
            
            ${allNotifications.length === 0 ? `
                <div style="padding: 3rem 1rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔔</div>
                    <p style="color: #9CA3AF; margin-bottom: 0.5rem;">No notifications yet</p>
                    <p style="color: #6B7280; font-size: 0.875rem;">You'll be notified about important updates</p>
                </div>
            ` : ''}
        </div>
        
        ${allNotifications.length > 0 ? `
            <div style="padding: 0.75rem 1rem; border-top: 1px solid #4B5563; text-align: center;">
                <button onclick="viewAllNotifications()" style="padding: 0.5rem 1rem; background: transparent; color: #40E0D0; border: none; cursor: pointer; font-size: 0.875rem; font-weight: 500;">View All Notifications</button>
            </div>
        ` : ''}
    `;
}

function renderNotificationItem(notification) {
    const typeIcons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        project: '💼',
        invoice: '💰',
        ticket: '🎫',
        client: '👤',
        team: '👥'
    };

    const typeColors = {
        info: '#3B82F6',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        project: '#40E0D0',
        invoice: '#FBB624',
        ticket: '#A855F7',
        client: '#8B5CF6',
        team: '#06B6D4'
    };

    const icon = typeIcons[notification.type] || 'ℹ️';
    const color = typeColors[notification.type] || '#9CA3AF';
    const timeAgo = getTimeAgo(notification.created_at);

    return `
        <div onclick="handleNotificationClick('${notification.id}')" style="padding: 1rem; border-bottom: 1px solid #374151; cursor: pointer; transition: background 0.2s; ${!notification.is_read ? 'background: rgba(64, 224, 208, 0.05);' : ''}" onmouseenter="this.style.background='#111827'" onmouseleave="this.style.background='${!notification.is_read ? 'rgba(64, 224, 208, 0.05)' : 'transparent'}'">
            <div style="display: flex; gap: 0.75rem;">
                <div style="flex-shrink: 0;">
                    <div style="width: 40px; height: 40px; background: rgba(${hexToRgb(color)}, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem;">
                        ${icon}
                    </div>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.25rem;">
                        <h4 style="color: #fff; font-size: 0.875rem; font-weight: 600; margin: 0;">${notification.title}</h4>
                        ${!notification.is_read ? '<div style="width: 8px; height: 8px; background: #40E0D0; border-radius: 50%; flex-shrink: 0;"></div>' : ''}
                    </div>
                    <p style="color: #9CA3AF; font-size: 0.875rem; line-height: 1.4; margin: 0 0 0.5rem 0;">${notification.message}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="color: #6B7280; font-size: 0.75rem;">${timeAgo}</span>
                        ${notification.action_url ? `<button onclick="event.stopPropagation(); handleNotificationAction('${notification.id}', '${notification.action_url}')" style="padding: 0.25rem 0.75rem; background: transparent; color: ${color}; border: 1px solid ${color}; border-radius: 6px; cursor: pointer; font-size: 0.75rem;">${notification.action_label || 'View'}</button>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function handleNotificationClick(notificationId) {
    try {
        await markNotificationAsRead(notificationId);
        
        const notification = allNotifications.find(n => n.id === notificationId);
        if (notification?.action_url) {
            if (notification.action_url.startsWith('#')) {
                // Internal navigation
                const section = notification.action_url.substring(1);
                document.querySelector(`[href="#${section}"]`)?.click();
            } else {
                // External link
                window.open(notification.action_url, '_blank');
            }
            
            // Close panel
            const panel = document.getElementById('notification-panel');
            if (panel) panel.style.display = 'none';
        }
    } catch (error) {
        console.error('Failed to handle notification click:', error);
    }
}

async function handleNotificationAction(notificationId, actionUrl) {
    await markNotificationAsRead(notificationId);
    
    if (actionUrl.startsWith('#')) {
        const section = actionUrl.substring(1);
        document.querySelector(`[href="#${section}"]`)?.click();
    } else {
        window.open(actionUrl, '_blank');
    }
    
    const panel = document.getElementById('notification-panel');
    if (panel) panel.style.display = 'none';
}

async function markNotificationAsRead(notificationId) {
    try {
        const { error } = await supabase.rpc('mark_notification_read', {
            notification_id: notificationId
        });

        if (error) throw error;

        // Update local state
        const notification = allNotifications.find(n => n.id === notificationId);
        if (notification) {
            notification.is_read = true;
            notification.read_at = new Date().toISOString();
            updateNotificationUI();
        }
    } catch (error) {
        console.error('Failed to mark notification as read:', error);
    }
}

async function markAllAsRead() {
    try {
        const { error } = await supabase.rpc('mark_all_notifications_read');
        if (error) throw error;

        // Update local state
        allNotifications.forEach(n => {
            if (!n.is_read) {
                n.is_read = true;
                n.read_at = new Date().toISOString();
            }
        });
        
        updateNotificationUI();
        showNotification('All notifications marked as read', 'success');
    } catch (error) {
        console.error('Failed to mark all as read:', error);
        showNotification('Failed to mark notifications as read', 'error');
    }
}

function showNotificationSettings() {
    const panel = document.getElementById('notification-panel');
    if (panel) panel.style.display = 'none';
    
    // Navigate to settings with notifications tab
    document.querySelector('[href="#settings"]')?.click();
    setTimeout(() => {
        const notificationsTab = document.querySelector('[data-tab="notifications"]');
        if (notificationsTab) notificationsTab.click();
    }, 100);
}

function viewAllNotifications() {
    const panel = document.getElementById('notification-panel');
    if (panel) panel.style.display = 'none';
    
    showModal('All Notifications', renderAllNotificationsModal());
}

function renderAllNotificationsModal() {
    return `
        <div style="max-height: 70vh; overflow-y: auto;">
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                <button onclick="filterNotifications('all')" class="notif-filter-btn active" data-filter="all" style="padding: 0.5rem 1rem; background: rgba(64, 224, 208, 0.2); color: #40E0D0; border: 1px solid #40E0D0; border-radius: 50px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">All</button>
                <button onclick="filterNotifications('unread')" class="notif-filter-btn" data-filter="unread" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 50px; cursor: pointer; font-size: 0.875rem;">Unread</button>
                <button onclick="filterNotifications('project')" class="notif-filter-btn" data-filter="project" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 50px; cursor: pointer; font-size: 0.875rem;">💼 Projects</button>
                <button onclick="filterNotifications('invoice')" class="notif-filter-btn" data-filter="invoice" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 50px; cursor: pointer; font-size: 0.875rem;">💰 Invoices</button>
                <button onclick="filterNotifications('ticket')" class="notif-filter-btn" data-filter="ticket" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 50px; cursor: pointer; font-size: 0.875rem;">🎫 Tickets</button>
                <button onclick="filterNotifications('client')" class="notif-filter-btn" data-filter="client" style="padding: 0.5rem 1rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 50px; cursor: pointer; font-size: 0.875rem;">👤 Clients</button>
            </div>
            
            <div id="filtered-notifications">
                ${allNotifications.map(notification => renderNotificationItem(notification)).join('')}
            </div>
            
            <div style="text-align: center; padding: 1rem; margin-top: 1rem; border-top: 1px solid #4B5563;">
                <button onclick="closeModal()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 50px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
}

function filterNotifications(filter) {
    // Update button styles
    document.querySelectorAll('.notif-filter-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.style.background = '#111827';
        btn.style.color = '#9CA3AF';
        btn.style.borderColor = '#4B5563';
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.style.background = 'rgba(64, 224, 208, 0.2)';
        activeBtn.style.color = '#40E0D0';
        activeBtn.style.borderColor = '#40E0D0';
    }
    
    // Filter notifications
    let filtered = allNotifications;
    
    if (filter === 'unread') {
        filtered = allNotifications.filter(n => !n.is_read);
    } else if (filter !== 'all') {
        filtered = allNotifications.filter(n => n.type === filter);
    }
    
    // Update display
    const container = document.getElementById('filtered-notifications');
    if (container) {
        if (filtered.length === 0) {
            container.innerHTML = `
                <div style="padding: 3rem 1rem; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 0.5rem;">🔔</div>
                    <p style="color: #9CA3AF;">No notifications found</p>
                </div>
            `;
        } else {
            container.innerHTML = filtered.map(notification => renderNotificationItem(notification)).join('');
        }
    }
}

function showToastNotification(notification) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: #1F2937;
        border: 1px solid #4B5563;
        border-left: 4px solid #40E0D0;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; gap: 0.75rem;">
            <div style="flex-shrink: 0; font-size: 1.5rem;">
                ${notification.type === 'success' ? '✅' : notification.type === 'warning' ? '⚠️' : notification.type === 'error' ? '❌' : 'ℹ️'}
            </div>
            <div style="flex: 1;">
                <h4 style="color: #fff; font-size: 0.875rem; font-weight: 600; margin: 0 0 0.25rem 0;">${notification.title}</h4>
                <p style="color: #9CA3AF; font-size: 0.875rem; margin: 0;">${notification.message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="flex-shrink: 0; background: transparent; border: none; color: #9CA3AF; cursor: pointer; padding: 0; font-size: 1.25rem;">×</button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function playNotificationSound() {
    try {
        if (notificationSound && notificationSound.paused) {
            notificationSound.play().catch(err => console.log('Sound play prevented:', err));
        }
    } catch (error) {
        console.log('Failed to play notification sound:', error);
    }
}

// Helper functions
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '64, 224, 208';
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Create sample notification function for testing
async function createTestNotification(type = 'info') {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const testNotifications = {
            info: {
                title: 'System Update',
                message: 'A new feature has been added to the dashboard. Check it out!',
                type: 'info'
            },
            success: {
                title: 'Project Completed',
                message: 'The E-Commerce Platform project has been successfully completed!',
                type: 'project',
                action_url: '#projects',
                action_label: 'View Project'
            },
            warning: {
                title: 'Invoice Due Soon',
                message: 'Invoice #1235 is due in 3 days. Please follow up with the client.',
                type: 'invoice',
                action_url: '#invoices',
                action_label: 'View Invoice'
            },
            ticket: {
                title: 'New Support Ticket',
                message: 'A high-priority ticket has been assigned to you.',
                type: 'ticket',
                action_url: '#tickets',
                action_label: 'View Ticket'
            }
        };

        const notification = testNotifications[type] || testNotifications.info;

        const { error } = await supabase
            .from('notifications')
            .insert([{
                user_id: user.id,
                ...notification,
                priority: 'normal'
            }]);

        if (error) throw error;
        console.log('Test notification created!');
    } catch (error) {
        console.error('Failed to create test notification:', error);
    }
}

// Export functions for use in other files
window.createTestNotification = createTestNotification;
window.markNotificationAsRead = markNotificationAsRead;
window.markAllAsRead = markAllAsRead;
window.showNotificationSettings = showNotificationSettings;
window.viewAllNotifications = viewAllNotifications;
window.filterNotifications = filterNotifications;
window.handleNotificationClick = handleNotificationClick;
window.handleNotificationAction = handleNotificationAction;
