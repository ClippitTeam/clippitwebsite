# Admin Workflow Guide: Creating Customers and Projects

## Complete Workflow Overview

The admin workflow for onboarding a new customer and creating their project follows these steps:

1. **Create Customer Account**
2. **Create Project and Assign to Customer**
3. **Send Invitation Email to Customer**

---

## Step 1: Create Customer Account

### Option A: Invite Customer (Creates account + sends email)

1. In the admin dashboard header, click the **"👤 Invite Customer"** button
2. This opens the `showAddClientModal()` function
3. Fill in the form:
   - Customer's full name
   - Customer's email address
   - Initial password (optional - will be generated if not provided)
   - Company name (optional)
4. Click **"Send Invitation"**

**What happens:**
- Creates a new user account in Supabase Auth with role='customer'
- Creates a profile record in the `profiles` table
- Sends a password reset/welcome email to the customer
- Customer can now log in with their email and set their password

### Option B: Manual Customer Creation (via Supabase)

If you need to create a customer manually:
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Invite User" or "Add User"
3. Enter their email
4. Go to Supabase Dashboard → Table Editor → profiles
5. Ensure their profile has `role = 'customer'`

---

## Step 2: Create Project and Assign to Customer

### Creating a Project

1. Navigate to the **Projects** section in the admin dashboard
2. Click **"+ Create Project"** button (top right)
3. This opens the **Create New Project** modal

### Fill in Project Details:

**Required Fields:**
- **Project Title**: Name of the project (e.g., "E-Commerce Website")
- **Description**: Detailed description of what needs to be built
- **Client**: Select the customer from the dropdown (shows all customers)
- **Project Type**: Choose from:
  - Website
  - Mobile App
  - Web Application
  - E-Commerce
  - Design
  - Consulting
  - Maintenance
  - Other
- **Start Date**: When the project begins
- **Due Date**: Project deadline

**Optional Fields:**
- **Budget**: Project budget amount
- **Icon**: Emoji to represent the project (defaults to 💼)

### Submit and Create

4. Click **"Create Project"**
5. The project is created with:
   - Status: `planning`
   - Health: `excellent`
   - Progress: `0%`
   - Linked to the selected customer's ID

**Important Notes:**
- The `customer_id` in the projects table links the project to the customer
- The customer will see this project in their dashboard once they log in
- The project appears immediately in the admin's project list

---

## Step 3: Customer Accesses Their Dashboard

### After Project Creation

Once the project is created and assigned:

1. **Customer receives invitation email** (if sent via "Invite Customer")
2. **Customer clicks the link** in the email
3. **Customer sets/resets their password**
4. **Customer logs in** at `login.html` → Customer Login
5. **Customer is redirected** to `customer-dashboard.html`
6. **Customer sees their project** automatically loaded on their dashboard

### Customer Dashboard Features

The customer can now:
- View project details, milestones, and progress
- See team members assigned to their project
- Upload files and documents
- Create support tickets
- Communicate with the team
- Track invoices and payments
- View project timeline and calendar

---

## Database Schema Flow

```
Admin Creates Customer:
┌─────────────────────┐
│  profiles table     │
├─────────────────────┤
│ id (UUID)           │
│ email               │
│ full_name           │
│ role = 'customer'   │ ← Created here
│ created_at          │
└─────────────────────┘
           │
           │ Customer ID is generated
           ↓
Admin Creates Project:
┌─────────────────────┐
│  projects table     │
├─────────────────────┤
│ id (UUID)           │
│ title               │
│ description         │
│ customer_id (FK)    │ ← Links to customer
│ status              │
│ progress            │
│ start_date          │
│ due_date            │
│ created_at          │
└─────────────────────┘
           │
           │ Project is linked to customer
           ↓
Customer Logs In:
┌─────────────────────┐
│ Customer Dashboard  │
│ Queries projects    │
│ WHERE customer_id   │
│ = current_user.id   │ ← Sees their projects
└─────────────────────┘
```

---

## Current Implementation Status

### ✅ Implemented Features

1. **Project Creation Modal** (`admin-projects.js`)
   - Full form with all required fields
   - Client dropdown populated from database
   - Validates inputs
   - Creates project in Supabase

2. **Client Loading** (`loadClientsForDropdown()`)
   - Fetches all customers from profiles table
   - Populates dropdown with customer names
   - Shows email if no name available

3. **Project Creation** (`handleCreateProject()`)
   - Submits project data to database
   - Links project to selected customer
   - Sets default status and health
   - Refreshes admin project list

4. **Admin Project List** (`loadAdminProjects()`)
   - Shows all projects across all customers
   - Displays customer name and company
   - Shows project status, progress, team
   - Filterable and searchable

### 🚧 To Be Implemented

1. **Customer Invitation Modal** (`showAddClientModal()`)
   - Create form for new customer details
   - Generate secure password
   - Call Supabase Edge Function to send email
   - Display success/error messages

2. **Email Functionality**
   - Password reset/welcome email template
   - Customer invitation email
   - Project notification emails

3. **Customer Dashboard Integration**
   - Ensure projects load correctly for customers
   - Filter projects by customer_id
   - Display project details in customer view

---

## Quick Start Guide for Admins

### Onboarding a New Customer - Step by Step

1. **Login as Admin** → `admin-dashboard.html`

2. **Create Customer Account**:
   ```
   Click: "👤 Invite Customer" button (top right)
   Fill in: Name, Email
   Click: "Send Invitation"
   ```

3. **Create Project for Customer**:
   ```
   Click: "Projects" in sidebar
   Click: "+ Create Project" button
   Fill in: Title, Description, Select Customer, Dates
   Click: "Create Project"
   ```

4. **Notify Customer**:
   ```
   Customer receives email with login link
   Customer sets password
   Customer logs in and sees their project
   ```

### Best Practices

- ✅ Create customer account BEFORE creating their project
- ✅ Use clear, descriptive project titles
- ✅ Set realistic due dates
- ✅ Add project icon for easy visual identification
- ✅ Assign team members immediately after project creation
- ✅ Create initial milestones to track progress

---

## Troubleshooting

### Customer Not Appearing in Dropdown

**Problem**: When creating a project, customer doesn't appear in the client dropdown.

**Solution**:
1. Check that customer's profile exists in Supabase
2. Verify their `role` is set to `'customer'` (not 'admin' or 'investor')
3. Refresh the admin dashboard

### Customer Can't See Their Project

**Problem**: Customer logs in but doesn't see their project.

**Solution**:
1. Verify project's `customer_id` matches the customer's `id` in profiles table
2. Check RLS policies allow customers to read their own projects
3. Verify customer is logged in with correct account

### Project Creation Fails

**Problem**: Error when clicking "Create Project"

**Solution**:
1. Check all required fields are filled
2. Verify dates are valid (start before due date)
3. Check browser console for specific error
4. Verify Supabase connection and permissions

---

## Next Steps

To fully complete the workflow:

1. **Implement `showAddClientModal()`** function in `admin-dashboard.js`
2. **Create Supabase Edge Function** for sending invitation emails
3. **Test end-to-end workflow** with a real customer account
4. **Add email templates** for customer invitations
5. **Implement project notifications** when projects are created/updated

---

## Related Files

- `admin-projects.js` - Admin project management functions
- `projects.js` - Core project CRUD operations  
- `customer-projects.js` - Customer project view
- `admin-dashboard.html` - Admin UI
- `customer-dashboard.html` - Customer UI
- `supabase/migrations/20251122_create_projects_schema.sql` - Database schema
