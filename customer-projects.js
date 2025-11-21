// Customer Projects - Database Integration
// This file handles loading and displaying real projects from Supabase

import { getUserProjects, formatDate, getStatusColor, getMilestoneStatusIcon } from './projects.js';

let currentProjects = [];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    await loadProjects();
});

// Load projects from database
async function loadProjects() {
    try {
        showProjectsLoading();
        currentProjects = await getUserProjects();
        
        if (currentProjects.length === 0) {
            showNoProjects();
        } else {
            renderProjects(currentProjects);
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showProjectsError();
    }
}

// Show loading state
function showProjectsLoading() {
    const grid = document.querySelector('.projects-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; animation: spin 1s linear infinite;">⚙️</div>
                <p style="color: #9CA3AF;">Loading your projects...</p>
            </div>
        `;
    }
}

// Show when no projects exist
function showNoProjects() {
    const grid = document.querySelector('.projects-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">📋</div>
                <h3 style="color: #fff; margin-bottom: 0.5rem;">No Projects Yet</h3>
                <p style="color: #9CA3AF;">Your projects will appear here once they're created by the admin team.</p>
            </div>
        `;
    }
}

// Show error state
function showProjectsError() {
    const grid = document.querySelector('.projects-grid');
    if (grid) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
                <h3 style="color: #EF4444; margin-bottom: 0.5rem;">Error Loading Projects</h3>
                <p style="color: #9CA3AF; margin-bottom: 1rem;">There was a problem loading your projects.</p>
                <button onclick="location.reload()" style="padding: 0.75rem 1.5rem; background: linear-gradient(135deg, #40E0D0, #36B8A8); color: #111827; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Retry</button>
            </div>
        `;
    }
}

// Render all projects
function renderProjects(projects) {
    const grid = document.querySelector('.projects-grid');
    if (!grid) return;
    
    grid.innerHTML = projects.map(project => createProjectCard(project)).join('');
    
    // Add click handlers to cards
    projects.forEach(project => {
        const card = grid.querySelector(`[data-project-id="${project.id}"]`);
        if (card) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => showProjectDetails(project.id));
        }
    });
}

// Create HTML for a project card
function createProjectCard(project) {
    const statusColor = getStatusColor(project.status);
    const completedMilestones = project.project_milestones?.filter(m => m.status === 'completed').length || 0;
    const totalMilestones = project.project_milestones?.length || 0;
    const filesCount = project.project_files?.length || 0;
    const teamCount = project.project_team_members?.length || 0;
    
    return `
        <div class="project-card" data-project-id="${project.id}" style="background: #1F2937; padding: 1.5rem; border-radius: 12px; border: 1px solid #374151; transition: all 0.3s ease;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                    <span style="font-size: 2rem;">${project.icon || '💼'}</span>
                    <div>
                        <h4 style="color: #40E0D0; font-size: 1.125rem; margin-bottom: 0.25rem;">${project.name}</h4>
                        <p style="color: #9CA3AF; font-size: 0.875rem;">${project.project_type || 'Project'}</p>
                    </div>
                </div>
                <span style="background: ${statusColor}; color: #fff; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;">${project.status.replace('-', ' ')}</span>
            </div>
            
            ${project.description ? `<p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 1rem; line-height: 1.4;">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>` : ''}
            
            <div style="margin-bottom: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <span style="color: #9CA3AF; font-size: 0.875rem;">Progress</span>
                    <span style="color: #40E0D0; font-weight: 600;">${project.progress || 0}%</span>
                </div>
                <div style="width: 100%; height: 8px; background: #111827; border-radius: 4px; overflow: hidden;">
                    <div style="width: ${project.progress || 0}%; height: 100%; background: linear-gradient(90deg, #40E0D0, #36B8A8); transition: width 0.3s ease;"></div>
                </div>
            </div>
            
            <div style="display: flex; gap: 1rem; padding-top: 1rem; border-top: 1px solid #374151; font-size: 0.875rem; color: #9CA3AF;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>✓</span>
                    <span>${completedMilestones}/${totalMilestones} Milestones</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>📄</span>
                    <span>${filesCount} Files</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>👥</span>
                    <span>${teamCount} Team</span>
                </div>
            </div>
        </div>
    `;
}

// Show project details
function showProjectDetails(projectId) {
    const project = currentProjects.find(p => p.id === projectId);
    if (!project) return;
    
    const grid = document.querySelector('.projects-grid');
    const detailsView = document.getElementById('project-details-view');
    
    if (grid) grid.style.display = 'none';
    if (detailsView) {
        detailsView.style.display = 'block';
        renderProjectDetails(detailsView, project);
    }
}

// Render project details view
function renderProjectDetails(container, project) {
    const statusColor = getStatusColor(project.status);
    
    container.innerHTML = `
        <div style="max-width: 1200px; margin: 0 auto;">
            <!-- Back Button -->
            <button onclick="hideProjectDetailsCustom()" style="display: flex; align-items: center; gap: 0.5rem; background: transparent; border: none; color: #40E0D0; padding: 0.5rem 0; margin-bottom: 1.5rem; cursor: pointer; font-size: 1rem;">
                <span>←</span>
                <span>Back to Projects</span>
            </button>
            
            <!-- Project Header -->
            <div style="background: #1F2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span style="font-size: 3rem;">${project.icon || '💼'}</span>
                        <div>
                            <h2 style="color: #40E0D0; font-size: 2rem; margin-bottom: 0.5rem;">${project.name}</h2>
                            <p style="color: #9CA3AF;">${project.project_type || 'Project'}</p>
                        </div>
                    </div>
                    <span style="background: ${statusColor}; color: #fff; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; text-transform: uppercase;">${project.status.replace('-', ' ')}</span>
                </div>
                
                ${project.description ? `<p style="color: #9CA3AF; line-height: 1.6; margin-bottom: 1.5rem;">${project.description}</p>` : ''}
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                    ${project.start_date ? `
                        <div>
                            <p style="color: #6B7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Start Date</p>
                            <p style="color: #fff; font-weight: 600;">${formatDate(project.start_date)}</p>
                        </div>
                    ` : ''}
                    ${project.estimated_completion ? `
                        <div>
                            <p style="color: #6B7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Est. Completion</p>
                            <p style="color: #fff; font-weight: 600;">${formatDate(project.estimated_completion)}</p>
                        </div>
                    ` : ''}
                    ${project.budget ? `
                        <div>
                            <p style="color: #6B7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Budget</p>
                            <p style="color: #fff; font-weight: 600;">$${parseFloat(project.budget).toLocaleString()}</p>
                        </div>
                    ` : ''}
                    <div>
                        <p style="color: #6B7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Progress</p>
                        <p style="color: #40E0D0; font-weight: 600; font-size: 1.25rem;">${project.progress || 0}%</p>
                    </div>
                </div>
            </div>
            
            <!-- Milestones -->
            <div style="background: #1F2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151; margin-bottom: 1.5rem;">
                <h3 style="color: #fff; font-size: 1.5rem; margin-bottom: 1.5rem;">📋 Milestones</h3>
                ${project.project_milestones && project.project_milestones.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 1rem;">
                        ${project.project_milestones.map(milestone => `
                            <div style="background: #111827; padding: 1.5rem; border-radius: 8px; border: 1px solid #374151;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.75rem;">
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                            <span style="font-size: 1.5rem;">${getMilestoneStatusIcon(milestone.status)}</span>
                                            <h4 style="color: #fff; font-size: 1.125rem;">${milestone.name}</h4>
                                        </div>
                                        ${milestone.description ? `<p style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 0.75rem;">${milestone.description}</p>` : ''}
                                    </div>
                                    <span style="background: ${milestone.status === 'completed' ? '#10B981' : milestone.status === 'in-progress' ? '#40E0D0' : '#6B7280'}; color: #fff; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; white-space: nowrap;">${milestone.status.replace('-', ' ')}</span>
                                </div>
                                <div style="display: flex; gap: 2rem; font-size: 0.875rem; color: #9CA3AF;">
                                    ${milestone.due_date ? `<span>📅 Due: ${formatDate(milestone.due_date)}</span>` : ''}
                                    ${milestone.completed_at ? `<span>✓ Completed: ${formatDate(milestone.completed_at)}</span>` : ''}
                                    <span>Progress: ${milestone.progress || 0}%</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p style="color: #9CA3AF; text-align: center; padding: 2rem;">No milestones yet</p>'}
            </div>
            
            <!-- Files -->
            ${project.project_files && project.project_files.length > 0 ? `
                <div style="background: #1F2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151; margin-bottom: 1.5rem;">
                    <h3 style="color: #fff; font-size: 1.5rem; margin-bottom: 1.5rem;">📁 Project Files</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                        ${project.project_files.map(file => `
                            <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #374151;">
                                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
                                    <span style="font-size: 1.5rem;">📄</span>
                                    <div style="flex: 1; min-width: 0;">
                                        <p style="color: #fff; font-weight: 600; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${file.name}</p>
                                        ${file.file_size ? `<p style="color: #6B7280; font-size: 0.75rem;">${(file.file_size / 1024).toFixed(2)} KB</p>` : ''}
                                    </div>
                                </div>
                                ${file.file_url ? `
                                    <a href="${file.file_url}" target="_blank" style="display: block; text-align: center; padding: 0.5rem; background: #40E0D0; color: #111827; border-radius: 6px; text-decoration: none; font-size: 0.875rem; font-weight: 600;">Download</a>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Team -->
            ${project.project_team_members && project.project_team_members.length > 0 ? `
                <div style="background: #1F2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151;">
                    <h3 style="color: #fff; font-size: 1.5rem; margin-bottom: 1.5rem;">👥 Team Members</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                        ${project.project_team_members.map(member => `
                            <div style="background: #111827; padding: 1rem; border-radius: 8px; border: 1px solid #374151; display: flex; align-items: center; gap: 0.75rem;">
                                <div style="width: 40px; height: 40px; background: linear-gradient(135deg, #40E0D0, #36B8A8); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #111827; font-weight: 800; font-size: 1.125rem;">
                                    ${member.profiles?.full_name?.charAt(0) || '?'}
                                </div>
                                <div style="flex: 1; min-width: 0;">
                                    <p style="color: #fff; font-weight: 600; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${member.profiles?.full_name || 'Unknown'}</p>
                                    <p style="color: #40E0D0; font-size: 0.75rem; text-transform: capitalize;">${member.role || 'Team Member'}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

// Hide project details and show grid
window.hideProjectDetailsCustom = function() {
    const grid = document.querySelector('.projects-grid');
    const detailsView = document.getElementById('project-details-view');
    
    if (grid) grid.style.display = 'grid';
    if (detailsView) detailsView.style.display = 'none';
};

// Export for use in other scripts if needed
window.reloadProjects = loadProjects;

// Add hover effect styles
const style = document.createElement('style');
style.textContent = `
    .project-card:hover {
        border-color: #40E0D0 !important;
        transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(64, 224, 208, 0.2);
    }
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
