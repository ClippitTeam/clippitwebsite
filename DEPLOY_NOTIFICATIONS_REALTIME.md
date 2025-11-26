# Deploy Notifications Realtime - Deployment Guide

## Overview
This guide enables realtime updates for the notifications table, allowing instant notification updates across all connected clients.

## What This Enables
- Real-time notification updates when new notifications are created
- Instant badge count updates without page refresh
- Live notification panel updates
- Better user experience with instant feedback

## Deployment Steps

### 1. Deploy the Migration to Supabase

Run this command in your terminal:

```bash
npx supabase db push
```

Or manually apply the migration in Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/20251125_enable_notifications_realtime.sql`
4. Paste and execute in the SQL Editor

### 2. Verify Realtime is Enabled

In Supabase Dashboard:
1. Go to **Database** → **Replication**
2. Check that `notifications` table is listed under **Replicated tables**
3. If not listed, manually add it:
   - Click **Manage Publication**
   - Find `notifications` table
   - Enable replication

### 3. Test Realtime Functionality

After deployment, the notification system will automatically receive realtime updates.

**To test:**
1. Open the admin dashboard in one browser window
2. Open another window (incognito or different browser)
3. Log in as admin in the second window
4. Create a test notification (e.g., by creating an invoice)
5. Check that the notification appears instantly in the first window without refresh

## Migration Contents

The migration does the following:

1. **Enables Realtime Publication**
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
   ```

2. **Grants Necessary Permissions**
   ```sql
   GRANT SELECT ON notifications TO authenticated;
   GRANT SELECT ON notifications TO anon;
   ```

3. **Ensures RLS is Enabled**
   ```sql
   ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
   ```

## How It Works

Once deployed, the `notifications.js` file already contains code to:
- Subscribe to realtime changes on the notifications table
- Automatically update the notification badge count
- Refresh the notification list when changes occur
- Handle INSERT, UPDATE, and DELETE events

No additional code changes are needed - the realtime functionality is already implemented in the frontend!

## Verification Checklist

- [ ] Migration executed successfully
- [ ] No SQL errors in Supabase logs
- [ ] `notifications` table appears in Replication settings
- [ ] Notification badge updates in real-time
- [ ] Notification panel refreshes automatically
- [ ] Realtime updates work across multiple browser windows

## Troubleshooting

### Issue: Realtime updates not working

**Solution 1: Check Replication**
```sql
-- Run this in SQL Editor to verify
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Solution 2: Manually enable if needed**
```sql
-- If notifications table is missing, run:
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**Solution 3: Check RLS policies**
```sql
-- Verify RLS policies exist
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

### Issue: Permission errors

**Solution:**
```sql
-- Grant necessary permissions
GRANT SELECT ON notifications TO authenticated;
GRANT SELECT ON notifications TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
```

## Next Steps

After successful deployment:
1. The notification system will work in real-time
2. Users will see instant notification updates
3. Badge counts will update automatically
4. No page refresh needed for new notifications

## Related Files
- Migration: `supabase/migrations/20251125_enable_notifications_realtime.sql`
- Notification System: `notifications.js`
- Original Schema: `supabase/migrations/20251125_create_notifications_schema.sql`
- Deployment Guide: `DEPLOY_NOTIFICATION_SYSTEM.md`

---

**Status:** Ready to Deploy  
**Date:** November 25, 2025  
**Version:** 1.0
