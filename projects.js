// Projects Helper Functions - Supabase Integration
// This file provides functions to interact with the projects database

// Get supabase from window object (loaded via supabase-config.js)
const supabase = window.supabase;

/**
 * Get all projects for the current logged-in user (customer view)
 * @returns {Promise<Array>} Array of projects with related data
 */
export async function getUserProjects() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('No authenticated user');
        }

        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                project_milestones (
                    id,
                    name,
                    description,
                    status,
                    progress,
                    due_date,
                    completed_at,
                    order_index
                ),
                project_files (
                    id,
                    name,
                    file_type,
                    file_size,
                    file_url,
                    description,
                    uploaded_at
                ),
                project_team_members (
                    role,
                    profiles:user_id (
                        full_name,
                        email
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Sort milestones by order_index
        if (data) {
            data.forEach(project => {
                if (project.project_milestones) {
                    project.project_milestones.sort((a, b) => a.order_index - b.order_index);
                }
            });
        }

        return data || [];
    } catch (error) {
        console.error('Error fetching user projects:', error);
        return [];
    }
}

/**
 * Get a single project by ID with all related data
 * @param {string} projectId - The project ID
 * @returns {Promise<Object|null>} Project object or null
 */
export async function getProjectById(projectId) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                project_milestones (
                    id,
                    name,
                    description,
                    status,
                    progress,
                    due_date,
                    completed_at,
                    order_index
                ),
                project_files (
                    id,
                    name,
                    file_type,
                    file_size,
                    file_url,
                    description,
                    uploaded_at
                ),
                project_team_members (
                    role,
                    profiles:user_id (
                        full_name,
                        email
                    )
                ),
                project_updates (
                    id,
                    update_type,
                    message,
                    created_at,
                    profiles:user_id (
                        full_name
                    )
                )
            `)
            .eq('id', projectId)
            .single();

        if (error) throw error;

        // Sort milestones and updates
        if (data) {
            if (data.project_milestones) {
                data.project_milestones.sort((a, b) => a.order_index - b.order_index);
            }
            if (data.project_updates) {
                data.project_updates.sort((a, b) => 
                    new Date(b.created_at) - new Date(a.created_at)
                );
            }
        }

        return data;
    } catch (error) {
        console.error('Error fetching project:', error);
        return null;
    }
}

/**
 * Get all projects (admin view)
 * @returns {Promise<Array>} Array of all projects
 */
export async function getAllProjects() {
    try {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                profiles:client_id (
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching all projects:', error);
        return [];
    }
}

/**
 * Create a new project (admin only)
 * @param {Object} projectData - Project data
 * @returns {Promise<Object|null>} Created project or null
 */
export async function createProject(projectData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
            .from('projects')
            .insert([{
                ...projectData,
                created_by: user.id
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
}

/**
 * Update a project (admin only)
 * @param {string} projectId - Project ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated project or null
 */
export async function updateProject(projectId, updates) {
    try {
        const { data, error } = await supabase
            .from('projects')
            .update(updates)
            .eq('id', projectId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating project:', error);
        throw error;
    }
}

/**
 * Delete a project (admin only)
 * @param {string} projectId - Project ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteProject(projectId) {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error deleting project:', error);
        return false;
    }
}

/**
 * Add a milestone to a project (admin/team only)
 * @param {string} projectId - Project ID
 * @param {Object} milestoneData - Milestone data
 * @returns {Promise<Object|null>} Created milestone or null
 */
export async function addMilestone(projectId, milestoneData) {
    try {
        const { data, error } = await supabase
            .from('project_milestones')
            .insert([{
                project_id: projectId,
                ...milestoneData
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding milestone:', error);
        throw error;
    }
}

/**
 * Update a milestone (admin/team only)
 * @param {string} milestoneId - Milestone ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated milestone or null
 */
export async function updateMilestone(milestoneId, updates) {
    try {
        const { data, error } = await supabase
            .from('project_milestones')
            .update(updates)
            .eq('id', milestoneId)
            .select()
            .single();

        if (error) throw error;
        
        // If milestone completed, create an update
        if (updates.status === 'completed' && data) {
            await createProjectUpdate(data.project_id, {
                update_type: 'milestone_completed',
                message: `Milestone "${data.name}" completed`
            });
        }
        
        return data;
    } catch (error) {
        console.error('Error updating milestone:', error);
        throw error;
    }
}

/**
 * Add a file to a project (admin/team only)
 * @param {string} projectId - Project ID
 * @param {Object} fileData - File data
 * @returns {Promise<Object|null>} Created file record or null
 */
export async function addProjectFile(projectId, fileData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
            .from('project_files')
            .insert([{
                project_id: projectId,
                uploaded_by: user.id,
                ...fileData
            }])
            .select()
            .single();

        if (error) throw error;
        
        // Create an update
        await createProjectUpdate(projectId, {
            update_type: 'file_uploaded',
            message: `File "${fileData.name}" uploaded`
        });
        
        return data;
    } catch (error) {
        console.error('Error adding project file:', error);
        throw error;
    }
}

/**
 * Add a team member to a project (admin only)
 * @param {string} projectId - Project ID
 * @param {string} userId - User ID
 * @param {string} role - Team member role
 * @returns {Promise<Object|null>} Created team member record or null
 */
export async function addTeamMember(projectId, userId, role) {
    try {
        const { data, error } = await supabase
            .from('project_team_members')
            .insert([{
                project_id: projectId,
                user_id: userId,
                role: role
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding team member:', error);
        throw error;
    }
}

/**
 * Create a project update/activity (admin/team only)
 * @param {string} projectId - Project ID
 * @param {Object} updateData - Update data
 * @returns {Promise<Object|null>} Created update or null
 */
export async function createProjectUpdate(projectId, updateData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
            .from('project_updates')
            .insert([{
                project_id: projectId,
                user_id: user.id,
                ...updateData
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating project update:', error);
        return null;
    }
}

/**
 * Get all customers (for admin project assignment)
 * @returns {Promise<Array>} Array of customer profiles
 */
export async function getCustomers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'customer')
            .order('full_name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }
}

/**
 * Get all team members (for project assignment)
 * @returns {Promise<Array>} Array of team member profiles
 */
export async function getTeamMembers() {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'team')
            .order('full_name');

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching team members:', error);
        return [];
    }
}

// Helper function to format dates
export function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Helper function to get status badge color
export function getStatusColor(status) {
    const colors = {
        'planning': '#9CA3AF',
        'in-progress': '#40E0D0',
        'review': '#FBB624',
        'completed': '#10B981',
        'on-hold': '#EF4444'
    };
    return colors[status] || '#9CA3AF';
}

// Helper function to get milestone status icon
export function getMilestoneStatusIcon(status) {
    const icons = {
        'pending': '⏳',
        'in-progress': '⚡',
        'completed': '✓'
    };
    return icons[status] || '⏳';
}
