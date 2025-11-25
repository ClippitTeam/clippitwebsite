// Tickets & Tasks Management with Supabase Integration
// This module handles ticket and task operations with Supabase backend

// ==================== TICKETS ====================

// Fetch all tickets (admin view)
async function fetchAllTickets(filters = {}) {
    try {
        let query = supabase
            .from('tickets')
            .select(`
                *,
                client:profiles!client_id(name, email),
                assigned_user:profiles!assigned_to(name, email),
                created_user:profiles!created_by(name, email)
            `);
        
        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }
        
        // Order by priority and creation date
        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return { success: false, error: error.message };
    }
}

// Fetch user's tickets (customer/staff view)
async function fetchMyTickets() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('tickets')
            .select(`
                *,
                client:profiles!client_id(name, email),
                assigned_user:profiles!assigned_to(name, email),
                created_user:profiles!created_by(name, email)
            `)
            .or(`client_id.eq.${user.id},assigned_to.eq.${user.id},created_by.eq.${user.id}`)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching my tickets:', error);
        return { success: false, error: error.message };
    }
}

// Create a new ticket
async function createTicket(ticketData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('tickets')
            .insert({
                subject: ticketData.subject,
                description: ticketData.description,
                priority: ticketData.priority || 'medium',
                status: ticketData.status || 'open',
                category: ticketData.category,
                client_id: ticketData.client_id,
                assigned_to: ticketData.assigned_to,
                created_by: user.id
            })
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating ticket:', error);
        return { success: false, error: error.message };
    }
}

// Update ticket
async function updateTicket(ticketId, updates) {
    try {
        const { data, error } = await supabase
            .from('tickets')
            .update(updates)
            .eq('id', ticketId)
            .select()
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating ticket:', error);
        return { success: false, error: error.message };
    }
}

// Add comment to ticket
async function addTicketComment(ticketId, comment, isInternal = false) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('ticket_comments')
            .insert({
                ticket_id: ticketId,
                user_id: user.id,
                comment: comment,
                is_internal: isInternal
            })
            .select(`
                *,
                user:profiles(name, email)
            `)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error adding ticket comment:', error);
        return { success: false, error: error.message };
    }
}

// Fetch ticket comments
async function fetchTicketComments(ticketId) {
    try {
        const { data, error } = await supabase
            .from('ticket_comments')
            .select(`
                *,
                user:profiles(name, email, role)
            `)
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching ticket comments:', error);
        return { success: false, error: error.message };
    }
}

// ==================== TASKS ====================

// Fetch all tasks (admin view)
async function fetchAllTasks(filters = {}) {
    try {
        let query = supabase
            .from('tasks')
            .select(`
                *,
                project:projects(id, name),
                assigned_user:profiles!assigned_to(name, email),
                created_user:profiles!created_by(name, email)
            `);
        
        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }
        if (filters.priority) {
            query = query.eq('priority', filters.priority);
        }
        if (filters.project_id) {
            query = query.eq('project_id', filters.project_id);
        }
        if (filters.assigned_to) {
            query = query.eq('assigned_to', filters.assigned_to);
        }
        
        // Order by due date and priority
        query = query.order('due_date', { ascending: true, nullsFirst: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return { success: false, error: error.message };
    }
}

// Fetch user's tasks
async function fetchMyTasks() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('tasks')
            .select(`
                *,
                project:projects(id, name),
                assigned_user:profiles!assigned_to(name, email),
                created_user:profiles!created_by(name, email)
            `)
            .or(`assigned_to.eq.${user.id},created_by.eq.${user.id}`)
            .order('due_date', { ascending: true, nullsFirst: false });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching my tasks:', error);
        return { success: false, error: error.message };
    }
}

// Create a new task
async function createTask(taskData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title: taskData.title,
                description: taskData.description,
                priority: taskData.priority || 'medium',
                status: taskData.status || 'pending',
                project_id: taskData.project_id,
                assigned_to: taskData.assigned_to,
                due_date: taskData.due_date,
                billable: taskData.billable !== false,
                estimated_hours: taskData.estimated_hours,
                created_by: user.id
            })
            .select(`
                *,
                project:projects(id, name),
                assigned_user:profiles!assigned_to(name, email)
            `)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error creating task:', error);
        return { success: false, error: error.message };
    }
}

// Update task
async function updateTask(taskId, updates) {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', taskId)
            .select(`
                *,
                project:projects(id, name),
                assigned_user:profiles!assigned_to(name, email)
            `)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating task:', error);
        return { success: false, error: error.message };
    }
}

// Add comment to task
async function addTaskComment(taskId, comment) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('task_comments')
            .insert({
                task_id: taskId,
                user_id: user.id,
                comment: comment
            })
            .select(`
                *,
                user:profiles(name, email)
            `)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error adding task comment:', error);
        return { success: false, error: error.message };
    }
}

// Fetch task comments
async function fetchTaskComments(taskId) {
    try {
        const { data, error } = await supabase
            .from('task_comments')
            .select(`
                *,
                user:profiles(name, email, role)
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching task comments:', error);
        return { success: false, error: error.message };
    }
}

// ==================== TIME LOGS ====================

// Log time entry
async function logTime(timeData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        const { data, error } = await supabase
            .from('time_logs')
            .insert({
                user_id: user.id,
                project_id: timeData.project_id,
                task_id: timeData.task_id,
                hours: timeData.hours,
                description: timeData.description,
                log_date: timeData.log_date || new Date().toISOString().split('T')[0],
                log_type: timeData.log_type || 'development',
                billable: timeData.billable !== false
            })
            .select(`
                *,
                project:projects(id, name),
                task:tasks(id, title),
                user:profiles(name, email)
            `)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error logging time:', error);
        return { success: false, error: error.message };
    }
}

// Fetch time logs
async function fetchTimeLogs(filters = {}) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');
        
        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        let query = supabase
            .from('time_logs')
            .select(`
                *,
                project:projects(id, name),
                task:tasks(id, title),
                user:profiles(name, email)
            `);
        
        // If not admin, only show own time logs
        if (profile?.role !== 'admin') {
            query = query.eq('user_id', user.id);
        }
        
        // Apply filters
        if (filters.project_id) {
            query = query.eq('project_id', filters.project_id);
        }
        if (filters.user_id) {
            query = query.eq('user_id', filters.user_id);
        }
        if (filters.start_date) {
            query = query.gte('log_date', filters.start_date);
        }
        if (filters.end_date) {
            query = query.lte('log_date', filters.end_date);
        }
        
        query = query.order('log_date', { ascending: false });
        
        const { data, error } = await query;
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching time logs:', error);
        return { success: false, error: error.message };
    }
}

// Update time log
async function updateTimeLog(timeLogId, updates) {
    try {
        const { data, error } = await supabase
            .from('time_logs')
            .update(updates)
            .eq('id', timeLogId)
            .select(`
                *,
                project:projects(id, name),
                task:tasks(id, title),
                user:profiles(name, email)
            `)
            .single();
        
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        console.error('Error updating time log:', error);
        return { success: false, error: error.message };
    }
}

// Delete time log
async function deleteTimeLog(timeLogId) {
    try {
        const { error } = await supabase
            .from('time_logs')
            .delete()
            .eq('id', timeLogId);
        
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Error deleting time log:', error);
        return { success: false, error: error.message };
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Get ticket statistics
async function getTicketStats() {
    try {
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('status, priority');
        
        if (error) throw error;
        
        const stats = {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in-progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            urgent: tickets.filter(t => t.priority === 'urgent').length,
            high: tickets.filter(t => t.priority === 'high').length
        };
        
        return { success: true, data: stats };
    } catch (error) {
        console.error('Error getting ticket stats:', error);
        return { success: false, error: error.message };
    }
}

// Get task statistics
async function getTaskStats() {
    try {
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('status, priority');
        
        if (error) throw error;
        
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === 'pending').length,
            inProgress: tasks.filter(t => t.status === 'in-progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            cancelled: tasks.filter(t => t.status === 'cancelled').length,
            urgent: tasks.filter(t => t.priority === 'urgent').length,
            high: tasks.filter(t => t.priority === 'high').length
        };
        
        return { success: true, data: stats };
    } catch (error) {
        console.error('Error getting task stats:', error);
        return { success: false, error: error.message };
    }
}

// Get time tracking summary
async function getTimeTrackingSummary(userId = null, startDate = null, endDate = null) {
    try {
        let query = supabase
            .from('time_logs')
            .select('hours, billable, log_type');
        
        if (userId) {
            query = query.eq('user_id', userId);
        }
        if (startDate) {
            query = query.gte('log_date', startDate);
        }
        if (endDate) {
            query = query.lte('log_date', endDate);
        }
        
        const { data: logs, error } = await query;
        
        if (error) throw error;
        
        const summary = {
            totalHours: logs.reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0),
            billableHours: logs.filter(log => log.billable).reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0),
            nonBillableHours: logs.filter(log => !log.billable).reduce((sum, log) => sum + (parseFloat(log.hours) || 0), 0),
            byType: {}
        };
        
        // Group by type
        logs.forEach(log => {
            const type = log.log_type || 'other';
            if (!summary.byType[type]) {
                summary.byType[type] = 0;
            }
            summary.byType[type] += parseFloat(log.hours) || 0;
        });
        
        return { success: true, data: summary };
    } catch (error) {
        console.error('Error getting time tracking summary:', error);
        return { success: false, error: error.message };
    }
}
