# 🚀 Vercel Deployment Guide

## Your changes are now on GitHub! ✅

**Repository**: https://github.com/HODapps/pulse-prod
**Branch**: main
**Latest Commit**: Implement new onboarding system with Supabase integration

---

## Deployment Steps

### 1. Configure Environment Variables in Vercel

Before deploying, you **MUST** add your Supabase credentials to Vercel:

1. Go to https://vercel.com
2. Select your project: **pulse-prod**
3. Navigate to **Settings** → **Environment Variables**
4. Add the following variables:

```
VITE_SUPABASE_URL=https://szxoyacgtnqonbqxaxpl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eG95YWNndG5xb25icXhheHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE1MDAsImV4cCI6MjA4NDU2NzUwMH0._MShakBhNFRhlfaTytGEeJX6gnuIj4UG_ObSoHxSWT4
```

**Important**:
- Make sure to add these for **Production**, **Preview**, and **Development** environments
- Click **Save** after adding each variable

### 2. Deploy to Vercel

#### Option A: Automatic Deployment (Recommended)
Vercel will automatically deploy when you push to `main` branch. Since we just pushed, Vercel should be deploying now!

Check your Vercel dashboard to see the deployment progress.

#### Option B: Manual Deployment via CLI
```bash
# If you have Vercel CLI installed
vercel --prod
```

#### Option C: Deploy via Vercel Dashboard
1. Go to your Vercel dashboard
2. Click on your project
3. Click **Deploy** button
4. Select `main` branch
5. Click **Deploy**

---

## Post-Deployment Configuration

### 3. Configure Supabase for Production

After deployment, update Supabase settings:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel production URL:
   ```
   https://your-app.vercel.app
   ```

3. Add **Redirect URLs**:
   ```
   https://your-app.vercel.app
   https://your-app.vercel.app/**
   https://your-app.vercel.app/auth/callback
   ```

4. Save changes

### 4. Test Production Deployment

1. Visit your production URL
2. Login with admin credentials
3. Complete board setup wizard (if first time)
4. Test inviting a collaborator
5. Verify magic link emails are sent

---

## Troubleshooting

### "Environment variables not found"
- Make sure you added the environment variables in Vercel
- Redeploy after adding variables
- Check that variable names match exactly: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### "Auth redirect error"
- Verify Site URL and Redirect URLs in Supabase match your production domain
- Check for HTTPS (must use HTTPS in production)

### "Magic links not working"
- Configure SMTP in Supabase for production emails
- Or use Supabase's built-in email service
- Check spam folder for test emails

### "Board setup wizard not showing"
- Make sure you ran `supabase-schema.sql` in your Supabase database
- Verify `board_settings` table exists
- Check browser console for errors

---

## Quick Deployment Checklist

- [x] Code pushed to GitHub
- [ ] Environment variables added to Vercel
- [ ] Vercel deployment triggered/completed
- [ ] Supabase Site URL configured
- [ ] Supabase Redirect URLs configured
- [ ] Admin user created in Supabase
- [ ] Tested login on production
- [ ] Tested board setup wizard
- [ ] Tested magic link invitations

---

## Database Setup (If Not Done)

If you haven't set up the database yet:

1. Run the migration script in Supabase SQL Editor:
   ```sql
   -- Copy contents from supabase-schema.sql
   ```

2. Create admin user in Supabase Dashboard:
   - Authentication → Users → Add user
   - Email: your-email@example.com
   - Password: (secure password)
   - ✅ Check "Auto Confirm User"

3. Set admin role:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

---

## Next Steps After Deployment

1. **Login** to production app
2. **Complete board setup** (if first time)
3. **Invite team members** via Settings
4. **Share production URL** with team
5. **Monitor** Vercel logs for any issues

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Implementation Guide**: See `NEW_ONBOARDING_GUIDE.md`
- **Setup Guide**: See `IMPLEMENTATION_COMPLETE.md`

---

## Your Production URLs

After deployment, you'll have:
- **Production**: https://your-app.vercel.app
- **Preview**: https://your-app-git-main-yourusername.vercel.app

Check your Vercel dashboard for the exact URLs!

---

**Ready to deploy?** Go to https://vercel.com and check your deployment status! 🎉
