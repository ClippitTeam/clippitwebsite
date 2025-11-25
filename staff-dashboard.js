// Staff Dashboard JavaScript
// Handles staff member dashboard functionality

import { formatDate, formatCurrency, getProjectStatusColor } from './projects.js';

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuthentication();
    await loadStaffProfile();
    await loadStaffProjects();
    setupNavigationListeners();
    setupTaskFilters();
});

// Check if user is authenticated and is staff
async function checkAuthentication() {
    try {
        const { data: { user }, error } = await window.supabaseClient.auth.getUser();
        
        if (error || !user) {
            window.location.href = 'login.html';
            return;
        }

        // Check if user is staff
        const { data: profile, error: profileError } = await window.supabaseClient
            .from('profiles')
            .select('role, full_name, email')
            .eq('id', user.id)
            .single();

        if (profileError || !profile || profile.role !== 'staff') {
            // Not a staff member, redirect based on role
            if (profile?.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else if (profile?.role === 'customer') {
                window.location.href = 'customer-dashboard.html';
            } else {
                window.location.href = 'login.html';
            }
            return;
        }

    } catch (error) {
        console.error('Authentication error:', error);
        window.location.href = 'login.html';
    }
}

// Load staff profile information
async function loadStaffProfile() {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        const { data: profile, error } = await window.supabaseClient
            .from('profiles')
            .select('full_name, email, role')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        // Update UI with profile info
        const fullName = profile.full_name || profile.email.split('@')[0];
        const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        document.getElementById('staff-name').textContent = fullName;
        document.getElementById('staff-avatar').textContent = initials;
        document.getElementById('welcome-message').textContent = `Welcome back, ${fullName.split(' ')[0]}! 👋`;

        // Update profile form if on settings page
        const profileNameInput = document.getElementById('profile-name');
        const profileEmailInput = document.getElementById('profile-email');
        const profileRoleInput = document.getElementById('profile-role');

        if (profileNameInput) profileNameInput.value = profile.full_name || '';
        if (profileEmailInput) profileEmailInput.value = profile.email;
        if (profileRoleInput) profileRoleInput.value = 'Staff Member';

    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Load projects assigned to staff member
async function loadStaffProjects() {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        // Get projects where this staff member is a team member
        const { data: projects, error } = await window.supabaseClient
            .from('team_members')
            .select(`
                id,
                role,
                involvement_percentage,
                projects:project_id (
                    id,
                    title,
                    description,
                    status,
                    progress,
                    start_date,
                    due_date,
                    icon,
                    type,
                    health,
                    customer:customer_id (
                        full_name,
                        email
                    )
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Update project count
        const projectCount = projects?.length || 0;
        document.getElementById('projects-count').textContent = projectCount;
        document.getElementById('stat-projects').textContent = projectCount;

        // Render projects in dashboard section
        renderDashboardProjects(projects);
        
        // Render all projects in "My Projects" section
        renderAllProjects(projects);

    } catch (error) {
        console.error('Error loading projects:', error);
        showNotification('Error loading projects: ' + error.message, 'error');
    }
}

// Render projects in dashboard overview
function renderDashboardProjects(projectAssignments) {
    const container = document.getElementById('dashboard-projects-list');
    
    if (!projectAssignments || projectAssignments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #9CA3AF;">
                <div style="font-size: 2rem; margin-bottom: 1rem;">💼</div>
                <p>No projects assigned yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Contact your admin to get assigned to projects</p>
            </div>
        `;
        return;
    }

    // Show only first 3 projects on dashboard
    const displayProjects = projectAssignments.slice(0, 3);
    
    container.innerHTML = displayProjects.map(assignment => {
        const project = assignment.projects;
        if (!project) return '';
        
        const statusColor = getProjectStatusColor(project.status);
        const healthColor = getHealthColor(project.health);
        
        return `
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #374151; transition: all 0.3s;" onmouseenter="this.style.borderColor='#40E0D0'" onmouseleave="this.style.borderColor='#374151'">
                <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center; flex: 1;">
                        <div style="font-size: 2rem;">${project.icon || '💼'}</div>
                        <div style="flex: 1;">
                            <h4 style="color: #40E0D0; font-size: 1.125rem; margin-bottom: 0.25rem;">${project.title}</h4>
                            <p style="color: #9CA3AF; font-size: 0.875rem;">Your role: ${formatRole(assignment.role)}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="background: ${statusColor}20; color: ${statusColor}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${project.status.replace('-', ' ')}</span>
                        <span style="color: ${healthColor}; font-size: 1.25rem;" title="${project.health}">●</span>
                    </div>
                </div>
                
                <div style="background: #1F2937; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #9CA3AF; font-size: 0.875rem;">Progress</span>
                        <span style="color: #40E0D0; font-size: 0.875rem; font-weight: 600;">${project.progress}%</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: #374151; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${project.progress}%; height: 100%; background: linear-gradient(90deg, #40E0D0, #36B8A8);"></div>
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; font-size: 0.875rem; margin-bottom: 1rem;">
                    <div style="flex: 1;">
                        <p style="color: #9CA3AF; margin-bottom: 0.25rem;">Due Date</p>
                        <p style="color: #fff; font-weight: 600;">${formatDate(project.due_date)}</p>
                    </div>
                    <div style="flex: 1;">
                        <p style="color: #9CA3AF; margin-bottom: 0.25rem;">Your Involvement</p>
                        <p style="color: #fff; font-weight: 600;">${assignment.involvement_percentage}%</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 0.75rem;">
                    <button onclick="viewProjectDetails('${project.id}')" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">View Details</button>
                    <button onclick="showProjectComments('${project.id}')" style="padding: 0.75rem; background: #111827; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 8px; cursor: pointer;">💬</button>
                </div>
            </div>
        `;
    }).join('');
}

// View project details
window.viewProjectDetails = async function(projectId) {
    try {
        const { data: project, error } = await window.supabaseClient
            .from('projects')
            .select(`
                *,
                customer:customer_id (full_name, email),
                milestones (*),
                team_members (
                    *,
                    profiles!team_members_user_id_fkey (full_name, email)
                )
            `)
            .eq('id', projectId)
            .single();
            
        if (error) throw error;
        
        showProjectDetailsModal(project);
    } catch (error) {
        console.error('Error loading project details:', error);
        showNotification('Error loading project details: ' + error.message, 'error');
    }
};

// Show project details modal
function showProjectDetailsModal(project) {
    const statusColor = getProjectStatusColor(project.status);
    const healthColor = getHealthColor(project.health);
    const customerName = project.customer?.full_name || project.customer?.email || 'Unknown';
    
    const modal = document.createElement('div');
    modal.id = 'project-details-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow-y: auto; padding: 2rem;';
    
    const milestones = project.milestones || [];
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    
    modal.innerHTML = `
        <div style="background: #1F2937; border-radius: 16px; padding: 2rem; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid #374151;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 2rem;">
                <div style="display: flex; gap: 1.5rem; align-items: center;">
                    <div style="font-size: 3rem;">${project.icon || '💼'}</div>
                    <div>
                        <h2 style="color: #40E0D0; font-size: 2rem; margin-bottom: 0.5rem;">${project.title}</h2>
                        <p style="color: #9CA3AF;">${project.type || 'Project'}</p>
                    </div>
                </div>
                <button onclick="closeModal('project-details-modal')" style="background: transparent; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer; padding: 0.5rem;">&times;</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Status</p>
                    <span style="background: ${statusColor}20; color: ${statusColor}; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; text-transform: uppercase;">${project.status.replace('-', ' ')}</span>
                </div>
                <div>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Progress</p>
                    <p style="color: #fff; font-size: 1.5rem; font-weight: 700;">${project.progress}%</p>
                </div>
                <div>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Health</p>
                    <span style="color: ${healthColor}; font-size: 2rem;">●</span>
                </div>
                <div>
                    <p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.5rem;">Due Date</p>
                    <p style="color: #fff; font-size: 1.125rem; font-weight: 600;">${formatDate(project.due_date)}</p>
                </div>
            </div>
            
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="color: #fff; margin-bottom: 1rem;">Description</h3>
                <p style="color: #9CA3AF; line-height: 1.6;">${project.description || 'No description available'}</p>
            </div>
            
            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem;">
                <h3 style="color: #40E0D0; margin-bottom: 1rem;">Milestones (${completedMilestones}/${milestones.length})</h3>
                ${milestones.length > 0 ? milestones.map(m => `
                    <div style="padding: 1rem; background: #1F2937; border-radius: 8px; margin-bottom: 0.75rem; border-left: 4px solid ${m.status === 'completed' ? '#10B981' : '#40E0D0'};">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="color: ${m.status === 'completed' ? '#10B981' : '#fff'};">${m.status === 'completed' ? '✓' : '⏳'} ${m.title}</h4>
                            <span style="background: ${m.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(64, 224, 208, 0.2)'}; color: ${m.status === 'completed' ? '#10B981' : '#40E0D0'}; padding: 0.25rem 0.75rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">${m.status.replace('-', ' ').toUpperCase()}</span>
                        </div>
                        <p style="color: #9CA3AF; font-size: 0.875rem; margin-top: 0.5rem;">${m.description || ''}</p>
                    </div>
                `).join('') : '<p style="color: #9CA3AF; text-align: center; padding: 2rem;">No milestones defined yet</p>'}
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button onclick="closeModal('project-details-modal')" style="flex: 1; padding: 0.75rem; background: #111827; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 8px; font-weight: 600; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Show project comments/messages
window.showProjectComments = function(projectId) {
    showNotification('Project messaging feature coming soon! Contact your admin for project updates.', 'info');
};

// Close modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
};

// Render all projects in "My Projects" section
function renderAllProjects(projectAssignments) {
    const container = document.getElementById('my-projects-list');
    
    if (!projectAssignments || projectAssignments.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #9CA3AF; grid-column: 1 / -1;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">💼</div>
                <p>No projects assigned yet</p>
                <p style="font-size: 0.875rem; margin-top: 0.5rem;">Contact your admin to get assigned to projects</p>
            </div>
        `;
        return;
    }

    container.innerHTML = projectAssignments.map(assignment => {
        const project = assignment.projects;
        if (!project) return '';
        
        const statusColor = getProjectStatusColor(project.status);
        const healthColor = getHealthColor(project.health);
        const customerName = project.customer?.full_name || project.customer?.email || 'Unknown';
        
        return `
            <div style="background: #1F2937; padding: 1.5rem; border-radius: 12px; border: 1px solid #374151; transition: all 0.3s;" onmouseenter="this.style.borderColor='#40E0D0'" onmouseleave="this.style.borderColor='#374151'">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div style="font-size: 2.5rem;">${project.icon || '💼'}</div>
                        <div>
                            <h3 style="color: #40E0D0; font-size: 1.25rem; margin-bottom: 0.25rem;">${project.title}</h3>
                            <p style="color: #9CA3AF; font-size: 0.875rem;">${project.type || 'Project'}</p>
                        </div>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                        <span style="background: ${statusColor}20; color: ${statusColor}; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; font-weight: 600; text-transform: uppercase;">${project.status.replace('-', ' ')}</span>
                        <span style="color: ${healthColor}; font-size: 1.5rem;" title="${project.health}">●</span>
                    </div>
                </div>
                
                <p style="color: #9CA3AF; margin-bottom: 1.5rem; line-height: 1.6;">${project.description || 'No description available'}</p>
                
                <div style="background: #111827; padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span style="color: #9CA3AF; font-size: 0.875rem;">Overall Progress</span>
                        <span style="color: #40E0D0; font-size: 0.875rem; font-weight: 600;">${project.progress}%</span>
                    </div>
                    <div style="width: 100%; height: 8px; background: #374151; border-radius: 4px; overflow: hidden;">
                        <div style="width: ${project.progress}%; height: 100%; background: linear-gradient(90deg, #40E0D0, #36B8A8);"></div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.75rem; margin-bottom: 0.25rem;">Client</p>
                        <p style="color: #fff; font-weight: 600;">${customerName}</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.75rem; margin-bottom: 0.25rem;">Your Role</p>
                        <p style="color: #fff; font-weight: 600;">${formatRole(assignment.role)}</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.75rem; margin-bottom: 0.25rem;">Start Date</p>
                        <p style="color: #fff; font-weight: 600;">${formatDate(project.start_date)}</p>
                    </div>
                    <div>
                        <p style="color: #9CA3AF; font-size: 0.75rem; margin-bottom: 0.25rem;">Due Date</p>
                        <p style="color: #fff; font-weight: 600;">${formatDate(project.due_date)}</p>
                    </div>
                </div>
                
                <div style="padding: 1rem; background: rgba(64, 224, 208, 0.1); border: 1px solid rgba(64, 224, 208, 0.3); border-radius: 8px;">
                    <p style="color: #40E0D0; font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">Your Involvement</p>
                    <p style="color: #fff; font-size: 1.25rem; font-weight: 700;">${assignment.involvement_percentage}%</p>
                </div>
            </div>
        `;
    }).join('');
}

// Format role for display
function formatRole(role) {
    if (!role) return 'Team Member';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Get health indicator color
function getHealthColor(health) {
    const colors = {
        'excellent': '#10B981',
        'good': '#10B981',
        'warning': '#F59E0B',
        'critical': '#EF4444'
    };
    return colors[health] || '#9CA3AF';
}

// Setup navigation listeners
function setupNavigationListeners() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
        });
    });
}

// Setup task filters
function setupTaskFilters() {
    const filterButtons = document.querySelectorAll('.task-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Filter tasks (implementation depends on task data structure)
            const filter = button.getAttribute('data-filter');
            filterTasks(filter);
        });
    });
}

// Filter tasks (placeholder - will be implemented with task system)
function filterTasks(filter) {
    console.log('Filtering tasks by:', filter);
    // TODO: Implement task filtering when task system is built
}

// Show specific section
window.showSection = function(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Show selected section
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${sectionName}`) {
            item.classList.add('active');
        }
    });
};

// Handle logout
window.handleLogout = async function() {
    try {
        await window.supabaseClient.auth.signOut();
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
};

// Show notification
window.showNotification = function(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#40E0D0'};
        color: ${type === 'info' ? '#111827' : '#fff'};
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
};

// Handle profile form submission
const profileForm = document.getElementById('profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            const fullName = document.getElementById('profile-name').value;
            
            const { error } = await window.supabaseClient
                .from('profiles')
                .update({ full_name: fullName })
                .eq('id', user.id);
                
            if (error) throw error;
            
            showNotification('Profile updated successfully!', 'success');
            await loadStaffProfile();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('Error updating profile: ' + error.message, 'error');
        }
    });
}

// Export functions for use in other modules
export {
    loadStaffProjects,
    loadStaffProfile,
    showSection,
    showNotification
};
