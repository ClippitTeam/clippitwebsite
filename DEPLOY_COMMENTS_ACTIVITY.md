# Comments & Activity Feed System - Deployment Guide

## Overview
This guide covers deploying the comprehensive Comments & Activity Feed system with @mentions support.

## Features
- ✅ Comments on projects, tickets, tasks, and invoices
- ✅ Threaded replies
- ✅ Edit and delete comments
- ✅ @mentions with auto-complete
- ✅ Activity timeline tracking all changes
- ✅ Real-time notifications for mentions
- ✅ Role-based access control

## Deployment Steps

### 1. Apply Database Migration

Run the following migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/20251126_create_activity_comments_schema.sql
```

This creates:
- `comments` table for all comments
- `activity_log` table for tracking changes
- `mentions` table for @mentions
- RLS policies for secure access
- Helper functions and triggers

### 2. Verify Tables

Check that these tables were created:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('comments', 'activity_log', 'mentions');
```

### 3. Deploy JavaScript File

Upload `comments-activity.js` to your web hosting alongside other JS files.

### 4. Integrate with Dashboards

Add the script reference to your HTML files:

```html
<!-- In customer-dashboard.html, admin-dashboard.html, staff-dashboard.html -->
<script src="comments-activity.js"></script>
```

Place this **after** your other scripts but **before** the dashboard-specific scripts.

### 5. Add Comments Section to Pages

To add comments to any page, use this function:

```javascript
// Example: Add comments to a project details page
renderCommentsSection('project', projectId, 'comments-container');
```

Where:
- First parameter: entity type ('project', 'ticket', 'task', or 'invoice')
- Second parameter: entity ID (UUID)
- Third parameter: container element ID

### 6. HTML Container Example

Add this to your HTML where you want comments to appear:

```html
<div id="comments-container" style="margin-top: 2rem;">
    <!-- Comments section will render here -->
</div>
```

## Usage Examples

### In Project Details Modal

```javascript
function showProjectDetails(projectId) {
    // ... existing modal code ...
    
    // Add comments section
    renderCommentsSection('project', projectId, 'project-comments-container');
}
```

### In Ticket Details

```javascript
function viewTicketDetails(ticketId) {
    // ... existing modal code ...
    
    // Add comments section
    renderCommentsSection('ticket', ticketId, 'ticket-comments-container');
}
```

### Logging Activity Manually

Use the `logActivity` function to track custom actions:

```javascript
// Example: Log when a project status changes
await logActivity(
    'project',                    // entity type
    projectId,                    // entity ID
    'status_changed',            // action
    'Changed project status',     // description
    {                            // changes object (optional)
        status: {
            from: 'in-progress',
            to: 'completed'
        }
    }
);
```

## Features Guide

### Comments
- **Add Comments**: Type in the text area and click "Post Comment"
- **Reply**: Click "Reply" button on any comment
- **Edit**: Click "Edit" on your own comments
- **Delete**: Click "Delete" on your own comments (admins can delete any)

### @Mentions
- Type `@` followed by a name to see suggestions
- Click a suggestion to insert the mention
- Mentioned users receive notifications automatically

### Activity Timeline
- Click "Activity" tab to see timeline
- Shows all changes with before/after values
- Color-coded by action type
- Includes timestamps and user names

## Activity Actions

The system tracks these actions automatically:
- `created` - Entity created
- `updated` - Entity updated
- `deleted` - Entity deleted
- `assigned` - User assigned
- `status_changed` - Status changed
- `priority_changed` - Priority changed
- `commented` - Comment added
- `attached_file` - File attached
- `completed` - Task completed

## Permissions

### Comments
- **Customers**: Can comment on their own projects/tickets/tasks
- **Staff**: Can comment on anything
- **Admin**: Can comment on anything, delete any comment

### Activity Log
- **Customers**: Can view activity on their entities
- **Staff**: Can view all activity
- **Admin**: Can view all activity

### Mentions
- All authenticated users can mention team members
- Mentioned users receive notifications regardless of role

## Testing

### Test Comments
1. Create a test project/ticket
2. Add comments as different users
3. Try editing and deleting
4. Test threaded replies

### Test @Mentions
1. Type `@` in a comment
2. Verify autocomplete appears
3. Select a user
4. Post comment
5. Verify mentioned user receives notification

### Test Activity Log
1. Make changes to an entity (status, assignment, etc.)
2. Switch to Activity tab
3. Verify activity is logged
4. Check before/after values display correctly

## Troubleshooting

### Comments Not Loading
- Check browser console for errors
- Verify migration was applied successfully
- Ensure user is authenticated
- Check RLS policies are enabled

### Mentions Not Working
- Verify team members are loaded (check console)
- Ensure profiles table has data
- Check notifications table exists

### Activity Not Logging
- Verify `get_entity_activity` function exists
- Check user has permission to view activity
- Ensure activity_log table has INSERT permission

## Database Functions

### Get Comment Count
```sql
SELECT get_comment_count('project', 'project-id-here');
```

### Get Entity Activity
```sql
SELECT * FROM get_entity_activity('project', 'project-id-here', 50);
```

## Integration Points

The comments system integrates with:
- **Notifications**: Automatic notifications for @mentions
- **Projects**: Comment on projects
- **Tickets**: Comment on tickets  
- **Tasks**: Comment on tasks
- **Invoices**: Comment on invoices

## Security Notes

- All data protected by Row Level Security (RLS)
- Users can only see comments on entities they have access to
- Users can only edit/delete their own comments (except admins)
- Activity log is immutable (no updates/deletes)
- Mentions trigger notifications automatically

## Performance Optimization

- Comments are paginated (load top-level first, then replies)
- Activity log limited to 50 most recent entries
- Indexes on all foreign keys
- Cached user names to reduce joins

## Future Enhancements

Possible additions:
- Rich text formatting
- File attachments in comments
- Reactions/likes
- Mark comments as resolved
- Email notifications for mentions
- Comment search

## Support

For issues or questions:
1. Check browser console for errors
2. Verify database migration applied
3. Test with simple entity first
4. Review RLS policies

## Completion Checklist

- [ ] Database migration applied
- [ ] Tables created and verified
- [ ] comments-activity.js deployed
- [ ] Script added to dashboards
- [ ] Comments section rendered
- [ ] @mentions working
- [ ] Activity log displaying
- [ ] Notifications received
- [ ] Tested as different roles
- [ ] All permissions working

## Status
✅ Ready for deployment
