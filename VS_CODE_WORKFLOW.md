# Visual Studio Code Workflow Guide

## ✅ Your Setup Status

- **GitHub**: ✅ Connected to `ClippitTeam/clippitwebsite`
- **Supabase**: ✅ Linked to project `ehaznoklcisgckglkjot`
- **Supabase CLI**: ✅ Installed at `C:\Users\Float\Downloads\supabase.exe`

## Working from VS Code

### 1. Deploy Edge Functions

When you update an edge function (like `send-contact-email`), deploy it:

```powershell
& "$env:USERPROFILE\Downloads\supabase.exe" functions deploy send-contact-email
```

Or deploy all functions:
```powershell
& "$env:USERPROFILE\Downloads\supabase.exe" functions deploy
```

### 2. View Function Logs

Check logs in your terminal:
```powershell
& "$env:USERPROFILE\Downloads\supabase.exe" functions logs send-contact-email
```

Or view in dashboard:
https://supabase.com/dashboard/project/ehaznoklcisgckglkjot/functions

### 3. Push to GitHub

Commit and push your changes:
```powershell
git add .
git commit -m "Your commit message"
git push origin main
```

### 4. Pull Latest Changes

Get latest code from GitHub:
```powershell
git pull origin main
```

## Quick Commands Reference

### Supabase Commands
- **Deploy function**: `& "$env:USERPROFILE\Downloads\supabase.exe" functions deploy FUNCTION_NAME`
- **View logs**: `& "$env:USERPROFILE\Downloads\supabase.exe" functions logs FUNCTION_NAME`
- **List functions**: `& "$env:USERPROFILE\Downloads\supabase.exe" functions list`

### Git Commands
- **Check status**: `git status`
- **Add files**: `git add .` or `git add FILENAME`
- **Commit**: `git commit -m "message"`
- **Push**: `git push origin main`
- **Pull**: `git pull origin main`

## Typical Workflow

1. **Make changes** in VS Code
2. **Test locally** (if needed)
3. **Deploy to Supabase**: 
   ```powershell
   & "$env:USERPROFILE\Downloads\supabase.exe" functions deploy send-contact-email
   ```
4. **Commit to Git**:
   ```powershell
   git add .
   git commit -m "Updated send-contact-email function"
   git push origin main
   ```
5. **Check logs** if issues occur:
   - Dashboard: https://supabase.com/dashboard/project/ehaznoklcisgckglkjot/functions
   - Or terminal: `& "$env:USERPROFILE\Downloads\supabase.exe" functions logs send-contact-email`

## Optional: Make Supabase Command Shorter

To avoid typing the long path every time, you can create an alias in PowerShell:

1. Run this in VS Code terminal:
```powershell
Set-Alias -Name supabase -Value "$env:USERPROFILE\Downloads\supabase.exe"
```

2. Now you can just use:
```powershell
supabase functions deploy send-contact-email
```

**Note**: This alias only lasts for the current PowerShell session. To make it permanent, add it to your PowerShell profile.

## Your Current Error Debugging

After deploying the updated `send-contact-email` function:

1. Trigger the error on your website
2. View logs at: https://supabase.com/dashboard/project/ehaznoklcisgckglkjot/functions
3. Look for detailed error messages with `=== MAIN ERROR HANDLER ===`
4. The logs will show exactly what's failing

## Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/functions
- **Git Docs**: https://git-scm.com/doc
- **Your Project Dashboard**: https://supabase.com/dashboard/project/ehaznoklcisgckglkjot
