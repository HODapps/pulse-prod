# 🔧 Troubleshooting Blank Page on Vercel

## The Issue
After deployment, the app shows a blank white page.

## Most Common Causes & Solutions

### 1. ✅ Missing Environment Variables (MOST LIKELY)

**Problem**: Vercel doesn't have your Supabase credentials.

**Solution**:
1. Go to https://vercel.com
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add BOTH variables:
   ```
   VITE_SUPABASE_URL=https://szxoyacgtnqonbqxaxpl.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eG95YWNndG5xb25icXhheHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE1MDAsImV4cCI6MjA4NDU2NzUwMH0._MShakBhNFRhlfaTytGEeJX6gnuIj4UG_ObSoHxSWT4
   ```
5. Make sure to select **Production**, **Preview**, AND **Development**
6. Click **Save**
7. **Redeploy** your app:
   - Go to **Deployments** tab
   - Click the 3 dots on latest deployment
   - Click **Redeploy**

### 2. ✅ Check Build Logs

**How to check**:
1. Go to Vercel Dashboard
2. Click on your project
3. Click on **Deployments**
4. Click on the latest deployment
5. Check the **Build Logs** tab

**Look for**:
- Red errors during build
- Missing dependencies
- Environment variable warnings
- TypeScript errors

### 3. ✅ Check Runtime Logs

**How to check**:
1. In Vercel Dashboard
2. Go to your deployment
3. Click **Functions** or **Runtime Logs**

**Look for**:
- JavaScript errors
- "Cannot find module" errors
- CORS errors
- Authentication errors

### 4. ✅ Browser Console Errors

**How to check**:
1. Open your deployed app URL
2. Press **F12** (or right-click → Inspect)
3. Go to **Console** tab

**Common errors**:
- `Failed to fetch` → Environment variables missing
- `VITE_SUPABASE_URL is not defined` → Environment variables not set
- `CORS error` → Supabase URL configuration issue
- Network errors → Check Supabase is accessible

---

## Quick Fix Checklist

- [ ] Environment variables added to Vercel (both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY)
- [ ] Environment variables saved for Production, Preview, and Development
- [ ] Redeployed after adding environment variables
- [ ] Build completed successfully (check build logs)
- [ ] No errors in browser console (F12)
- [ ] Supabase database is accessible
- [ ] No red errors in Vercel runtime logs

---

## Step-by-Step Fix

### Step 1: Add Environment Variables

```bash
# Go to Vercel Dashboard
https://vercel.com

# Navigate to:
Your Project → Settings → Environment Variables

# Add these EXACT variables:
Name: VITE_SUPABASE_URL
Value: https://szxoyacgtnqonbqxaxpl.supabase.co
Environments: ✓ Production ✓ Preview ✓ Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6eG95YWNndG5xb25icXhheHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5OTE1MDAsImV4cCI6MjA4NDU2NzUwMH0._MShakBhNFRhlfaTytGEeJX6gnuIj4UG_ObSoHxSWT4
Environments: ✓ Production ✓ Preview ✓ Development
```

### Step 2: Redeploy

**Option A: Via Vercel Dashboard**
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **⋯** (three dots)
4. Click **Redeploy**
5. Wait for build to complete

**Option B: Push a small change**
```bash
# Make a small change to force redeploy
git commit --allow-empty -m "Force redeploy with env vars"
git push origin main
```

### Step 3: Verify

1. Wait for deployment to finish (check Vercel dashboard)
2. Open your production URL
3. Check if page loads
4. Press F12 → Console to check for errors

---

## Fix Favicon

The favicon issue is separate. Let's fix it:

### Update index.html
The favicon path should be correct:
```html
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
```

### Ensure favicon.ico exists
Make sure `public/favicon.ico` exists and is committed to GitHub.

---

## Still Blank Page?

### Check These:

**1. Verify Environment Variables Are Set**
```bash
# In Vercel Dashboard → Settings → Environment Variables
# You should see:
VITE_SUPABASE_URL (Production, Preview, Development)
VITE_SUPABASE_ANON_KEY (Production, Preview, Development)
```

**2. Check Build Output**
- Vercel build logs should show: "Build completed successfully"
- Look for: `✓ built in XXXms`

**3. Check Network Tab**
- Open DevTools (F12)
- Go to **Network** tab
- Refresh page
- Look for failed requests (red)

**4. Common Error Messages & Fixes**

| Error | Fix |
|-------|-----|
| `import.meta.env.VITE_SUPABASE_URL is undefined` | Add environment variables in Vercel |
| `Failed to fetch` | Check Supabase URL is correct |
| `Invalid API key` | Check VITE_SUPABASE_ANON_KEY is correct |
| `CORS error` | Configure Supabase URL settings |
| Build failed | Check build logs for TypeScript errors |

---

## Test Locally First

Before deploying again, test locally:

```bash
# 1. Make sure .env.local exists with correct values
cat .env.local

# 2. Build locally to check for errors
npm run build

# 3. Preview production build
npm run preview

# 4. If build succeeds locally, the issue is likely environment variables in Vercel
```

---

## Emergency Rollback

If nothing works, rollback to previous working deployment:

1. Go to Vercel → Deployments
2. Find a working deployment
3. Click **⋯** → **Promote to Production**

---

## Get Help

If still stuck:

1. **Check Vercel Logs**: Deployments → Latest → View Function Logs
2. **Check Browser Console**: F12 → Console tab (copy all errors)
3. **Check Build Logs**: Look for red error messages
4. **Verify Variables**: Settings → Environment Variables (ensure both exist)

**Most likely fix**: Add environment variables and redeploy! 🎯
