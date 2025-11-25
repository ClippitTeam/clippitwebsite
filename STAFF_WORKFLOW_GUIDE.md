# Staff Workflow Guide

## Overview
This guide explains how staff members (developers, designers, etc.) work within the Clippit system.

## Staff Onboarding Process

### 1. Admin Creates Staff Account
**Option A: Direct Database Creation (Current)**
- Admin manually creates a profile in the database with `role = 'staff'`
- Staff member receives login credentials
- Staff can immediately log in

**Option B: Staff Invitation System (Recommended - To Implement)**
- Admin sends invitation email to staff member
- Staff clicks link and sets up their account
- Similar to customer invite but with `role = 'staff'`

### 2. Staff Login
Staff members use the same login page as everyone else:
- URL: `/login.html`
- Enter email and password
- System redirects based on role:
  - Admin → Admin Dashboard
  - Staff → Staff Dashboard (needs to be created)
  - Customer → Customer Dashboard

### 3. Staff Dashboard (Needs Implementation)
Staff members need a dedicated dashboard showing:
- **My Projects**: All projects they're assigned to
- **My Tasks**: Tasks/tickets assigned to them
- **Project Details**: Access to project files, milestones, updates
- **Time Tracking**: Log hours worked
- **Communication**: Comment on tickets, updates

## Current System Flow

### How It Works Now:

1. **Admin creates staff profile** (in Supabase dashboard or via SQL):
```sql
INSERT INTO profiles (id, email, role, full_name)
VALUES (
  'staff-uuid-here',
  'developer@example.com',
  'staff',
  'John Developer'
);
```

2. **Staff creates Supabase auth account**:
- Staff goes to login page
- Clicks "Sign Up"
- Creates account with their email
- Now they can log in

3. **Admin assigns staff to projects**:
- Go to Admin Dashboard → Projects
- Click on a project
- Use "Manage Team" to add staff member
- Select their role (Developer, Designer, etc.)
- Set involvement percentage

4. **Staff views their projects**:
- Currently: Staff needs a dedicated dashboard
- Can see projects via the team_members table

## What Needs to Be Implemented

### Priority 1: Staff Dashboard
Create `staff-dashboard.html` and `staff-dashboard.js`:
- Show all projects the staff member is assigned to
- Display their role in each project
- Show upcoming deadlines
- List their assigned tasks/tickets

### Priority 2: Staff Invitation System
Similar to customer invite but for staff:
- Admin can invite staff via email
- Staff clicks link to set up account
- Automatically creates profile with `role = 'staff'`

### Priority 3: Task Assignment
- Tickets/tasks can be assigned to specific staff members
- Staff can update task status
- Staff can log time worked
- Staff can add comments/updates

## Database Structure

### Profiles Table
```sql
- id: UUID (matches Supabase auth.users.id)
- email: TEXT
- role: TEXT ('admin', 'customer', 'staff')
- full_name: TEXT
- company: TEXT (optional)
```

### Team Members Table
```sql
- id: UUID
- project_id: UUID (foreign key to projects)
- user_id: UUID (foreign key to profiles)
- role: TEXT ('developer', 'designer', 'project_manager', 'qa_tester')
- involvement_percentage: INTEGER
```

## Example Workflow

### Scenario: Hiring a New Developer

1. **Admin invites developer**:
   - Go to Admin Dashboard → Team
   - Click "Invite Staff Member"
   - Enter email: developer@example.com
   - Select role: Developer
   - Send invitation

2. **Developer receives email**:
   - Click invitation link
   - Set up account (name, password)
   - Profile automatically created with `role = 'staff'`

3. **Developer logs in**:
   - Goes to login.html
   - Enters credentials
   - Redirected to Staff Dashboard

4. **Admin assigns to project**:
   - Admin opens project
   - Clicks "Manage Team"
   - Adds developer with role and involvement %

5. **Developer sees project**:
   - Project appears in their Staff Dashboard
   - Can view project details, files, milestones
   - Can see tasks assigned to them
   - Can update progress and log time

## Temporary Workaround (Until Staff Dashboard Built)

### For Staff to See Their Projects:
1. Staff logs in
2. They currently see the regular dashboard
3. Need to manually query or build a temporary interface

### SQL Query for Staff to See Their Projects:
```sql
SELECT 
  p.*,
  tm.role as my_role,
  tm.involvement_percentage
FROM projects p
JOIN team_members tm ON tm.project_id = p.id
WHERE tm.user_id = auth.uid();
```

## Next Steps

1. **Build Staff Dashboard** (Highest Priority)
   - File: `staff-dashboard.html` + `staff-dashboard.js`
   - Show assigned projects
   - Show tasks/tickets
   - Time tracking interface

2. **Implement Staff Invite Function**
   - Edge Function: `send-staff-invite`
   - Email template for staff invitation
   - Registration flow with role = 'staff'

3. **Update Login Routing**
   - Detect user role after login
   - Redirect to appropriate dashboard:
     - `admin-dashboard.html` for admin
     - `staff-dashboard.html` for staff
     - `customer-dashboard.html` for customer

4. **Build Ticket System**
   - Allow task assignment to staff
   - Track status and time
   - Communication between team

## Questions?

The current system has:
✅ Project assignment to staff
✅ Staff profiles with roles
✅ Team member management

What's missing:
❌ Staff dashboard
❌ Staff invitation system
❌ Automatic role-based routing
❌ Ticket/task management interface

Would you like me to:
1. Build the staff dashboard first?
2. Create the staff invitation system?
3. Or implement the ticket tracking system?
