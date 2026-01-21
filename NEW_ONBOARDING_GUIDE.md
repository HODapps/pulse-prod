# New Onboarding Journey - Implementation Guide

## Overview

The new onboarding system replaces the sample projects/fake data approach with a structured admin-first setup wizard and real user management with activity tracking.

## Key Changes

### 1. No More Fake Data
- ❌ Removed `SAMPLE_PROJECTS` array
- ❌ Removed `TEAM_MEMBERS` array
- ✅ All data now comes from Supabase database
- ✅ Empty initial state for clean start

### 2. Admin-First Onboarding
- Admin user created manually in Supabase with `role='admin'`
- First login triggers Board Setup Wizard
- Wizard collects: Board Name, Team Title, Project Color
- Settings stored in `board_settings` table

### 3. Magic Link Invitations
- Replaced token-based signup with Supabase OTP magic links
- Admins send invitations via Settings → Invite Collaborators
- Magic link sent directly to collaborator's email
- No more manual token/URL copying

### 4. User Status Tracking
- Three states: `pending`, `active`, `inactive`
- New users start as `pending`
- Status changes to `active` on first login
- Activity tracked via `last_active_at` timestamp
- Auto-updates every 2 minutes when user is active

### 5. Real Collaborator Management
- Team members list shows real users from database
- Active/inactive status indicators (green/gray dots)
- Admin can edit roles (Admin/Designer)
- Admin can remove collaborators (except themselves)
- Only shows invited users with authentication status

---

## Database Schema Updates

### New Tables

#### `board_settings`
```sql
CREATE TABLE board_settings (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES users(id),
  board_name TEXT NOT NULL,
  team_title TEXT NOT NULL,
  project_color TEXT DEFAULT '160 84% 39%',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### Updated Tables

#### `users` (added fields)
```sql
ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending';
ALTER TABLE users ADD COLUMN last_active_at TIMESTAMPTZ;
```

---

## Setup Steps

### Step 1: Update Database Schema

Run the updated `supabase-schema.sql` in Supabase SQL Editor:

```bash
# Location: /supabase-schema.sql
```

This will:
- Add `board_settings` table
- Add `status` and `last_active_at` columns to `users` table
- Create necessary indexes and RLS policies
- Set up triggers for auto-updates

### Step 2: Create Admin User

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Fill in:
   - Email: `admin@yourcompany.com`
   - Password: (secure password)
   - **Auto Confirm User**: ✅ **MUST CHECK**
4. Click **Create user**

5. Update user role to admin:
   ```sql
   UPDATE users
   SET role = 'admin'
   WHERE email = 'admin@yourcompany.com';
   ```

### Step 3: Configure Email Templates (Optional)

For magic link emails to work in production:

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize the "Magic Link" template
3. Make sure the template includes the magic link button/URL

---

## User Journey Flows

### Admin Journey (First Time)

1. **Navigate to app** → Redirected to `/auth/login`
2. **Enter credentials** → Click "Sign In"
3. **Login successful** → Check for `board_settings`
4. **No board settings found** → Show `BoardSetupWizard`
5. **Step 1: Board Name** → Enter name (e.g., "Product Design Hub")
6. **Step 2: Team Title** → Enter title (e.g., "Design Team")
7. **Step 3: Project Color** → Select color theme
8. **Complete Setup** → Save to database, set status to `active`
9. **Redirected to board** → Empty board (no projects yet)
10. **Create first project** → Use "+ New Project" button

### Admin Journey (Inviting Collaborators)

1. **Click Settings icon** (in header)
2. **Scroll to "Invite Collaborators"** section
3. **Enter collaborator email** → Select role (Admin/Designer)
4. **Click "Invite"** → Magic link sent to email
5. **Toast notification** → "Magic link sent to user@example.com"
6. **Collaborator receives email** → Contains magic link button
7. **Collaborator status** → Shows as "Pending" in team members list

### Collaborator Journey

1. **Receive invitation email** from admin
2. **Click magic link** in email
3. **Redirected to app** → Auto-authenticated
4. **Supabase creates account** → User profile created with invited role
5. **Status updated to "Active"** → Timestamp recorded
6. **Redirected to board** → See existing projects (if any)
7. **Can create projects** → Based on permissions

---

## Features

### Board Setup Wizard

**Component**: `src/components/onboarding/BoardSetupWizard.tsx`

**Features**:
- 3-step wizard with progress indicator
- Step 1: Board name input with validation
- Step 2: Team title input with validation
- Step 3: Color picker with 6 theme options
- Saves to `board_settings` table
- Updates user status to `active`
- Applies selected color to UI immediately
- Keyboard navigation (Enter to proceed)

**Triggers**:
- Shows automatically if admin user has no board_settings
- Can only be shown once per admin
- Blocks access to board until completed

### Settings Sheet (Redesigned)

**Component**: `src/components/projects/SettingsSheet.tsx`

**Admin Features**:
- Edit team title (saved to database)
- Change project color (saved to database)
- Invite collaborators via magic link
- View all team members with status
- Edit member roles (Admin/Designer)
- Remove team members (except self)

**All Users Features**:
- Toggle dark mode
- Copy share link

**Team Members Display**:
- Real users from database
- Avatar with initials and color
- Name and role
- Status indicator:
  - 🟢 Green dot = Active
  - 🟡 Yellow dot = Pending (not logged in yet)
  - ⚪ Gray dot = Inactive
- Role badge (Admin/Designer)

### Activity Tracking

**Hook**: `src/hooks/useActivityTracker.ts`

**How it works**:
- Runs automatically when user is authenticated
- Updates `last_active_at` every 2 minutes
- Also updates on user interactions:
  - Mouse movement
  - Keyboard input
  - Clicks
  - Scrolling
- Sets `status` to `active`
- Throttled to prevent excessive database writes

**Inactive Detection**:
- Users with no activity for 5+ minutes → Status can be manually changed to `inactive`
- No automatic inactive status (requires admin action)

### Magic Link Invitations

**API**: `src/lib/api/invitations.ts`

**Flow**:
1. Admin enters email and role
2. System checks if email already exists
3. Creates invitation record in database
4. Sends OTP magic link via Supabase Auth
5. Email contains clickable magic link
6. Link includes invitation metadata (role, invited_by)
7. On click, user is auto-authenticated
8. Profile created with correct role

**Benefits over Token System**:
- No manual URL copying
- More secure (built into Supabase)
- Better email deliverability
- Auto-expires after 7 days
- Handles edge cases (already registered, etc.)

---

## Environment Variables

No new environment variables needed. Existing ones:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Testing Checklist

### Admin Setup
- [ ] Create admin user in Supabase
- [ ] Update role to 'admin' in database
- [ ] Login redirects to board (if already setup) or wizard (if first time)
- [ ] Complete wizard saves board_settings
- [ ] Selected color applies to UI
- [ ] User status changes to 'active'

### Invitations
- [ ] Admin can see "Invite Collaborators" section
- [ ] Enter email and select role
- [ ] Click "Invite" sends magic link
- [ ] Toast notification confirms send
- [ ] Email received with magic link button
- [ ] Click link authenticates user
- [ ] User profile created with correct role
- [ ] User appears in team members list

### Team Management
- [ ] Team members list shows real users
- [ ] Status indicators display correctly
- [ ] Admin can change member roles
- [ ] Role changes save to database
- [ ] Admin can remove members (not self)
- [ ] Removed users deleted from auth

### Activity Tracking
- [ ] User status changes to 'active' on login
- [ ] `last_active_at` updates periodically
- [ ] Activity tracked on interactions
- [ ] Inactive users show gray dot
- [ ] Active users show green dot

### Permissions
- [ ] Only admins see board setup wizard
- [ ] Only admins can invite users
- [ ] Only admins can edit team title/color
- [ ] Only admins can change roles
- [ ] Only admins can remove members
- [ ] Designers can create/edit projects
- [ ] All users can toggle dark mode

---

## Known Limitations

1. **Magic Links in Development**:
   - Supabase may not send emails in local development
   - Use email testing service (Mailtrap, etc.) for testing
   - Or configure SMTP settings in Supabase

2. **Status Auto-Update**:
   - No automatic inactive status
   - Admins must manually change status if needed
   - Could add cron job to auto-mark inactive users

3. **Single Board**:
   - Currently supports one board per installation
   - `board_settings` doesn't have multi-team support yet
   - Future: Add team_id to support multiple boards

4. **No Email Notifications**:
   - Magic link is the only email
   - No notifications for project updates
   - Future: Add notification system

---

## Troubleshooting

### "Board setup wizard keeps appearing"

**Cause**: `board_settings` record not created

**Fix**:
```sql
SELECT * FROM board_settings;
-- If empty, the wizard will show again
-- Check if insert succeeded in BoardSetupWizard
```

### "Invitation emails not being sent"

**Cause**: Supabase SMTP not configured

**Fix**:
1. Supabase Dashboard → Settings → Auth
2. Scroll to "SMTP Settings"
3. Configure email service or use Supabase's default

### "User status shows 'pending' after login"

**Cause**: Status update failed in authStore

**Fix**:
- Check browser console for errors
- Verify RLS policies allow user updates
- Manually update:
  ```sql
  UPDATE users SET status = 'active' WHERE id = 'user-id';
  ```

### "Can't remove team member"

**Cause**: Using `supabase.auth.admin.deleteUser()` requires service role

**Fix**:
- Remove user deletion feature for now
- Or use Supabase Edge Function with service role
- Or admins delete manually in Supabase Dashboard

---

## File Changes Summary

### New Files
- `src/components/onboarding/BoardSetupWizard.tsx` - Setup wizard
- `src/hooks/useActivityTracker.ts` - Activity tracking hook
- `src/components/projects/SettingsSheet.tsx` - Redesigned settings (replaced old)

### Modified Files
- `supabase-schema.sql` - Added board_settings table, user status fields
- `src/types/supabase.ts` - Added board_settings types, user status
- `src/types/project.ts` - Added status and last_active_at to TeamMember
- `src/lib/api/invitations.ts` - Changed to magic links (removed token)
- `src/store/projectStore.ts` - Removed fake data, empty initial state
- `src/store/authStore.ts` - Update status on login
- `src/pages/Index.tsx` - Use BoardSetupWizard, activity tracker

### Deprecated/Removed
- `src/components/onboarding/WelcomeModal.tsx` - No longer used
- `addSampleProjects()` function - Deprecated but kept for compatibility

---

## Migration Notes

If you have existing users/data:

1. **Backup first**: Export existing data
2. **Run schema updates**: Apply new SQL migrations
3. **Update existing users**:
   ```sql
   UPDATE users SET status = 'active' WHERE id IN (SELECT id FROM users);
   UPDATE users SET last_active_at = NOW() WHERE id IN (SELECT id FROM users);
   ```
4. **Create board_settings**:
   ```sql
   INSERT INTO board_settings (owner_id, board_name, team_title, project_color)
   VALUES (
     (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
     'Project Pulse',
     'Design Team',
     '160 84% 39%'
   );
   ```
5. **Clear localStorage**: Users may need to clear browser storage

---

## Future Enhancements

1. **Multi-Board Support**: Multiple teams/boards per installation
2. **Email Notifications**: Notify on project updates, mentions
3. **User Profiles**: Extended profiles with avatars, bios
4. **Invitation Tracking**: See pending invitations, resend
5. **Auto-Inactive**: Cron job to mark inactive users
6. **Audit Log**: Track who changed what and when
7. **Role Permissions**: More granular permission system
8. **Onboarding Tour**: Interactive guide for new users

---

## Questions?

Check the troubleshooting section or reach out with any issues during setup.
