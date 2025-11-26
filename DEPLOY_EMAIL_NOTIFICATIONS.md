# Email Notification System - Deployment Guide

## Overview
This guide covers deploying the complete email notification system with immediate alerts and digest emails.

## Features
- ✅ Automatic email notifications when users get notifications
- ✅ Daily and weekly digest emails
- ✅ Customizable notification preferences
- ✅ Email queue with retry logic
- ✅ Professional HTML email templates
- ✅ Integration with Resend email service
- ✅ Per-notification-type preferences

## Prerequisites

### 1. Resend Account Setup
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (clippit.online)
3. Get your API key
4. Configure Supabase secrets:
```bash
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

### 2. Domain Verification
In Resend dashboard:
1. Add domain: `clippit.online`
2. Add DNS records to GoDaddy:
   - SPF record
   - DKIM record
   - DMARC record (optional but recommended)
3. Wait for verification (usually 5-15 minutes)

## Deployment Steps

### Step 1: Apply Database Migration

Run this migration in Supabase SQL Editor:

```sql
-- File: supabase/migrations/20251126_add_notification_preferences.sql
```

This creates:
- `notification_preferences` column in profiles table
- `email_queue` table for reliable delivery
- Email sending functions
- Trigger to auto-queue emails when notifications are created
- Function to get users for digest emails

### Step 2: Verify Database Changes

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('notification_preferences', 'last_email_sent_at', 'last_digest_sent_at');

-- Check if email_queue table was created
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'email_queue';

-- Check if functions exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('should_send_email_notification', 'get_users_for_digest');
```

### Step 3: Deploy Edge Functions

Deploy the email sending functions:

```bash
# Deploy immediate notification emails
supabase functions deploy send-notification-email

# Deploy digest emails
supabase functions deploy send-digest-emails
```

### Step 4: Set Up Cron Jobs

In Supabase Dashboard > Database > Cron Jobs:

#### Immediate Email Processing (every minute)
```sql
SELECT cron.schedule(
    'process-email-queue',
    '* * * * *',  -- Every minute
    $$
    SELECT net.http_post(
        url:='https://your-project-ref.supabase.co/functions/v1/send-notification-email',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    );
    $$
);
```

#### Daily Digest (9 AM every day)
```sql
SELECT cron.schedule(
    'send-daily-digest',
    '0 9 * * *',  -- 9 AM daily
    $$
    SELECT net.http_post(
        url:='https://your-project-ref.supabase.co/functions/v1/send-digest-emails?type=daily',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    );
    $$
);
```

#### Weekly Digest (9 AM every Monday)
```sql
SELECT cron.schedule(
    'send-weekly-digest',
    '0 9 * * 1',  -- 9 AM every Monday
    $$
    SELECT net.http_post(
        url:='https://your-project-ref.supabase.co/functions/v1/send-digest-emails?type=weekly',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    );
    $$
);
```

### Step 5: Deploy JavaScript Files

Upload these files to your web hosting:

1. `notification-preferences.js` - Settings UI
2. Add script reference to dashboards:

```html
<!-- In customer-dashboard.html, admin-dashboard.html, staff-dashboard.html -->
<script src="notification-preferences.js"></script>
```

### Step 6: Add Settings UI to Dashboards

Add this container where you want the settings to appear:

```html
<div id="notification-preferences-container"></div>
```

The preferences UI will automatically render when the page loads.

## Email Templates

The system includes professional email templates:

### Immediate Notification Email
- Clean, modern design
- Turquoise/teal branding
- CTA button to view details
- Link to manage preferences

### Digest Email
- Summary of unread notifications
- Grouped by type with icons
- Time ago for each notification
- Count of total unread
- Links to view all

## Configuration Options

### User Preferences

Users can customize:
- **Email Notifications**: On/Off
- **Immediate Alerts**: On/Off
- **Digest Frequency**: Daily or Weekly
- **Digest Day**: Day of week (for weekly)
- **Digest Time**: Time of day
- **Notification Types**: Individual toggles for:
  - @Mentions
  - Assignments
  - Comments
  - Status Changes
  - Project Updates

### Default Preferences

New users get these defaults:
```json
{
  "email_enabled": true,
  "email_immediate": true,
  "email_digest": "weekly",
  "email_mentions": true,
  "email_project_updates": true,
  "email_assignments": true,
  "email_comments": true,
  "email_status_changes": true,
  "push_enabled": true,
  "digest_day": "monday",
  "digest_time": "09:00"
}
```

## Testing

### Test Immediate Notifications

1. Create a test notification:
```javascript
await createNotification(
    userId,
    'mention',
    'Test Notification',
    'This is a test email notification',
    '/dashboard'
);
```

2. Check email_queue table:
```sql
SELECT * FROM email_queue WHERE recipient_id = 'user-id' ORDER BY created_at DESC LIMIT 5;
```

3. Manually trigger email processing:
```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-notification-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

4. Check email was sent:
```sql
SELECT * FROM email_queue WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 5;
```

### Test Digest Emails

1. Create multiple test notifications for a user
2. Manually trigger digest:
```bash
# Daily digest
curl -X POST "https://your-project-ref.supabase.co/functions/v1/send-digest-emails?type=daily" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Weekly digest
curl -X POST "https://your-project-ref.supabase.co/functions/v1/send-digest-emails?type=weekly" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

3. Check for digest email in inbox

### Test Preferences UI

1. Navigate to dashboard settings
2. Toggle various preferences
3. Click "Save All Preferences"
4. Verify in database:
```sql
SELECT notification_preferences FROM profiles WHERE id = 'user-id';
```

## Monitoring

### Check Email Queue Status

```sql
-- Pending emails
SELECT COUNT(*) as pending_count FROM email_queue WHERE status = 'pending';

-- Failed emails
SELECT * FROM email_queue WHERE status = 'failed' ORDER BY created_at DESC;

-- Success rate
SELECT 
    status,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM email_queue
GROUP BY status;
```

### Check Recent Activity

```sql
-- Recent emails sent
SELECT 
    recipient_email,
    email_type,
    subject,
    sent_at
FROM email_queue
WHERE status = 'sent'
ORDER BY sent_at DESC
LIMIT 20;

-- Failed attempts
SELECT 
    recipient_email,
    email_type,
    attempts,
    error_message
FROM email_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Emails Not Sending

1. **Check Resend API Key**:
```bash
supabase secrets list
```

2. **Check email queue**:
```sql
SELECT * FROM email_queue WHERE status = 'pending' ORDER BY created_at DESC LIMIT 10;
```

3. **Check Edge Function logs**:
   - Go to Supabase Dashboard > Edge Functions
   - Select function
   - View logs

4. **Test Resend API directly**:
```bash
curl https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"Clippit <notifications@clippit.online>","to":["test@example.com"],"subject":"Test","html":"<p>Test</p>"}'
```

### Trigger Not Firing

```sql
-- Check if trigger exists
SELECT trigger_name FROM information_schema.triggers 
WHERE trigger_name = 'trigger_queue_notification_email';

-- If missing, recreate it
CREATE TRIGGER trigger_queue_notification_email
    AFTER INSERT ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION queue_notification_email();
```

### User Not Receiving Emails

1. Check user preferences:
```sql
SELECT notification_preferences FROM profiles WHERE id = 'user-id';
```

2. Verify email address:
```sql
SELECT email FROM auth.users WHERE id = 'user-id';
```

3. Check if emails are being queued:
```sql
SELECT * FROM email_queue WHERE recipient_id = 'user-id' ORDER BY created_at DESC;
```

### Cron Jobs Not Running

```sql
-- Check if cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- List all cron jobs
SELECT * FROM cron.job;

-- Check cron job history
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;
```

## Performance Optimization

### Batch Processing

The system processes up to 50 emails per invocation. For high volume:
1. Increase processing frequency
2. Adjust batch size in Edge Function
3. Add multiple processing schedules

### Rate Limiting

Resend has these limits:
- Free tier: 100 emails/day
- Paid: Higher limits

Monitor usage in Resend dashboard.

### Database Cleanup

Periodically clean old email records:

```sql
-- Delete sent emails older than 30 days
DELETE FROM email_queue 
WHERE status = 'sent' 
AND sent_at < NOW() - INTERVAL '30 days';

-- Delete failed emails older than 7 days
DELETE FROM email_queue 
WHERE status = 'failed' 
AND created_at < NOW() - INTERVAL '7 days';
```

## Security Considerations

- API keys stored securely in Supabase secrets
- RLS policies protect user data
- Email queue accessible only to authenticated users
- User preferences only editable by owner
- No sensitive data in email content

## Future Enhancements

Possible additions:
- SMS notifications
- Slack integration
- Microsoft Teams integration
- Custom email templates per company
- Email analytics and tracking
- A/B testing for email content
- Unsubscribe management

## Completion Checklist

- [ ] Resend account created and domain verified
- [ ] API key added to Supabase secrets
- [ ] Database migration applied
- [ ] Tables and functions verified
- [ ] Edge Functions deployed
- [ ] Cron jobs configured
- [ ] JavaScript files deployed
- [ ] Settings UI added to dashboards
- [ ] Immediate notifications tested
- [ ] Digest emails tested
- [ ] User preferences working
- [ ] Monitoring queries bookmarked
- [ ] Team trained on system

## Support

For issues:
1. Check Edge Function logs
2. Review email_queue table
3. Test Resend API connection
4. Verify cron jobs are running
5. Check user preferences

## Status
✅ Ready for deployment
