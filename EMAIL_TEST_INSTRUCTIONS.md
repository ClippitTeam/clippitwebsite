# Email Testing Instructions

## ✅ Configuration Complete!

Your EmailJS credentials have been configured in the system:
- **Public Key:** LLmEvKmH0qFC3vrLJ
- **Service ID:** service_cew6zgo
- **Files Updated:** admin-dashboard.html, admin-dashboard.js

---

## 📋 Next Step: Create Email Template

You still need to create the email template in your EmailJS dashboard.

### 1. Go to EmailJS Dashboard
Visit: https://dashboard.emailjs.com/admin

### 2. Create Template: Team Member Welcome
1. Click **Email Templates** → **Create New Template**
2. **Template ID:** `template_team_welcome` (MUST match exactly)
3. **Template Name:** Team Member Welcome Email

### 3. Template Content

**Subject:**
```
Welcome to the Clippit Team! 🎉
```

**Body:**
```html
Hi {{to_name}},

Welcome to Clippit! Your team member account has been created and is ready to use.

Your Login Details:
Username: {{username}}
Temporary Password: {{temp_password}}
Login URL: {{login_url}}

⚠️ IMPORTANT: You'll be required to change your password when you first log in for security purposes.

What You Can Access:
- Team dashboard and project management tools
- Assigned tasks and project updates
- Internal communication and messaging
- Team calendar and meeting schedules
- Company resources and documentation

If you have any questions, feel free to reach out to your manager or our support team.

Welcome aboard!
The {{company_name}} Team

---
Need help? Contact us at {{support_email}} or {{support_phone}}
```

### 4. Template Variables

Make sure these variables are available in your template:
- `{{to_name}}` - Team member's name
- `{{to_email}}` - Team member's email
- `{{username}}` - Login username
- `{{temp_password}}` - Temporary password
- `{{login_url}}` - Login page URL
- `{{company_name}}` - Your company name (Clippit)
- `{{support_email}}` - Support email
- `{{support_phone}}` - Support phone

### 5. Save the Template

Click **Save** and your template is ready!

---

## 🧪 Testing the Email System

### Test 1: Add a Team Member

1. Open `admin-dashboard.html` in your browser
2. Click the **"Invite Team Member"** quick action button (or navigate to Team section)
3. Click **"+ Add Team Member"**
4. Fill in the form:
   - Name: Test User
   - Email: YOUR_EMAIL_ADDRESS_HERE (use your real email to receive the test)
   - Role: Developer
   - Phone: Optional
   - Start Date: Today
5. Click **"Add Team Member"**
6. The system will automatically send the welcome email
7. Check your email inbox for the welcome message

### What Should Happen:

✅ Success notification appears
✅ Email arrives in your inbox within 1-2 minutes
✅ Email contains:
   - Welcome message
   - Generated username (the email you entered)
   - Temporary password (randomly generated)
   - Login URL
   - Instructions for first login

### If Email Doesn't Arrive:

1. **Check Spam/Junk folder**
2. **Verify EmailJS Dashboard:**
   - Go to https://dashboard.emailjs.com/admin
   - Check "History" tab to see if email was sent
   - Look for error messages
3. **Check Template ID:**
   - Must be exactly `template_team_welcome`
   - Case-sensitive!
4. **Check Service:**
   - Service ID must be `service_cew6zgo`
   - Service must be active

---

## 🎯 Current System Status

### ✅ Configured:
- [x] EmailJS Public Key installed
- [x] Service ID configured
- [x] Auto-send email function implemented
- [x] JavaScript code ready

### ⏳ To Do:
- [ ] Create email template in EmailJS dashboard
- [ ] Test by adding a team member
- [ ] Verify email delivery

---

## 📞 Need Help?

### EmailJS Support:
- Documentation: https://www.emailjs.com/docs/
- Support: https://www.emailjs.com/support/

### Common Issues:

**1. "Email send failed" error:**
- Check that template ID is exactly `template_team_welcome`
- Verify service is active in EmailJS dashboard
- Check your EmailJS account isn't in free tier limits

**2. Email template variables not showing:**
- Make sure you're using `{{variable_name}}` syntax (double curly braces)
- Variable names must match exactly

**3. Emails going to spam:**
- This is normal for new EmailJS accounts
- Mark as "Not Spam" to train email filters
- Consider upgrading to EmailJS paid plan for better deliverability

---

## 🚀 Once Working:

The same system will work for:
1. **Client onboarding** - When you invite new clients to the customer dashboard
2. **Investor invitations** - When you invite investors to the investor lounge
3. **Team notifications** - Automated emails for various team actions

You can create additional templates for these by following the same process!

---

**Last Updated:** October 30, 2025
**System Version:** 1.0
**Status:** Ready for template creation
