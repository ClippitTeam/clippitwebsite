# Deploy Latest Changes to Supabase

## 🚀 Quick Deployment Checklist

Follow these steps to deploy all recent changes to your live Supabase instance:

---

## Step 1: Deploy Database Migrations

### Migration 1: Investors Schema
1. Go to **Supabase Dashboard** → Your Project → **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of: `supabase/migrations/20251124_create_investors_schema.sql`
4. Click **Run** to execute
5. ✅ Verify: Check Tables section to confirm `investors` and `investor_subscriptions` tables exist

### Migration 2: Tickets & Tasks Schema
1. In **SQL Editor**, click **New Query**
2. Copy and paste the contents of: `supabase/migrations/20251124_create_tickets_tasks_schema.sql`
3. Click **Run** to execute
4. ✅ Verify: Check Tables section to confirm `tickets` and `tasks` tables exist

---

## Step 2: Deploy Edge Functions

### Function 1: send-investor-invite
1. Go to **Supabase Dashboard** → Your Project → **Edge Functions**
2. Click **Deploy new function**
3. Name: `send-investor-invite`
4. Copy and paste the contents of: `supabase/functions/send-investor-invite/index.ts`
5. Click **Deploy function**
6. ✅ Verify: Function appears in the list with status "Deployed"

**Note:** The function configuration files (deno.json, import_map.json) are already set up in your repo.

---

## Step 3: Verify Deployments

### Test Database Tables
```sql
-- Run in SQL Editor to verify tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('investors', 'investor_subscriptions', 'tickets', 'tasks');
```

### Test Edge Function
1. Go to **Edge Functions** → `send-investor-invite`
2. Click **Invoke function**
3. Use test payload:
```json
{
  "name": "Test Investor",
  "email": "test@example.com",
  "phone": "+1234567890",
  "company": "Test Company",
  "packageType": "vip-free",
  "personalMessage": "Test invitation"
}
```
4. ✅ Should return success response with invitation details

---

## Step 4: Test Live Site

1. Visit your live site: https://clippitteam.github.io/clippitwebsite
2. Login as admin
3. Navigate to **Investors** tab
4. ✅ Verify: Investors list loads from database
5. Click **Invite Investor**
6. Fill form and send invitation
7. ✅ Verify: Invitation email sent and investor appears in dashboard

---

## 🎯 What Was Deployed

### New Features:
- ✅ **Investor Management System** - Full CRUD operations for investors
- ✅ **Investor Subscriptions** - Package tracking and billing
- ✅ **Investor Invitations** - Email invitations with unique codes
- ✅ **Tickets & Tasks System** - Support ticket management
- ✅ **Staff Dashboard** - Complete staff interface
- ✅ **Real-time Data Loading** - Live database integration in admin dashboard

### Files Updated:
- `admin-dashboard.html` - Added Investors section UI
- `admin-dashboard.js` - Added investor data loading and management
- `admin-projects.js` - Enhanced project management
- `staff-dashboard.html` - New staff interface
- `staff-dashboard.js` - Staff functionality
- `tickets-tasks.js` - Ticket management system

### Database Schema:
- `investors` table - Stores investor profiles
- `investor_subscriptions` table - Tracks subscription packages
- `tickets` table - Support ticket system
- `tasks` table - Task management system

### Edge Functions:
- `send-investor-invite` - Sends invitation emails with Resend API

---

## 🔧 Troubleshooting

### If migrations fail:
1. Check for existing tables: `SELECT * FROM investors LIMIT 1;`
2. If tables exist, migrations already ran successfully
3. If error persists, drop tables and re-run migration

### If edge function fails:
1. Verify Resend API key is set in Supabase secrets
2. Check function logs in Edge Functions dashboard
3. Ensure CORS is properly configured

### If data doesn't load:
1. Check browser console for errors
2. Verify `supabase-config.js` has correct project URL and anon key
3. Test database connection in Supabase Dashboard

---

## ✅ Deployment Complete!

Your live site now has:
- 💰 Investor Management with real database integration
- 📊 Real-time investor statistics
- 📧 Automated invitation system
- 🎫 Tickets & Tasks management
- 👥 Staff dashboard
- 🔄 Live data synchronization

**Live Site:** https://clippitteam.github.io/clippitwebsite

---

## 📝 Next Steps

1. Test all investor features on live site
2. Invite real investors using the new system
3. Monitor edge function logs for any errors
4. Review investor analytics in admin dashboard

Need help? Check the detailed guides:
- `INVESTOR_MANAGEMENT_SETUP.md` - Investor system details
- `DEPLOY_INVESTOR_SYSTEM.md` - Technical deployment info
- `STAFF_WORKFLOW_GUIDE.md` - Staff dashboard guide
