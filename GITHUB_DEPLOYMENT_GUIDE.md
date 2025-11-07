# 🚀 GitHub Deployment Guide

## 📌 Important: Understanding the Architecture

**Supabase is NOT in GitHub!** Here's how they work together:

```
Your Code (GitHub)          Your Backend (Supabase)
     ↓                             ↓
HTML/CSS/JS files           Database + Edge Functions
     ↓                             ↓
Hosted on Netlify/Vercel    Hosted on Supabase
     ↓                             ↓
         Talk to each other via API
```

- **GitHub** = Your code repository (HTML, CSS, JavaScript files)
- **Supabase** = Your backend service (database, authentication, Edge Functions)
- **They connect** = Your website (from GitHub) calls Supabase APIs

---

## 🔄 Step 1: Save Your Code to GitHub

### Option A: Using Git Command Line

**1. Check Git Status:**
```bash
cd c:\Users\User\Desktop\clippitwebsite-main\clippitwebsite-main
git status
```

This shows all files that have changed.

**2. Stage All Changes:**
```bash
git add .
```

**3. Commit Changes:**
```bash
git commit -m "Security improvements: Implemented Microsoft Graph API email system and removed hardcoded credentials"
```

**4. Push to GitHub:**
```bash
git push origin main
```

(If your branch is named `master` instead of `main`, use `git push origin master`)

### Option B: Using Visual Studio Code

**1. Open Source Control Panel:**
- Click the Source Control icon in the left sidebar (looks like a branch)
- Or press `Ctrl+Shift+G`

**2. Review Changes:**
- You'll see all modified files listed
- New files: `.gitignore`, `SECURITY_IMPLEMENTATION_SUMMARY.md`, etc.
- Modified files: `script.js`

**3. Stage Changes:**
- Click the **"+"** button next to each file
- Or click **"+"** next to "Changes" to stage all

**4. Commit:**
- Type a commit message in the text box at the top:
  ```
  Security improvements: Implemented Microsoft Graph API email system and removed hardcoded credentials
  ```
- Click the **checkmark** button or press `Ctrl+Enter`

**5. Push to GitHub:**
- Click the **"..."** menu (three dots)
- Select **"Push"**
- Or click the sync button (↻) at the bottom

### Verify on GitHub:

1. Go to your GitHub repository: https://github.com/yourusername/clippitwebsite-main
2. You should see all the new files
3. Check the latest commit message

---

## 🔐 Step 2: Configure Supabase (Separate from GitHub)

**Supabase is accessed through its own dashboard, NOT through GitHub.**

### A. Access Supabase Dashboard

**Go to:** https://supabase.com/dashboard

**Login with:**
- Your Supabase account credentials
- (Not your GitHub credentials, unless you signed up with GitHub)

### B. Select Your Project

- Click on your **Clippit** project
- You should see your project dashboard

### C. Set Environment Variables for Edge Function

**1. Navigate to Edge Functions:**
- Click **"Edge Functions"** in the left sidebar
- Click **"Manage secrets"** or **"Settings"**

**2. Add These 5 Secrets:**

| Secret Name | Value |
|------------|-------|
| `MSGRAPH_TENANT_ID` | `c5d34171-61d2-4f57-ac79-aafbb536b006` |
| `MSGRAPH_CLIENT_ID` | `4466895d-96eb-4929-b1c7-af16244eed8b` |
| `MSGRAPH_CLIENT_SECRET` | `ChU8Q~CI0J_SlaJ.mBR23i5SVDUe6sQ9iW3_Vcr1` |
| `SENDER_EMAIL` | `your-microsoft-365-email@yourdomain.com` |
| `RECIPIENT_EMAIL` | `contact@clippit.today` |

⚠️ **Replace `SENDER_EMAIL` with your actual Microsoft 365 email address!**

**3. Click "Save" after adding each secret**

---

## 📤 Step 3: Deploy Edge Function to Supabase

**The Edge Function code is in your GitHub repo but needs to be deployed to Supabase separately.**

### A. Install Supabase CLI

**In Terminal/Command Prompt:**
```bash
npm install -g supabase
```

### B. Login to Supabase

```bash
supabase login
```

This will open your browser to authenticate.

### C. Link Your Project

**1. Get your Project Reference ID:**
- Go to Supabase Dashboard → Settings → General
- Copy the **"Reference ID"** (looks like: `ehaznoklcisgckglkjot`)

**2. Link the project:**
```bash
cd c:\Users\User\Desktop\clippitwebsite-main\clippitwebsite-main
supabase link --project-ref ehaznoklcisgckglkjot
```

### D. Deploy the Edge Function

```bash
supabase functions deploy send-contact-email
```

**Expected output:**
```
Deploying function send-contact-email...
Function deployed successfully!
Function URL: https://ehaznoklcisgckglkjot.supabase.co/functions/v1/send-contact-email
```

### E. Verify Deployment

1. Go to Supabase Dashboard → Edge Functions
2. You should see **"send-contact-email"** listed
3. Status should be **"Active"** with a green dot

---

## 🌐 Step 4: Deploy Website (Optional)

Your website files from GitHub need to be hosted somewhere so people can visit it.

### Popular Options:

#### Option 1: Netlify (Recommended)

**1. Go to:** https://netlify.com
**2. Click:** "Add new site" → "Import an existing project"
**3. Connect:** Your GitHub account
**4. Select:** Your repository `clippitwebsite-main`
**5. Configure:**
- Build command: (leave empty)
- Publish directory: `/`
**6. Click:** "Deploy site"

Your site will be live at: `https://random-name-12345.netlify.app`

#### Option 2: GitHub Pages

**1. Go to your GitHub repository**
**2. Click:** Settings → Pages
**3. Source:** Select `main` branch and `/` (root)
**4. Click:** Save

Your site will be live at: `https://yourusername.github.io/clippitwebsite-main`

#### Option 3: Vercel

**1. Go to:** https://vercel.com
**2. Click:** "Add New" → "Project"
**3. Import:** Your GitHub repository
**4. Click:** "Deploy"

---

## 📊 Complete Deployment Workflow

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  1. MAKE CODE CHANGES                              │
│     - Edit HTML/CSS/JS files locally               │
│     - Test locally                                 │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  2. COMMIT TO GITHUB                               │
│     git add .                                       │
│     git commit -m "message"                         │
│     git push origin main                            │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  3. DEPLOY WEBSITE                                 │
│     (Netlify/Vercel/GitHub Pages auto-deploys)     │
│     Or manually deploy if needed                    │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  4. DEPLOY SUPABASE EDGE FUNCTION (if changed)     │
│     supabase functions deploy send-contact-email   │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│                                                     │
│  5. TEST IN PRODUCTION                             │
│     - Test contact form                            │
│     - Test login                                   │
│     - Check for errors                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## ⚠️ IMPORTANT: What NOT to Commit to GitHub

The `.gitignore` file I created prevents these from being committed:

❌ **DO NOT commit:**
- `.env` files (contain secrets)
- `.env.local` files
- Any file with passwords or API keys
- The client secret value

✅ **SAFE to commit:**
- HTML, CSS, JavaScript files
- `.env.example` (template without real values)
- Documentation files
- Supabase Edge Function code (it's deployed separately)

---

## 🔍 How to Check What Will Be Committed

**Before committing, check what will be included:**

```bash
git status
```

**Look at the actual content:**
```bash
git diff
```

**If you see any secrets/passwords:**
1. DON'T commit!
2. Add that file to `.gitignore`
3. Remove it from staging: `git reset filename`

---

## 📝 Summary: Where Everything Lives

| Component | Location | Access |
|-----------|----------|--------|
| **Website Code** | GitHub | https://github.com/yourusername/clippitwebsite-main |
| **Database** | Supabase | https://supabase.com/dashboard |
| **Authentication** | Supabase | https://supabase.com/dashboard |
| **Edge Functions** | Supabase | https://supabase.com/dashboard |
| **Live Website** | Netlify/Vercel | Your custom domain or assigned URL |
| **Email Service** | Microsoft Graph | https://portal.azure.com |

---

## 🎯 Quick Command Reference

### Git Commands:
```bash
# Check status
git status

# Stage all changes
git add .

# Commit with message
git commit -m "Your message here"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main

# View commit history
git log --oneline
```

### Supabase Commands:
```bash
# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy Edge Function
supabase functions deploy send-contact-email

# View function logs
supabase functions logs send-contact-email

# List all functions
supabase functions list
```

---

## 🆘 Common Issues

### "Permission denied" when pushing to GitHub:

**Solution:**
```bash
# Configure Git credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# Or use GitHub Desktop app
```

### "Supabase CLI not found":

**Solution:**
```bash
# Install Node.js first, then:
npm install -g supabase

# Verify installation:
supabase --version
```

### "Cannot find project":

**Solution:**
1. Check you're in the correct directory
2. Verify project reference ID is correct
3. Make sure you're logged into the right Supabase account

---

## ✅ Deployment Checklist

**GitHub:**
- [ ] All changes committed
- [ ] No secrets in code
- [ ] `.gitignore` working correctly
- [ ] Pushed to GitHub successfully
- [ ] All files visible on GitHub

**Supabase:**
- [ ] Environment variables set
- [ ] Edge Function deployed
- [ ] Function shows as "Active"
- [ ] Database tables created
- [ ] Admin user created

**Website:**
- [ ] Deployed to Netlify/Vercel/GitHub Pages
- [ ] Contact form works
- [ ] Login works
- [ ] No console errors

**Testing:**
- [ ] Send test email via contact form
- [ ] Login as admin
- [ ] Check email received
- [ ] Verify no errors in logs

---

## 🎉 You're All Set!

Your code is now:
- ✅ Saved in GitHub (version controlled)
- ✅ Backend deployed to Supabase
- ✅ Website hosted and live
- ✅ Secure and production-ready

**Need help?** Check the other guides:
- `SECURITY_IMPLEMENTATION_SUMMARY.md` - Main guide
- `MSGRAPH_SETUP_GUIDE.md` - Email setup
- `CREATE_ADMIN_USER.md` - Create users
- `SUPABASE_SETUP_GUIDE.md` - Database setup

---

*Happy deploying! 🚀*
