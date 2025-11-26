# Quick Deployment Steps for Notification Systems

## ✅ Step 1: JavaScript Files (AUTO-DEPLOYED via GitHub Pages)
**Status: DONE** - Files are already live at clippit.online because they're in GitHub!

The following files are now live:
- `notifications.js`
- `invoices.js`
- `attachments.js`
- `comments-activity.js`
- `notification-preferences.js`
- Updated HTML dashboards

## 🗄️ Step 2: Database Migrations (Supabase SQL Editor)

Go to your Supabase Dashboard > SQL Editor and run these **in order**:

### Migration 1: Notifications System
```sql
-- Copy and paste from: supabase/migrations/20251125_create_notifications_schema.sql
```
✅ Creates: `notifications` table, `notification_read_status` function, RLS policies

### Migration 2: Enable Realtime
```sql
-- Copy and paste from: supabase/migrations/20251125_enable_notifications_realtime.sql
```
✅ Enables: Realtime updates for notifications

### Migration 3: Invoices System
```sql
-- Copy and paste from: supabase/migrations/20251126_create_invoices_schema.sql
```
✅ Creates: `invoices` table, status tracking, RLS policies

### Migration 4: Attachments System
```sql
-- Copy and paste from: supabase/migrations/20251126_create_attachments_schema.sql
```
✅ Creates: `attachments` table, file metadata, RLS policies

Then run this in SQL Editor to create storage bucket:
```sql
-- Copy and paste from: supabase/storage_policies_attachments.sql
```
✅ Creates: `attachments` storage bucket with policies

### Migration 5: Comments & Activity
```sql
-- Copy and paste from: supabase/migrations/20251126_create_activity_comments_schema.sql
```
✅ Creates: `comments`, `activity_log`, `mentions` tables

### Migration 6: Email Preferences
```sql
-- Copy and paste from: supabase/migrations/20251126_add_notification_preferences.sql
```
✅ Creates: `email_queue` table, notification preferences, email triggers

## 🚀 Step 3: Deploy Edge Functions (Terminal/Command Line)

Run these commands in your terminal:

```bash
# Deploy notification email processor
supabase functions deploy send-notification-email

# Deploy digest email sender
supabase functions deploy send-digest-emails

# Deploy invoice sender
supabase functions deploy send-invoice
```

**Note**: Make sure you're logged in to Supabase CLI first:
```bash
supabase login
supabase link --project-ref your-project-ref
```

## ⏰ Step 4: Set Up Cron Jobs (Supabase Dashboard)

Go to Supabase Dashboard > Database > Cron Jobs

### Cron Job 1: Process Email Queue (Every Minute)
```sql
SELECT cron.schedule(
    'process-email-queue',
    '* * * * *',
    $$
    SELECT net.http_post(
        url:='https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR-ANON-KEY"}'::jsonb,
        body:='{}'::jsonb
    );
    $$
);
```

### Cron Job 2: Daily Digest (9 AM Daily)
```sql
SELECT cron.schedule(
    'send-daily-digest',
    '0 9 * * *',
    $$
    SELECT net.http_post(
        url:='https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-digest-emails?type=daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR-ANON-KEY"}'::jsonb,
        body:='{}'::jsonb
    );
    $$
);
```

### Cron Job 3: Weekly Digest (9 AM Monday)
```sql
SELECT cron.schedule(
    'send-weekly-digest',
    '0 9 * * 1',
    $$
    SELECT net.http_post(
        url:='https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-digest-emails?type=weekly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR-ANON-KEY"}'::jsonb,
        body:='{}'::jsonb
    );
    $$
);
```

**Replace**:
- `YOUR-PROJECT-REF` with your Supabase project reference
- `YOUR-ANON-KEY` with your Supabase anon/public key

## 🧪 Step 5: Test Everything

### Test Notifications
1. Log in to your dashboard
2. Check the bell icon in top right
3. Create a test notification:
```sql
INSERT INTO notifications (user_id, type, title, message, link)
VALUES ('your-user-id', 'mention', 'Test Notification', 'This is a test!', '/dashboard');
```

### Test Email Queue
1. Check if email was queued:
```sql
SELECT * FROM email_queue ORDER BY created_at DESC LIMIT 5;
```

2. Manually trigger email processing:
```bash
curl -X POST https://YOUR-PROJECT-REF.supabase.co/functions/v1/send-notification-email \
  -H "Authorization: Bearer YOUR-ANON-KEY" \
  -H "Content-Type: application/json"
```

### Test Attachments
1. Go to any project in dashboard
2. Upload a test file
3. Check it appears in attachments list

### Test Comments
1. Navigate to a project/ticket
2. Add a test comment with @mention
3. Check recipient gets notification

## 📋 Verification Checklist

- [ ] All 6 migrations ran successfully
- [ ] 3 Edge Functions deployed
- [ ] 3 Cron jobs configured
- [ ] Notifications appear in dashboard
- [ ] Email queue is processing
- [ ] Attachments can be uploaded
- [ ] Comments system works
- [ ] @Mentions send notifications
- [ ] Settings page shows preferences

## 🎯 What You Get

After deployment:
- ✅ Real-time notifications with bell icon
- ✅ Email notifications (immediate or digest)
- ✅ File attachments on projects/tickets
- ✅ Comments with @mentions
- ✅ Activity timeline tracking
- ✅ Invoice generation & sending
- ✅ Customizable email preferences

## 🆘 Need Help?

Stuck on a step? Each system has a detailed guide:
- `DEPLOY_NOTIFICATION_SYSTEM.md`
- `DEPLOY_EMAIL_NOTIFICATIONS.md`
- `DEPLOY_INVOICE_SYSTEM.md`
- `DEPLOY_ATTACHMENTS_SYSTEM.md`
- `DEPLOY_COMMENTS_ACTIVITY.md`

Or just ask me!
