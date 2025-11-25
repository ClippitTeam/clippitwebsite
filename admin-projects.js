// Admin Projects Management
// Handles admin-specific project CRUD operations and UI interactions

import { 
    createProject, 
    updateProject, 
    getUserProjects, 
    getProjectById,
    addMilestone,
    updateMilestone,
    addProjectFile,
    addTeamMember,
    removeTeamMember,
    addProjectUpdate,
    formatCurrency,
    formatDate,
    getProjectStatusColor
} from './projects.js';

// Initialize admin projects on page load
document.addEventListener('DOMContentLoaded', async () => {
    const projectsSection = document.getElementById('section-projects');
    if (!projectsSection) return;
    
    // Load all projects for admin view
    await loadAdminProjects();
    
    // Set up event listeners
    setupProjectFilters();
    setupViewToggle();
});

// Load all projects for admin dashboard
async function loadAdminProjects() {
    try {
        const projectsList = document.getElementById('projects-table-view');
        if (!projectsList) return;
        
        // Show loading state
        const tbody = projectsList.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="padding: 2rem; text-align: center; color: #9CA3AF;">
                        <div style="font-size: 2rem; margin-bottom: 1rem;">⏳</div>
                        <p>Loading projects...</p>
                    </td>
                </tr>
            `;
        }
        
        // Get all projects from Supabase
        const { data: projects, error } = await window.supabaseClient
            .from('projects')
            .select(`
                *,
                customer:profiles!projects_customer_id_fkey(
                    id,
                    full_name,
                    email
                ),
                milestones(id, title, status, due_date),
                team_members(
                    id,
                    profiles!team_members_user_id_fkey(
                        full_name,
                        email
                    )
                )
            `)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('Error loading projects:', error);
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="padding: 2rem; text-align: center; color: #EF4444;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">❌</div>
                            <p>Error loading projects</p>
                            <p style="font-size: 0.875rem; margin-top: 0.5rem;">${error.message}</p>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        // Render projects
        if (!projects || projects.length === 0) {
            if (tbody) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="padding: 2rem; text-align: center; color: #9CA3AF;">
                            <div style="font-size: 2rem; margin-bottom: 1rem;">📋</div>
                            <p>No projects yet</p>
                            <button onclick="showCreateProjectModal()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Create First Project</button>
                        </td>
                    </tr>
                `;
            }
            return;
        }
        
        // Build table rows
        const rows = projects.map(project => {
            const customerName = project.customer?.full_name || 'Unknown';
            const customerCompany = project.customer?.email?.split('@')[1]?.split('.')[0] || '';
            const progress = project.progress || 0;
            const statusColor = getProjectStatusColor(project.status);
            const healthColor = getHealthColor(project.health);
            
            // Get team member initials
            const teamMembers = project.team_members?.slice(0, 3) || [];
            const teamHTML = teamMembers.map((member, index) => {
                const name = member.profiles?.full_name || 'Unknown';
                const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                const colors = ['#40E0D0', '#A855F7', '#FBB624', '#10B981'];
                const color = colors[index % colors.length];
                
                return `<div style="width: 32px; height: 32px; background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)}); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: ${index % 2 === 0 ? '#111827' : '#fff'};">${initials}</div>`;
            }).join('');
            
            return `
                <tr onclick="viewAdminProjectDetails('${project.id}')" style="border-bottom: 1px solid #374151; cursor: pointer; transition: background 0.2s;" onmouseenter="this.style.background='#111827'" onmouseleave="this.style.background='transparent'">
                    <td style="padding: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="font-size: 1.5rem;">${project.icon || '💼'}</div>
                            <div>
                                <p style="color: #fff; font-weight: 600;">${project.title}</p>
                                <p style="color: #9CA3AF; font-size: 0.875rem;">#${project.id.substring(0, 8).toUpperCase()}</p>
                            </div>
                        </div>
                    </td>
                    <td style="padding: 1rem;">
                        <p style="color: #fff;">${customerName}</p>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">${customerCompany}</p>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="background: ${statusColor}20; color: ${statusColor}; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${project.status.replace('-', ' ')}</span>
                    </td>
                    <td style="padding: 1rem;">
                        <div style="display: flex; gap: 0.25rem;">
                            ${teamHTML}
                            ${project.team_members?.length > 3 ? `<div style="width: 32px; height: 32px; background: #4B5563; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: #9CA3AF;">+${project.team_members.length - 3}</div>` : ''}
                        </div>
                    </td>
                    <td style="padding: 1rem;">
                        <div style="display: flex; align-items: center; gap: 0.5rem;">
                            <div style="flex: 1; height: 6px; background: #374151; border-radius: 3px; overflow: hidden;">
                                <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #40E0D0, #36B8A8);"></div>
                            </div>
                            <span style="color: #fff; font-size: 0.875rem;">${progress}%</span>
                        </div>
                    </td>
                    <td style="padding: 1rem; color: #fff;">${formatDate(project.due_date)}</td>
                    <td style="padding: 1rem; text-align: center;">
                        <span style="color: ${healthColor}; font-size: 1.5rem;" title="${project.health}">●</span>
                    </td>
                    <td style="padding: 1rem; text-align: right;" onclick="event.stopPropagation()">
                        <button onclick="editProject('${project.id}')" style="padding: 0.25rem 0.75rem; background: transparent; color: #40E0D0; border: 1px solid #40E0D0; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">Edit</button>
                        <button onclick="showProjectMenu('${project.id}')" style="padding: 0.25rem 0.5rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 6px; cursor: pointer;">⋯</button>
                    </td>
                </tr>
            `;
        }).join('');
        
        if (tbody) {
            tbody.innerHTML = rows;
        }
        
        // Update stats
        updateProjectStats(projects);
        
    } catch (error) {
        console.error('Error in loadAdminProjects:', error);
    }
}

// Update project statistics
function updateProjectStats(projects) {
    const stats = {
        active: projects.filter(p => p.status === 'in-progress').length,
        review: projects.filter(p => p.status === 'review').length,
        completed: projects.filter(p => p.status === 'completed' && isThisMonth(p.updated_at)).length,
        needsAttention: projects.filter(p => p.health === 'critical' || p.health === 'warning').length
    };
    
    // Update stat cards if they exist
    const statCards = document.querySelectorAll('.projects-admin-section .analytics-stat, .projects-stats h3');
    // This would update the visual stats - implementation depends on exact HTML structure
}

// Helper function to check if date is in current month
function isThisMonth(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
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

// Adjust color brightness
function adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// Show create project modal
window.showCreateProjectModal = function() {
    const modal = document.createElement('div');
    modal.id = 'create-project-modal';
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    
    modal.innerHTML = `
        <div style="background: #1F2937; border-radius: 16px; padding: 2rem; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; border: 1px solid #374151;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="color: #40E0D0; font-size: 1.5rem;">Create New Project</h3>
                <button onclick="closeModal('create-project-modal')" style="background: transparent; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer; padding: 0.5rem;">&times;</button>
            </div>
            
            <form id="create-project-form" onsubmit="handleCreateProject(event)" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Title *</label>
                    <input type="text" name="title" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Description *</label>
                    <textarea name="description" required rows="4" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff; resize: vertical;"></textarea>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Client *</label>
                        <select name="customer_id" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;" id="client-select">
                            <option value="">Loading clients...</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Project Type *</label>
                        <select name="type" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                            <option value="website">Website</option>
                            <option value="mobile-app">Mobile App</option>
                            <option value="web-app">Web Application</option>
                            <option value="ecommerce">E-Commerce</option>
                            <option value="design">Design</option>
                            <option value="consulting">Consulting</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Start Date *</label>
                        <input type="date" name="start_date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Due Date *</label>
                        <input type="date" name="due_date" required style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Budget (Optional)</label>
                        <input type="number" name="budget" step="0.01" placeholder="0.00" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; color: #fff;">Icon (Emoji)</label>
                        <input type="text" name="icon" maxlength="2" placeholder="💼" style="width: 100%; padding: 0.75rem; background: #111827; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                    </div>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.75rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Create Project</button>
                    <button type="button" onclick="closeModal('create-project-modal')" style="flex: 1; padding: 0.75rem; background: transparent; color: #9CA3AF; border: 1px solid #4B5563; border-radius: 8px; font-weight: 600; cursor: pointer;">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load clients for dropdown
    loadClientsForDropdown();
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    modal.querySelector('[name="start_date"]').value = today;
    modal.querySelector('[name="due_date"]').value = nextMonth;
};

// Load clients for dropdown
async function loadClientsForDropdown() {
    try {
        const { data: clients, error } = await window.supabaseClient
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'customer')
            .order('full_name');
        
        const select = document.getElementById('client-select');
        if (!select) return;
        
        if (error || !clients || clients.length === 0) {
            select.innerHTML = '<option value="">No clients available</option>';
            return;
        }
        
        select.innerHTML = '<option value="">Select a client...</option>' + 
            clients.map(client => `
                <option value="${client.id}">${client.full_name || client.email}</option>
            `).join('');
            
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

// Handle create project form submission
window.handleCreateProject = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
    
    try {
        const projectData = {
            title: formData.get('title'),
            description: formData.get('description'),
            customer_id: formData.get('customer_id'),
            type: formData.get('type'),
            start_date: formData.get('start_date'),
            due_date: formData.get('due_date'),
            budget: formData.get('budget') ? parseFloat(formData.get('budget')) : null,
            icon: formData.get('icon') || '💼',
            status: 'planning',
            health: 'excellent',
            progress: 0
        };
        
        const result = await createProject(projectData);
        
        if (result.success) {
            closeModal('create-project-modal');
            showNotification('Project created successfully!', 'success');
            // Reload projects list
            await loadAdminProjects();
        } else {
            throw new Error(result.error || 'Failed to create project');
        }
        
    } catch (error) {
        console.error('Error creating project:', error);
        showNotification('Error creating project: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Project';
    }
};

// Close modal
window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
};

// View project details (admin view)
window.viewAdminProjectDetails = async function(projectId) {
    console.log('Loading admin view for project:', projectId);
    showManageTeamModal(projectId);
};

// Edit project
window.editProject = async function(projectId) {
    console.log('Editing project:', projectId);
    // TODO: Implement project editing
    showNotification('Edit project feature coming soon!', 'info');
};

// Show project menu
window.showProjectMenu = function(projectId) {
    console.log('Show menu for project:', projectId);
    // TODO: Implement context menu
    showNotification('Project menu coming soon!', 'info');
};

// Show manage team modal
async function showManageTeamModal(projectId) {
    try {
        // Load project details and current team members
        const { data: project, error: projectError } = await window.supabaseClient
            .from('projects')
            .select(`
                *,
                customer:profiles!projects_customer_id_fkey(full_name, email),
                team_members(
                    *,
                    profiles!team_members_user_id_fkey(
                        id,
                        full_name,
                        email,
                        avatar_url
                    )
                )
            `)
            .eq('id', projectId)
            .single();
            
        if (projectError) throw projectError;
        
        // Load all staff members
        const { data: allStaff, error: staffError } = await window.supabaseClient
            .from('profiles')
            .select('id, full_name, email, avatar_url, role')
            .in('role', ['admin', 'staff'])
            .order('full_name');
            
        if (staffError) throw staffError;
        
        // Filter out already assigned members
        const currentMemberIds = project.team_members?.map(m => m.user_id) || [];
        const availableStaff = allStaff.filter(s => !currentMemberIds.includes(s.id));
        
        const modal = document.createElement('div');
        modal.id = 'manage-team-modal';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000; overflow-y: auto; padding: 2rem;';
        
        modal.innerHTML = `
            <div style="background: #1F2937; border-radius: 16px; padding: 2rem; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid #374151;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <div>
                        <h3 style="color: #40E0D0; font-size: 1.5rem; margin-bottom: 0.5rem;">Manage Team</h3>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">${project.title}</p>
                    </div>
                    <button onclick="closeModal('manage-team-modal')" style="background: transparent; border: none; color: #9CA3AF; font-size: 1.5rem; cursor: pointer; padding: 0.5rem;">&times;</button>
                </div>
                
                <!-- Add Team Member Section -->
                <div style="background: #111827; border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #374151;">
                    <h4 style="color: #fff; font-size: 1.125rem; margin-bottom: 1rem;">Add Team Member</h4>
                    
                    ${availableStaff.length > 0 ? `
                        <form id="add-team-member-form" onsubmit="handleAddTeamMember(event, '${projectId}')" style="display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 1rem; align-items: end;">
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: #9CA3AF; font-size: 0.875rem;">Staff Member</label>
                                <select name="user_id" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                                    <option value="">Select member...</option>
                                    ${availableStaff.map(staff => `
                                        <option value="${staff.id}">${staff.full_name || staff.email} ${staff.role === 'admin' ? '(Admin)' : ''}</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: #9CA3AF; font-size: 0.875rem;">Role</label>
                                <select name="role" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                                    <option value="developer">Developer</option>
                                    <option value="designer">Designer</option>
                                    <option value="project_manager">Project Manager</option>
                                    <option value="qa_tester">QA Tester</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; margin-bottom: 0.5rem; color: #9CA3AF; font-size: 0.875rem;">Involvement %</label>
                                <input type="number" name="involvement_percentage" min="1" max="100" value="100" required style="width: 100%; padding: 0.75rem; background: #1F2937; border: 1px solid #4B5563; border-radius: 8px; color: #fff;">
                            </div>
                            
                            <button type="submit" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap;">Add Member</button>
                        </form>
                    ` : `
                        <p style="color: #9CA3AF; text-align: center; padding: 1rem;">All available staff members are already assigned to this project.</p>
                    `}
                </div>
                
                <!-- Current Team Members -->
                <div>
                    <h4 style="color: #fff; font-size: 1.125rem; margin-bottom: 1rem;">Current Team (${project.team_members?.length || 0})</h4>
                    
                    <div id="team-members-list" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${project.team_members && project.team_members.length > 0 ? 
                            project.team_members.map(member => `
                                <div style="background: #111827; border-radius: 12px; padding: 1rem; border: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                                        <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 700; color: #111827;">
                                            ${member.profiles?.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '??'}
                                        </div>
                                        <div style="flex: 1;">
                                            <p style="color: #fff; font-weight: 600;">${member.profiles?.full_name || 'Unknown'}</p>
                                            <p style="color: #9CA3AF; font-size: 0.875rem;">${member.profiles?.email || ''}</p>
                                        </div>
                                        <div style="text-align: center; padding: 0 1rem;">
                                            <p style="color: #40E0D0; font-size: 0.75rem; text-transform: uppercase; font-weight: 600; margin-bottom: 0.25rem;">${member.role.replace('_', ' ')}</p>
                                            <p style="color: #9CA3AF; font-size: 0.875rem;">${member.involvement_percentage}% Involvement</p>
                                        </div>
                                    </div>
                                    <button onclick="handleRemoveTeamMember('${projectId}', '${member.id}')" style="padding: 0.5rem 1rem; background: transparent; color: #EF4444; border: 1px solid #EF4444; border-radius: 8px; cursor: pointer; font-size: 0.875rem; white-space: nowrap;" title="Remove from project">Remove</button>
                                </div>
                            `).join('')
                            : 
                            '<p style="color: #9CA3AF; text-align: center; padding: 2rem; background: #111827; border-radius: 12px; border: 1px dashed #4B5563;">No team members assigned yet</p>'
                        }
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error loading team management:', error);
        showNotification('Error loading team management: ' + error.message, 'error');
    }
}

// Handle add team member
window.handleAddTeamMember = async function(event, projectId) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('[type="submit"]');
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';
    
    try {
        const memberData = {
            project_id: projectId,
            user_id: formData.get('user_id'),
            role: formData.get('role'),
            involvement_percentage: parseInt(formData.get('involvement_percentage'))
        };
        
        const result = await addTeamMember(memberData);
        
        if (result.success) {
            showNotification('Team member added successfully!', 'success');
            // Close and reopen modal to refresh
            closeModal('manage-team-modal');
            setTimeout(() => showManageTeamModal(projectId), 300);
            // Reload projects list
            await loadAdminProjects();
        } else {
            throw new Error(result.error || 'Failed to add team member');
        }
        
    } catch (error) {
        console.error('Error adding team member:', error);
        showNotification('Error adding team member: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Member';
    }
};

// Handle remove team member
window.handleRemoveTeamMember = async function(projectId, memberId) {
    if (!confirm('Are you sure you want to remove this team member from the project?')) {
        return;
    }
    
    try {
        const result = await removeTeamMember(memberId);
        
        if (result.success) {
            showNotification('Team member removed successfully!', 'success');
            // Close and reopen modal to refresh
            closeModal('manage-team-modal');
            setTimeout(() => showManageTeamModal(projectId), 300);
            // Reload projects list
            await loadAdminProjects();
        } else {
            throw new Error(result.error || 'Failed to remove team member');
        }
        
    } catch (error) {
        console.error('Error removing team member:', error);
        showNotification('Error removing team member: ' + error.message, 'error');
    }
};

// Setup project filters
function setupProjectFilters() {
    const searchInput = document.getElementById('project-search');
    const statusFilter = document.getElementById('project-status-filter');
    const healthFilter = document.getElementById('project-health-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterProjects);
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', filterProjects);
    }
    
    if (healthFilter) {
        healthFilter.addEventListener('change', filterProjects);
    }
}

// Filter projects based on search and filters
function filterProjects() {
    const searchTerm = document.getElementById('project-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('project-status-filter')?.value || 'all';
    const healthFilter = document.getElementById('project-health-filter')?.value || 'all';
    
    const rows = document.querySelectorAll('#projects-table-view tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesSearch = text.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || text.includes(statusFilter);
        const matchesHealth = healthFilter === 'all' || row.querySelector(`[title="${healthFilter}"]`);
        
        row.style.display = (matchesSearch && matchesStatus && matchesHealth) ? '' : 'none';
    });
}

// Setup view toggle (grid/table)
function setupViewToggle() {
    window.switchProjectView = function(view) {
        const tableView = document.getElementById('projects-table-view');
        const gridView = document.getElementById('projects-grid-view');
        const buttons = document.querySelectorAll('.view-toggle-btn');
        
        if (view === 'grid') {
            if (tableView) tableView.style.display = 'none';
            if (gridView) gridView.style.display = 'block';
            buttons.forEach(btn => {
                if (btn.onclick.toString().includes('grid')) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        } else {
            if (tableView) tableView.style.display = 'block';
            if (gridView) gridView.style.display = 'none';
            buttons.forEach(btn => {
                if (btn.onclick.toString().includes('table')) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    };
}

// Show notification
function showNotification(message, type = 'info') {
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
}

// Export functions for use in other modules
export {
    loadAdminProjects,
    showCreateProjectModal,
    handleCreateProject
};
