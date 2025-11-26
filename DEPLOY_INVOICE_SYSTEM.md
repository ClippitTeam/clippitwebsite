# Invoice System Deployment Guide

## Overview

This guide covers the deployment of the complete invoice management system including database schema, email functionality, and frontend integration.

## What's Been Created

### 1. Database Schema (`supabase/migrations/20251126_create_invoices_schema.sql`)
- **invoices** table - Main invoice data
- **invoice_line_items** table - Individual items on invoices
- **invoice_payments** table - Payment tracking
- **invoice_emails** table - Email delivery tracking
- **invoice_summary** view - Simplified invoice data with joins
- Automatic calculation triggers for totals
- RLS policies for security
- Helper functions for invoice number generation

### 2. Edge Function (`supabase/functions/send-invoice/`)
- Sends professional HTML emails to clients
- Supports multiple email types:
  - **initial** - When invoice is first sent
  - **reminder** - Payment reminder
  - **overdue** - Overdue notice
  - **thank_you** - Payment received
- Integrates with Resend API
- Tracks email delivery

### 3. Frontend (`invoices.js`)
- Complete invoice CRUD operations
- Invoice creation with line items
- Payment recording
- Email sending interface
- Real-time status updates
- Export to CSV

## Deployment Steps

### Step 1: Deploy Database Schema

1. Open Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/20251126_create_invoices_schema.sql`
3. Paste and run the script
4. Verify tables were created successfully

### Step 2: Deploy Edge Function

```bash
# Make sure you're in the project directory
cd "c:\Users\Float\Videos\clippit take two\clippitwebsite"

# Deploy the send-invoice function
supabase functions deploy send-invoice

# Verify deployment
supabase functions list
```

### Step 3: Configure Resend API

1. Go to https://resend.com and create an account
2. Verify your domain (or use the Resend test domain)
3. Get your API key from the dashboard
4. Add to Supabase Edge Functions secrets:

```bash
supabase secrets set RESEND_API_KEY="your-api-key-here"
```

### Step 4: Test the System

1. Open admin dashboard → Invoices section
2. Click "Create Invoice"
3. Fill in invoice details:
   - Select a client
   - Add line items
   - Set dates
4. Save as draft or send immediately
5. Test payment recording
6. Test email sending

## Invoice Workflow

### Creating an Invoice

1. **Admin Dashboard** → **Invoices** tab
2. Click **"Create Invoice"** button
3. Fill in required fields:
   - Client (required)
   - Project (optional - links to existing project)
   - Invoice Number (auto-generated)
   - Issue Date
   - Due Date
   - Line Items (description, quantity, price)
   - Payment Instructions (optional)
   - Notes (optional)
4. Choose to either:
   - **Save as Draft** - Saves without sending
   - **Create & Send** - Saves and emails to client

### Sending Invoices

**From Draft:**
- Click invoice → Click "Send Invoice" button
- Email automatically sent to client's registered email

**Reminder Emails:**
- Click invoice → Click "Send Reminder"
- Tracks reminder count and last sent date

**Overdue Notices:**
- Manually trigger or set up automation
- System auto-flags invoices as overdue when past due date

### Recording Payments

1. Click on invoice
2. Click **"Mark as Paid"** button
3. Enter:
   - Payment amount
   - Payment date
   - Payment method
   - Reference number (optional)
   - Notes (optional)
4. Submit

**System automatically:**
- Updates amount_paid
- Calculates amount_due
- Changes status to 'paid' when fully paid
- Records timestamp

### Invoice Statuses

- **draft** - Created but not sent
- **sent** - Emailed to client, awaiting payment
- **paid** - Fully paid
- **overdue** - Past due date, unpaid
- **cancelled** - Cancelled by admin
- **refunded** - Payment refunded

## Features

### Automatic Calculations

The system automatically:
- Calculates line item amounts (qty × price)
- Sums up subtotal
- Calculates tax/GST (10% by default, optional)
- Computes total amount
- Updates amount due when payments received
- Changes status based on payment

### Email Tracking

- Logs every email sent
- Tracks email type and recipient
- Records send timestamps
- Counts reminders sent
- Monitors open/click events (future feature)

### Reports & Analytics

- Total invoices
- Pending amount
- Overdue tracking
- Revenue by month
- Payment success rate
- Average payment time

### Client Dashboard View

Clients can view their invoices in their dashboard:
- See all invoices (paid and pending)
- Download invoice PDFs (future feature)
- View payment history
- Make online payments (future feature)

## Database Structure

### Main Tables

**invoices**
- Stores invoice header data
- Links to client and project
- Tracks amounts and dates
- Manages status

**invoice_line_items**
- Individual items/services
- Description, qty, price, amount
- Linked to parent invoice

**invoice_payments**
- Payment records
- Amount, date, method, reference
- Linked to invoice

**invoice_emails**
- Email delivery log
- Type, recipient, status
- Tracking metrics

## API Endpoints

### Edge Function

**POST** `/functions/v1/send-invoice`

**Request Body:**
```json
{
  "invoiceId": "uuid",
  "emailType": "initial" | "reminder" | "overdue" | "thank_you"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Invoice email sent successfully",
  "emailId": "resend-email-id"
}
```

## Frontend Integration

### Initialization

The invoice system initializes when navigating to the Invoices tab:

```javascript
// Called when invoices tab is shown
await initializeInvoices();
```

### Key Functions

- `loadInvoices()` - Fetches all invoices
- `showCreateInvoiceModal()` - Opens invoice creation form
- `saveInvoice(status)` - Saves invoice to database
- `sendInvoiceEmail(invoiceId, type)` - Triggers email
- `markInvoiceAsPaid(invoiceId)` - Records payment
- `viewInvoiceDetails(invoiceId)` - Shows full invoice
- `exportInvoices()` - Exports to CSV

## Security

### Row Level Security (RLS)

- Admins can manage all invoices
- Clients can only view their own invoices
- Staff can view but not modify
- All modifications logged

### Authentication

- User must be authenticated
- Email sending requires admin role
- Payment recording requires admin role

## Best Practices

### Invoice Numbering

- Format: INV-YY-0001
- Auto-increments per year
- Unique constraint enforced

### Payment Tracking

- Always record payment date
- Include reference numbers
- Add notes for context
- Partial payments supported

### Email Communication

- Send initial invoice immediately after creation
- Send reminder 3-5 days before due date
- Send overdue notice 1-2 days after due date
- Send thank you email when paid

### Client Management

- Ensure client exists before creating invoice
- Link to project when applicable
- Include clear payment instructions
- Set realistic due dates

## Troubleshooting

### Invoice Not Sending

1. Check Resend API key is set
2. Verify client has valid email
3. Check Edge Function logs
4. Ensure invoice status allows sending

### Calculations Incorrect

1. Database triggers should run automatically
2. Check tax rate (10% default)
3. Verify line item quantities and prices
4. Refresh invoice data

### Payment Not Recording

1. Check user has admin role
2. Verify invoice ID is correct
3. Check amount is valid
4. Review database logs

## Future Enhancements

- [ ] PDF generation
- [ ] Online payment integration (Stripe)
- [ ] Recurring invoices
- [ ] Invoice templates
- [ ] Multi-currency support
- [ ] Automatic payment reminders
- [ ] Client portal for viewing/paying
- [ ] Bulk invoicing
- [ ] Invoice disputes/adjustments
- [ ] Advanced reporting & analytics

## Support

For issues or questions:
1. Check database logs in Supabase
2. Review Edge Function logs
3. Check browser console for errors
4. Verify all environment variables are set

## Maintenance

### Regular Tasks

- Review overdue invoices weekly
- Send payment reminders
- Archive old paid invoices (optional)
- Update tax rates if changed
- Review and update payment instructions

### Database Maintenance

- Clean up old email logs (optional)
- Archive invoices older than 7 years
- Backup invoice data regularly
- Monitor storage usage

## Summary

The invoice system is now fully functional with:
✅ Complete database schema
✅ Email sending capability
✅ Frontend interface
✅ Payment tracking
✅ Status management
✅ Security policies

You can now create, send, and manage professional invoices directly from the admin dashboard!
