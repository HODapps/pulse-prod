# 🚀 Quick Start - Supabase Setup

## Before You Begin

You need:
- ✅ Supabase account
- ✅ Supabase project created
- ✅ 5-10 minutes

---

## Step 1: Get Credentials (2 min)

1. Go to https://app.supabase.com
2. Select your project
3. Click **Settings** → **API**
4. Copy:
   - 📋 Project URL (e.g., `https://xxxxx.supabase.co`)
   - 📋 anon/public key (starts with `eyJ...`)

---

## Step 2: Create .env.local (1 min)

Create `.env.local` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Replace with YOUR actual credentials from Step 1!

---

## Step 3: Run Database Schema (2 min)

1. Supabase Dashboard → **SQL Editor**
2. Click **New Query**
3. Copy ALL contents from `supabase-schema.sql`
4. Paste and click **Run**
5. Should see: ✅ "Success. No rows returned"

---

## Step 4: Create Admin User (2 min)

1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - Email: your-email@example.com
   - Password: (your secure password)
   - ⚠️ **Auto Confirm User**: ✅ **MUST CHECK THIS**
4. Click **Create user**

---

## Step 5: Test Locally (1 min)

```bash
npm run dev
```

1. Open http://localhost:5173
2. Login with your admin credentials
3. 🎉 Success!

---

## Step 6: Deploy to Vercel (2 min)

### Add Environment Variables

1. Go to https://vercel.com
2. Your project → **Settings** → **Environment Variables**
3. Add:
   - `VITE_SUPABASE_URL` = (your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (your anon key)
4. Click **Save**

### Deploy

```bash
./deploy.sh "Add Supabase authentication"
```

---

## ✅ Done!

Your app now has:
- ✅ Real authentication
- ✅ Database persistence
- ✅ Invitation system
- ✅ Multi-user support

---

## 🧪 Quick Test

After setup:

1. **Login** - Use admin credentials ✓
2. **Settings** → **Invite Collaborators** ✓
3. **Add email** → Click **Invite** ✓
4. **Copy signup link** (auto-copied) ✓
5. **Open link in incognito** → Create account ✓
6. **Login as new user** ✓

---

## 🆘 Having Issues?

### Can't login?
- Check user exists in Supabase → Authentication → Users
- Verify "Auto Confirm User" was checked
- Try resetting password in Supabase

### "Missing environment variables"?
- `.env.local` must be in project root
- Check spelling: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after creating file

### Profile error?
- Make sure database schema ran successfully
- Check Supabase → Table Editor → users table exists

**More help**: See `SUPABASE_SETUP.md` for detailed troubleshooting

---

## 📚 Full Documentation

- **Detailed Guide**: `SUPABASE_SETUP.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Project README**: `README.md`

---

**Questions?** Check the troubleshooting section in `SUPABASE_SETUP.md`

**Ready to invite your team?** Login → Settings → Invite Collaborators 🎉
