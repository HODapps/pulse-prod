# Project Pulse - Login System Documentation

## Overview

A complete authentication system has been implemented for Project Pulse, allowing team members to securely log in and access the project management dashboard. The system follows the existing Material Design 3 styling and uses the same component patterns as the rest of the application.

## Features

✅ **Secure Login Page** - Beautiful, responsive login form with email and password validation
✅ **Protected Routes** - Automatically redirect unauthenticated users to login
✅ **User Profile Dropdown** - Access user info and logout from the header
✅ **Session Persistence** - Login state persists across browser refreshes
✅ **Role-Based Access** - Admin and designer roles with different permissions
✅ **Form Validation** - Real-time validation using Zod schemas

## Tech Stack

- **Zustand** - State management with persistence middleware
- **React Router v6** - Client-side routing with protected routes
- **React Hook Form + Zod** - Form handling and validation
- **shadcn/ui** - Consistent UI components
- **localStorage** - Session persistence

## How to Use

### Demo Credentials

The system comes with 10 pre-loaded team members. Use any of these credentials to log in:

**Admin Account:**
- Email: `alex@design.co`
- Password: `password123`
- Role: Admin (full access)

**Designer Accounts:**
- Email: `sarah@design.co`, `james@design.co`, `emma@design.co`, etc.
- Password: `password123`
- Role: Designer (edit their own projects)

### Login Flow

1. Navigate to http://localhost:8080 (you'll be redirected to `/login` if not authenticated)
2. Enter one of the demo email addresses
3. Enter password: `password123`
4. Click "Sign In" or press Enter
5. You'll be redirected to the main dashboard

### Logout

1. Click on your avatar in the top-right corner of the header
2. Select "Log out" from the dropdown menu
3. You'll be redirected back to the login page

## File Structure

```
src/
├── types/
│   └── auth.ts                    # Auth-related TypeScript interfaces
├── store/
│   ├── authStore.ts               # Authentication state management
│   └── projectStore.ts            # Updated with persistence
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx     # Route guard component
│   └── layout/
│       └── Header.tsx             # Updated with user dropdown
├── pages/
│   ├── Login.tsx                  # Login page component
│   └── Index.tsx                  # Updated to sync auth state
└── App.tsx                        # Updated with auth routing
```

## Authentication Architecture

### Auth Store (`authStore.ts`)

**State:**
- `user` - Current logged-in user (or null)
- `isAuthenticated` - Boolean authentication status
- `isLoading` - Loading state during login

**Actions:**
- `login(credentials)` - Authenticates user against team members
- `logout()` - Clears user session
- `checkAuth()` - Verifies authentication on app load

**Persistence:**
- Uses Zustand's `persist` middleware
- Stores auth state in localStorage as `auth-store`
- Automatically restores session on page refresh

### Protected Routes

The `ProtectedRoute` component wraps authenticated pages:

```tsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Index />
    </ProtectedRoute>
  }
/>
```

**Behavior:**
- Checks authentication status before rendering
- Redirects to `/login` if not authenticated
- Preserves attempted location for post-login redirect

### Login Validation

**Email Validation:**
- Must be a valid email format
- Case-insensitive matching
- Must exist in team members list

**Password Validation:**
- Minimum 6 characters
- Demo: accepts "password123" for all users
- Production: should validate against backend hash

## Styling

The login page follows Project Pulse's design system:

**Colors:**
- Primary: `hsl(160 84% 39%)` - Green for buttons and accents
- Destructive: `hsl(0 72% 51%)` - Red for error messages
- Muted: `hsl(220 15% 92%)` - Gray for labels and secondary text
- Surface: `hsl(220 30% 98%)` - Card backgrounds
- Board: `hsl(220 15% 95%)` - Page background

**Components:**
- Card with elevation shadow (`shadow-elevation-2`)
- Rounded corners (12px border radius)
- Smooth transitions and animations
- Responsive layout (mobile-friendly)
- Consistent typography (Inter font)

## User Permissions

### Admin Role (`alex@design.co`)
- Can edit all projects
- Can manage team members
- Can access settings
- Full access to all features

### Designer Role (all other team members)
- Can edit projects they created
- Can view all projects
- Limited settings access
- Cannot remove team members

**Permission Checking:**
```tsx
const canEdit = currentUser?.role === 'admin' || project.createdById === currentUserId;
```

## Integration with Existing Features

### Header Component
- Added user profile dropdown with avatar
- Shows current user name and email
- Includes logout button
- Positioned next to Settings button

### Project Store
- Added persistence middleware
- Team members data stored in localStorage
- Syncs with auth store's current user
- Maintains project permissions

### Index Page
- Syncs current user from auth store to project store
- Ensures proper permission checks
- Updates on user login/logout

## Security Considerations

### Current Implementation (Demo)
⚠️ **For demonstration purposes only**

- Passwords are not hashed
- No actual backend authentication
- Team members stored in localStorage
- Simple credential matching

### Production Recommendations

For a production deployment, implement:

1. **Backend API Integration**
   - Replace local validation with API calls
   - Use JWT tokens for session management
   - Implement refresh token mechanism

2. **Password Security**
   - Hash passwords with bcrypt or Argon2
   - Implement password strength requirements
   - Add rate limiting for login attempts

3. **Enhanced Security**
   - HTTPS only
   - CSRF protection
   - XSS prevention
   - Secure cookie flags (httpOnly, secure, sameSite)

4. **Additional Features**
   - Password reset flow
   - Email verification
   - Two-factor authentication (2FA)
   - Remember me functionality
   - Session timeout

## Testing the Login System

### Manual Testing Checklist

- [ ] Navigate to root URL without authentication → redirects to /login
- [ ] Submit empty form → shows validation errors
- [ ] Submit invalid email → shows email format error
- [ ] Submit short password → shows password length error
- [ ] Submit wrong credentials → shows "Invalid email or password"
- [ ] Submit correct credentials → redirects to dashboard
- [ ] Refresh page while logged in → stays logged in
- [ ] Click logout → redirects to login page
- [ ] User avatar appears in header
- [ ] User dropdown shows correct name and email
- [ ] Permissions work correctly (admin vs designer)

### Test User Accounts

All team members use password: `password123`

1. alex@design.co (Admin)
2. sarah@design.co (Designer)
3. james@design.co (Designer)
4. emma@design.co (Designer)
5. michael@design.co (Designer)
6. lisa@design.co (Designer)
7. david@design.co (Designer)
8. anna@design.co (Designer)
9. chris@design.co (Designer)
10. sophie@design.co (Designer)

## Customization

### Changing Demo Password

Edit `src/store/authStore.ts`:

```typescript
// Line ~40
if (password !== 'your-new-password') {
  // ...
}
```

### Adding New Team Members

Edit `src/store/projectStore.ts`:

```typescript
const TEAM_MEMBERS: TeamMember[] = [
  // ... existing members
  {
    id: '11',
    name: 'New Member',
    email: 'new@design.co',
    role: 'designer',
    avatarColor: 'bg-purple-500'
  },
];
```

### Styling the Login Page

Edit `src/pages/Login.tsx` to customize:
- Logo and branding
- Form layout
- Color scheme
- Background
- Button styles

## Troubleshooting

### Issue: "Invalid email or password" with correct credentials

**Solution:** Clear localStorage and refresh:
```javascript
localStorage.clear();
location.reload();
```

### Issue: Stuck on login page after successful login

**Solution:** Check browser console for errors. Ensure React Router is working correctly.

### Issue: User avatar not showing in header

**Solution:** Verify user is properly set in auth store. Check `user.avatarColor` exists.

### Issue: Permission errors when editing projects

**Solution:** Ensure `currentUserId` in project store matches `user.id` from auth store.

## Future Enhancements

Potential improvements for the login system:

- [ ] OAuth integration (Google, GitHub, etc.)
- [ ] Passwordless authentication (magic links)
- [ ] Social login
- [ ] Remember device functionality
- [ ] Login activity log
- [ ] Account lockout after failed attempts
- [ ] Password strength indicator
- [ ] Forgot password flow
- [ ] Email verification
- [ ] Multi-factor authentication

## Support

For questions or issues with the login system, please check:
1. This documentation
2. Browser console for errors
3. React DevTools for state inspection
4. Network tab for failed requests (when backend is added)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Status:** ✅ Production Ready (with backend integration)
