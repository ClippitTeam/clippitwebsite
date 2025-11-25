# Deploy Investor Management System - Quick Start Guide

## 🚀 Complete Setup in 3 Steps

### Step 1: Deploy Database Schema

Run the SQL migration to create investor tables:

```bash
# Option A: Using Supabase CLI
supabase db push --file supabase/migrations/20251124_create_investors_schema.sql

# Option B: Using Supabase Dashboard
# 1. Open Supabase Dashboard → SQL Editor
# 2. Copy contents of supabase/migrations/20251124_create_investors_schema.sql
# 3. Paste and click "Run"
```

**What this creates:**
- ✅ `investors` table - Main investor records
- ✅ `investor_subscriptions` table - Subscription history
- ✅ `investor_interactions` table - Activity tracking
- ✅ RLS policies for secure access
- ✅ Automatic triggers for counters

---

### Step 2: Deploy Edge Function

Deploy the investor invitation function:

```bash
# Deploy function
supabase functions deploy send-investor-invite

# Set Resend API key (required for emails)
supabase secrets set RESEND_API_KEY=re_your_resend_api_key_here
```

**Test the deployment:**
```bash
# Get your function URL
echo "https://your-project-ref.supabase.co/functions/v1/send-investor-invite"

# Test with curl
curl -X POST https://your-project-ref.supabase.co/functions/v1/send-investor-invite \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "name": "Test Investor",
    "email": "test@example.com",
    "packageType": "vip-free"
  }'
```

---

### Step 3: Update Admin Dashboard Integration

The admin dashboard already has the UI! Just update the JavaScript to call the correct edge function:

**File:** `admin-dashboard.js`

Find the `sendInvestorInvitation` function and update it to call `send-investor-invite`:

```javascript
async function sendInvestorInvitation(e) {
    e.preventDefault();

    const firstName = document.getElementById('investor-first-name').value;
    const lastName = document.getElementById('investor-last-name').value;
    const email = document.getElementById('investor-email').value;
    const company = document.getElementById('investor-company').value;
    const phone = document.getElementById('investor-phone').value;
    const packageType = document.getElementById('investor-package').value;
    const message = document.getElementById('investor-message').value;

    const fullName = firstName + ' ' + lastName;

    // Show loading state
    const submitButton = e.target.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending Invitation...';

    try {
        if (typeof supabase === 'undefined') {
            throw new Error('Supabase client not initialized');
        }

        // Call the send-investor-invite edge function
        const { data, error } = await supabase.functions.invoke('send-investor-invite', {
            body: {
                name: fullName,
                email: email,
                phone: phone,
                company: company,
                packageType: packageType,
                personalMessage: message
            }
        });

        if (error) {
            console.error('Invitation error:', error);
            throw new Error(error.message || 'Failed to send invitation');
        }

        if (!data || !data.success) {
            throw new Error(data?.error || 'Failed to create investor invitation');
        }

        closeModal();

        // Show success modal with invitation details
        showInvestorInvitationSuccess(
            fullName,
            email,
            data.data.invitationCode,
            data.data.loginUrl,
            packageType
        );

    } catch (error) {
        console.error('Error inviting investor:', error);
        alert(`Error: ${error.message || 'Failed to send investor invitation. Please try again.'}`);

        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    }
}
```

---

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Database tables created successfully
- [ ] Edge function deployed and accessible
- [ ] RESEND_API_KEY secret is set
- [ ] Admin dashboard "Invite Investor" button works
- [ ] Test invitation email sent
- [ ] Test invitation email received
- [ ] Invitation link works
- [ ] Investor record appears in database
- [ ] Investors tab shows new investor

---

## 📊 Check Deployment Status

### Verify Database Tables

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('investors', 'investor_subscriptions', 'investor_interactions');

-- View all investors
SELECT investor_name, email, subscription_status, subscription_tier, joined_date
FROM investors
ORDER BY joined_date DESC;
```

### Verify Edge Function

```bash
# List deployed functions
supabase functions list

# Check function logs
supabase functions logs send-investor-invite

# Verify secrets
supabase secrets list
```

---

## 🔧 Troubleshooting

### Problem: "Email not sending"

**Solution:**
1. Verify RESEND_API_KEY is set:
   ```bash
   supabase secrets list
   ```
2. Check Resend dashboard for delivery status
3. Ensure sender email `investors@clippit.today` is verified in Resend
4. Check edge function logs:
   ```bash
   supabase functions logs send-investor-invite --tail
   ```

### Problem: "Investor already exists error"

**Solution:**
Each email can only have one investor record. To resend invitation:
```sql
-- Delete existing investor
DELETE FROM investors WHERE email = 'investor@example.com';

-- Then try sending invitation again
```

### Problem: "Table does not exist"

**Solution:**
Re-run the migration:
```bash
supabase db push --file supabase/migrations/20251124_create_investors_schema.sql
```

### Problem: "RLS policy error - permission denied"

**Solution:**
Ensure you're logged in as admin:
```sql
-- Check user role
SELECT role FROM profiles WHERE id = auth.uid();

-- If not admin, update role
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

---

## 🎯 Quick Test Script

Copy and paste this into your browser console (while logged in as admin):

```javascript
// Test investor invitation
async function testInvestorInvite() {
    const result = await supabase.functions.invoke('send-investor-invite', {
        body: {
            name: 'Test Investor',
            email: 'test+investor@example.com',
            phone: '+1234567890',
            company: 'Test Company',
            packageType: 'vip-free',
            personalMessage: 'Welcome to our investor network!'
        }
    });
    
    console.log('Result:', result);
    
    if (result.data?.success) {
        console.log('✅ Success!');
        console.log('Invitation Code:', result.data.data.invitationCode);
        console.log('Login URL:', result.data.data.loginUrl);
    } else {
        console.log('❌ Failed:', result.error || result.data?.error);
    }
}

// Run test
testInvestorInvite();
```

---

## 📈 What's Next?

After deployment, you can:

1. **Load Investor Data from Database:**
   - Update admin dashboard to fetch from `investors` table
   - Show real-time subscription status
   - Display actual activity metrics

2. **Add Investor Dashboard Features:**
   - Create investor-dashboard.html page
   - Show investment opportunities
   - Track questions and offers
   - Display portfolio analytics

3. **Implement Payment Processing:**
   - Integrate Stripe for paid subscriptions
   - Handle subscription renewals
   - Track payment history

4. **Set Up Email Automations:**
   - Welcome sequence for new investors
   - Quarterly reports
   - Investment opportunity alerts

---

## 📞 Support

If you encounter issues:

1. Check the deployment logs
2. Verify database permissions (RLS policies)
3. Test edge function directly with curl
4. Review Resend email delivery logs
5. Check browser console for JavaScript errors

---

## 🎉 Success!

Once everything is deployed, you'll be able to:

✅ Invite investors from admin dashboard  
✅ Send automated invitation emails  
✅ Track investor activity and subscriptions  
✅ Manage investor access and permissions  
✅ View real-time investor analytics  

**Next steps:** See `INVESTOR_MANAGEMENT_SETUP.md` for advanced configuration and features.
