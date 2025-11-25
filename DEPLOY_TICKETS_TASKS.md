# Deploy Tickets & Tasks System Backend

## Overview
This guide will help you deploy the ticket and task management system backend to your Supabase project.

## Prerequisites
- Supabase CLI installed
- Supabase project linked locally
- Admin access to Supabase dashboard

## Step 1: Apply Database Migration

```bash
# Navigate to your project directory
cd "c:/Users/Float/Videos/clippit take two/clippitwebsite"

# Apply the migration
supabase db push
```

This will create the following tables:
- `tickets` - Support/help desk tickets
- `tasks` - Project management tasks
- `ticket_comments` - Comments on tickets
- `task_comments` - Comments on tasks
- `time_logs` - Time tracking entries

## Step 2: Verify Tables in Supabase Dashboard

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to **Table Editor**
3. Verify these tables exist:
   - ✅ tickets
   - ✅ tasks
   - ✅ ticket_comments
   - ✅ task_comments
   - ✅ time_logs

## Step 3: Test Row Level Security

The migration includes comprehensive RLS policies:

### Tickets RLS:
- **Admins**: Can view, create, and update all tickets
- **Staff**: Can view assigned/created tickets, create tickets, update tickets
- **Customers**: Can view and create their own tickets

### Tasks RLS:
- **Admins**: Can view, create, and update all tasks
- **Staff**: Can view assigned/created tasks, create tasks, update assigned tasks

### Comments RLS:
- Users can view and add comments on tickets/tasks they have access to

### Time Logs RLS:
- **Admins**: Can view all time logs
- **Users**: Can view, create, and update their own time logs

## Step 4: Test the System

### Create a Test Ticket

```javascript
// In browser console (while logged in as admin/staff)
const { data, error } = await supabase
  .from('tickets')
  .insert({
    subject: 'Test Ticket',
    description: 'This is a test ticket',
    priority: 'medium',
    status: 'open',
    client_id: 'user-uuid-here', // Optional
    created_by: (await supabase.auth.getUser()).data.user.id
  })
  .select()
  .single();

console.log('Ticket created:', data);
```

### Create a Test Task

```javascript
// In browser console (while logged in as admin/staff)
const { data, error } = await supabase
  .from('tasks')
  .insert({
    title: 'Test Task',
    description: 'This is a test task',
    priority: 'medium',
    status: 'pending',
    due_date: '2025-12-31',
    created_by: (await supabase.auth.getUser()).data.user.id
  })
  .select()
  .single();

console.log('Task created:', data);
```

### Create a Time Log

```javascript
// In browser console (while logged in)
const { data, error } = await supabase
  .from('time_logs')
  .insert({
    hours: 2.5,
    description: 'Working on feature X',
    log_date: '2025-11-24',
    log_type: 'development',
    billable: true,
    user_id: (await supabase.auth.getUser()).data.user.id
  })
  .select()
  .single();

console.log('Time log created:', data);
```

## Features Implemented

### 🎫 Ticket System
- ✅ Auto-generated ticket numbers (TICK-1000, TICK-1001, etc.)
- ✅ Status tracking (open, in-progress, resolved, closed)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Assignment to staff members
- ✅ Ticket comments/conversations
- ✅ Client association
- ✅ Timestamps for creation, updates, resolution, closure

### ✅ Task System
- ✅ Task creation and assignment
- ✅ Status tracking (pending, in-progress, completed, cancelled)
- ✅ Priority levels (low, medium, high, urgent)
- ✅ Project association
- ✅ Due date tracking
- ✅ Estimated vs actual hours
- ✅ Billable tracking
- ✅ Task comments/discussions

### ⏱️ Time Tracking
- ✅ Log hours per project/task
- ✅ Track different work types (development, design, meeting, etc.)
- ✅ Billable vs non-billable hours
- ✅ Date-based logging
- ✅ Description of work performed

## Database Relationships

```
tickets
  ├── ticket_comments (one-to-many)
  ├── client_id → auth.users
  ├── assigned_to → auth.users
  └── created_by → auth.users

tasks
  ├── task_comments (one-to-many)
  ├── time_logs (one-to-many)
  ├── project_id → projects
  ├── assigned_to → auth.users
  └── created_by → auth.users

time_logs
  ├── user_id → auth.users
  ├── project_id → projects
  └── task_id → tasks
```

## API Examples

### Fetch User's Tasks

```javascript
const { data: tasks, error } = await supabase
  .from('tasks')
  .select(`
    *,
    project:projects(name),
    assigned_user:profiles!assigned_to(name),
    created_user:profiles!created_by(name)
  `)
  .eq('assigned_to', userId)
  .order('due_date', { ascending: true });
```

### Fetch Open Tickets

```javascript
const { data: tickets, error } = await supabase
  .from('tickets')
  .select(`
    *,
    client:profiles!client_id(name, email),
    assigned_user:profiles!assigned_to(name),
    comments:ticket_comments(count)
  `)
  .eq('status', 'open')
  .order('priority', { ascending: false })
  .order('created_at', { ascending: false });
```

### Log Time

```javascript
const { data, error } = await supabase
  .from('time_logs')
  .insert({
    user_id: userId,
    project_id: projectId,
    task_id: taskId, // optional
    hours: 2.5,
    description: 'Implemented new feature',
    log_date: '2025-11-24',
    log_type: 'development',
    billable: true
  });
```

## Troubleshooting

### Migration Errors
If you encounter errors during migration:

```bash
# Reset the database (WARNING: This will delete all data)
supabase db reset

# Or manually apply the migration
supabase db push --dry-run  # Preview changes
supabase db push            # Apply changes
```

### RLS Policy Issues
If users can't access data they should have access to:

1. Check user's role in profiles table
2. Verify policies in Supabase dashboard under **Authentication > Policies**
3. Test policies in SQL Editor:

```sql
-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub TO 'user-uuid-here';

SELECT * FROM tickets;
SELECT * FROM tasks;
```

### Permission Denied Errors
Common causes:
- User not authenticated
- User's role not set correctly in profiles table
- RLS policies blocking access

## Next Steps

1. ✅ Deploy migration to Supabase
2. ✅ Verify tables and policies
3. ✅ Test ticket/task creation
4. ✅ Update frontend JavaScript to use Supabase
5. ⏳ Test full workflow (admin creates ticket → staff responds → customer sees update)

## Support

For issues or questions:
- Check Supabase dashboard logs
- Review RLS policies
- Test SQL queries directly in SQL Editor
- Check browser console for JavaScript errors
