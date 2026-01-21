# Project Pulse - UX Project Management Platform

A collaborative project management tool designed for UX/design teams. Track projects from backlog to production with Kanban boards, real-time collaboration, and team management features.

## Features

✅ **Kanban Board** - Drag-and-drop project cards across 7 workflow stages
✅ **List View** - Alternative table view for project management
✅ **Real-Time Collaboration** - Multi-user support with live updates
✅ **Team Management** - Invite team members with role-based access (Admin/Designer)
✅ **Project Details** - Comprehensive project sheets with subtasks, assignments, and dates
✅ **User Profiles** - Profile management with avatar upload and password change
✅ **Authentication** - Secure authentication with Supabase
✅ **Email Invitations** - Invite team members via email with signup links

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Forms**: React Hook Form + Zod validation
- **Drag & Drop**: @dnd-kit
- **Deployment**: Vercel (auto-deploy on push to GitHub)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account ([https://supabase.com](https://supabase.com))
- GitHub account (for deployment)

### 1. Clone & Install

```bash
git clone https://github.com/HODapps/pulse-prod.git
cd pulse-prod
npm install
```

### 2. Set Up Supabase

**📖 See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed setup instructions.**

Quick version:

1. Get Supabase credentials (URL + anon key)
2. Create `.env.local` file with credentials
3. Run `supabase-schema.sql` in Supabase SQL Editor
4. Create admin user in Supabase Dashboard

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 4. Deploy to Vercel

```bash
./deploy.sh "Your commit message"
```

Add environment variables to Vercel:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Usage

### Login

Use the admin credentials you created in Supabase.

### Invite Team Members

1. Click your avatar → **Settings**
2. Go to **Invite Collaborators**
3. Enter email and select role (Designer/Admin)
4. Click **Invite**
5. Share the signup link (automatically copied to clipboard)

### Manage Projects

- **Create**: Click "+ New Project" button
- **Edit**: Click any project card
- **Move**: Drag cards between columns
- **Delete**: Open project → Delete button
- **Assign**: Select team member in project details
- **Subtasks**: Add/toggle subtasks in project sheet

### Profile Management

Click your avatar → **Profile** to:
- Update name and email
- Upload profile photo
- Change password

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   └── projects/          # Project components
├── lib/
│   ├── supabase.ts       # Supabase client
│   └── api/              # API functions
├── store/
│   ├── authStore.ts      # Authentication state
│   └── projectStore.ts   # Project/team state
├── types/                # TypeScript types
└── pages/                # Page components
```

## Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Detailed Supabase setup guide
- **[LOGIN_SYSTEM.md](./LOGIN_SYSTEM.md)** - Authentication documentation
- **[PROFILE_FEATURE.md](./PROFILE_FEATURE.md)** - Profile management guide

## Development Scripts

```bash
npm run dev          # Start dev server (localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
./deploy.sh "msg"    # Commit and push to GitHub
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |

See `.env.example` for template.

## Troubleshooting

### "Missing Supabase environment variables"

**Solution**: Make sure `.env.local` exists in project root with correct values. Restart dev server.

### Can't log in

**Solution**:
- Verify admin user was created in Supabase
- Check that "Auto Confirm User" was enabled
- Ensure database schema ran successfully

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for more troubleshooting.

## Security

🔒 `.env.local` is gitignored - never commit credentials
🔒 Use anon key in frontend (never service role key)
🔒 Row Level Security enforced at database level
🔒 Passwords hashed via Supabase Auth
🔒 HTTPS enforced by Vercel

## License

Private - All Rights Reserved

---

**Repository**: [https://github.com/HODapps/pulse-prod](https://github.com/HODapps/pulse-prod)

Built with ❤️ using React, Supabase, and modern web technologies.
