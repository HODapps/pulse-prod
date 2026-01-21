# Supabase Setup Guide for Project Pulse

This guide will help you set up real authentication with Supabase for Project Pulse.

## Prerequisites

✅ Supabase account (you mentioned you have this)
✅ GitHub account (you have this)
✅ Project already deployed on Vercel

## Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 2: Create .env.local File

Create a file named `.env.local` in the project root (same folder as `package.json`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace with your actual values from Step 1.

**Important**: This file is already in `.gitignore` and will NOT be committed to GitHub.

## Step 3: Run Database Schema

1. Go to Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Open the file `supabase-schema.sql` (in this project root)
4. Copy and paste the ENTIRE contents into the SQL Editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see: "Success. No rows returned"

This creates all tables, security policies, and triggers needed for the app.

## Step 4: Create Admin User

### Option A: Via Supabase Dashboard (Recommended)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - **Email**: Your email (e.g., `admin@projectpulse.com`)
   - **Password**: Choose a strong password
   - **Auto Confirm User**: ✅ Check this box
4. Click **Create user**

The user profile will be automatically created in the database by our trigger.

### Option B: First User Signs Up

Alternatively, the first person to sign up through the app will become a user. You can then manually update their role to 'admin' in the database.

## Step 5: Update Vercel Environment Variables

For the deployed version to work:

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these two variables:
   - Name: `VITE_SUPABASE_URL`, Value: `https://your-project-id.supabase.co`
   - Name: `VITE_SUPABASE_ANON_KEY`, Value: `your-anon-key`
5. Click **Save**
6. Redeploy the app (or push a new commit to trigger auto-deploy)

## Step 6: Test Locally

```bash
npm run dev
```

1. Open http://localhost:5173
2. You should be redirected to the login page
3. Try logging in with your admin credentials
4. If successful, you'll see the main app

## Step 7: Configure Email Settings (Optional but Recommended)

For invitation emails to work properly:

### Using Supabase's Built-in Email (Basic)

1. Go to **Authentication** → **Email Templates**
2. Supabase provides basic email sending (limited)
3. This works for testing but has restrictions

### Using Custom SMTP (Recommended for Production)

1. Go to **Authentication** → **Settings** → **SMTP Settings**
2. Configure your email provider (Gmail, SendGrid, AWS SES, etc.)
3. Example with Gmail:
   - **Host**: `smtp.gmail.com`
   - **Port**: `587`
   - **Username**: Your Gmail address
   - **Password**: App-specific password (not your Gmail password!)

**For Gmail App Password**:
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Generate an "App Password" for "Mail"
4. Use that password in SMTP settings

## Step 8: Enable Realtime (For Multi-User Collaboration)

1. Go to **Database** → **Replication**
2. Find the `projects` table
3. Enable replication by clicking the toggle
4. This allows real-time updates across users

## Verification Checklist

After setup, test these features:

### Authentication
- [ ] Can log in with admin credentials
- [ ] Session persists after page refresh
- [ ] Can log out successfully
- [ ] Protected routes redirect to login when not authenticated

### Profile Management
- [ ] Can update name and email
- [ ] Can change password
- [ ] Can upload profile photo

### Projects
- [ ] Can create new projects
- [ ] Can update existing projects
- [ ] Can delete projects
- [ ] Projects persist after page refresh

### Invitations (Admin Only)
- [ ] Can send invitation from Settings panel
- [ ] Invitation creates a record in database
- [ ] Invited user receives email (if SMTP configured)
- [ ] Signup link works and creates new user

## Troubleshooting

### "Missing Supabase environment variables"

**Problem**: `.env.local` file not found or values not set correctly

**Solution**:
- Make sure `.env.local` exists in project root
- Restart dev server after creating `.env.local`
- Check that variable names start with `VITE_`

### "JWT expired" or "Invalid token"

**Problem**: Session expired or corrupted

**Solution**:
- Log out and log back in
- Clear browser localStorage
- Check that Supabase project is active

### "Row Level Security policy violation"

**Problem**: RLS policies not set up correctly

**Solution**:
- Re-run the entire `supabase-schema.sql` file
- Make sure user is logged in
- Check user role in database (should be 'admin' or 'designer')

### Database Schema Errors

**Problem**: Tables already exist or constraint violations

**Solution**:
- If you need to start fresh, delete all tables in Supabase Dashboard → Database → Tables
- Re-run the SQL schema

### Can't Send Invitations

**Problem**: SMTP not configured or edge function not deployed

**Solution**:
- For testing: Copy the signup URL manually (it appears in the console)
- For production: Configure SMTP in Supabase settings

### Projects Not Syncing Between Users

**Problem**: Realtime not enabled

**Solution**:
- Go to Database → Replication
- Enable replication for `projects` table
- Refresh both browser windows

## Security Notes

🔒 **Never commit `.env.local` to Git** - It's already in `.gitignore`

🔒 **Use the anon key in frontend** - Never use the service role key in client code

🔒 **HTTPS only in production** - Vercel handles this automatically

🔒 **Row Level Security is enforced** - Users can only access data they're authorized for

## What Changed from Demo Version?

| Feature | Demo Version | Production Version |
|---------|--------------|-------------------|
| Authentication | Hardcoded users, universal password | Real Supabase Auth, secure passwords |
| Data Storage | localStorage only | PostgreSQL database |
| Team Members | 10 hardcoded users | Real users from database |
| Invitations | Fake toast message | Real email invitations |
| Real-time | No sync between browsers | Real-time collaboration |
| Password Change | Fake validation | Actual password updates |
| Session | Clears on browser close | Persists across sessions |

## Next Steps After Setup

1. **Invite Team Members**: Go to Settings → Invite Team Member
2. **Create First Project**: Test the full workflow
3. **Test Multi-User**: Open app in 2 browsers with different users
4. **Monitor**: Check Supabase Dashboard → Logs for any errors

## Support

If you encounter issues:

1. Check Supabase Dashboard → Logs → Edge Logs
2. Check browser console for errors (F12)
3. Check `.env.local` file has correct values
4. Verify SQL schema ran successfully

## File Structure After Setup

```
project-pulse-main/
├── .env.local                  # Your credentials (not in Git)
├── .env.example                # Template for team
├── supabase-schema.sql         # Database schema
├── SUPABASE_SETUP.md          # This file
├── src/
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── api/
│   │       └── invitations.ts # Invitation functions
│   ├── types/
│   │   └── supabase.ts        # Generated types
│   └── store/
│       └── authStore.ts        # Updated for real auth
```

---

**Ready to implement?** Continue to the next step where we'll update the authentication store and components to use Supabase instead of mock data.
