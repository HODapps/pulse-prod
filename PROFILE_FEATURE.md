# Project Pulse - Profile Management Feature

## Overview

A comprehensive user profile management panel has been added to Project Pulse, allowing users to update their personal information, upload profile photos, and change their passwords. The ProfileSheet follows the same Material Design 3 styling and patterns as the existing SettingsSheet.

## Features

✅ **Profile Photo Upload** - Upload custom profile photos (up to 5MB)
✅ **Name Update** - Change your display name
✅ **Email Update** - Update your email address
✅ **Password Change** - Secure password update with validation
✅ **Real-time Validation** - Form validation using Zod schemas
✅ **Auto-save** - Profile changes are saved automatically with toast notifications
✅ **Avatar Preview** - See your photo before uploading
✅ **Role Display** - View your account role (Admin/Designer)

## How to Access

1. **Login** to your account
2. **Click your avatar** in the top-right corner of the header
3. **Select "Profile"** from the dropdown menu
4. The Profile panel will slide in from the right

## Profile Sections

### 1. Profile Photo

**Location:** Top of the profile panel

**Features:**
- Click the camera icon on your avatar to upload a new photo
- Supported formats: JPG, PNG, GIF, WebP, etc.
- Maximum file size: 5MB
- Instant preview after upload
- Photos are stored in localStorage (base64 encoded)

**How to Update:**
1. Click the camera icon 📷 on your avatar
2. Select an image file from your device
3. Photo is automatically uploaded and updated
4. Success notification appears

**Validation:**
- Only image files accepted
- Files larger than 5MB are rejected
- Invalid file types show error message

---

### 2. Profile Information

**Location:** Middle section of the profile panel

**Fields:**
- **Full Name:** Your display name (minimum 2 characters)
- **Email Address:** Your email (must be valid email format)

**How to Update:**
1. Edit the name or email field
2. The "Save Changes" button appears when you make edits
3. Click "Save Changes"
4. Success notification confirms the update

**Validation:**
- Name must be at least 2 characters
- Email must be valid format (user@domain.com)
- Real-time validation shows errors inline

---

### 3. Change Password

**Location:** Lower section of the profile panel

**Fields:**
- **Current Password:** Your existing password (for verification)
- **New Password:** Your new password (minimum 6 characters)
- **Confirm New Password:** Re-enter new password (must match)

**How to Update:**
1. Enter your current password
2. Enter your new password
3. Confirm the new password
4. Click "Update Password"
5. Success notification confirms the change

**Validation:**
- All fields required (minimum 6 characters)
- New password must match confirm password
- Current password must be correct (validates against "password123" in demo)
- Clear error messages for validation failures

**Security Notes:**
- Demo accepts "password123" as current password for all users
- In production, implement proper password hashing
- Current password verification prevents unauthorized changes

---

### 4. Account Information

**Location:** Bottom of the profile panel

**Displays:**
- **Role:** Admin or Designer
- **User ID:** Unique identifier

**Note:** This section is read-only for informational purposes.

---

## File Structure

```
src/
├── components/
│   └── auth/
│       └── ProfileSheet.tsx       # Main profile panel component
├── store/
│   └── authStore.ts               # Updated with updateProfile()
├── pages/
│   └── Index.tsx                  # Integrated ProfileSheet
└── components/layout/
    └── Header.tsx                 # Profile menu item made clickable
```

## State Management

### Auth Store Updates

**New Action:**
```typescript
updateProfile: (updates: Partial<User>) => void
```

**Usage:**
```typescript
const { updateProfile } = useAuthStore();

updateProfile({
  name: 'New Name',
  email: 'newemail@design.co',
  avatar: 'data:image/png;base64,...'
});
```

**Persistence:**
- All profile updates are persisted to localStorage
- User data syncs across all components
- Avatar images stored as base64 strings
- Session persists across browser refreshes

---

## Component Architecture

### ProfileSheet Component

**Props:**
```typescript
interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Key Features:**
- Uses React Hook Form for form management
- Zod schemas for validation
- Separate forms for profile info and password
- File upload with image preview
- Auto-save with debounced toast notifications
- Consistent with SettingsSheet design patterns

**Form Schemas:**

**Profile Schema:**
```typescript
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
});
```

**Password Schema:**
```typescript
const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
  confirmPassword: z.string().min(6),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

---

## Styling & Design

The ProfileSheet follows Project Pulse's design system:

**Colors:**
- Primary buttons: `bg-primary` (Green #10b981)
- Destructive alerts: `bg-destructive` (Red)
- Success alerts: `border-primary bg-primary/5`
- Muted text: `text-muted-foreground`

**Layout:**
- Sheet width: `sm:max-w-md` (448px on desktop)
- Spacing: Consistent 6-unit gap between sections
- Separators: Between each major section
- Avatar size: `h-20 w-20` (80px)

**Components Used:**
- Sheet (side panel container)
- Input (text fields)
- Button (primary and outline variants)
- Label (form labels)
- Avatar (profile photo display)
- Alert (error and success messages)
- Separator (visual section dividers)

---

## Image Upload Details

### Technical Implementation

**File Input:**
- Hidden input with `accept="image/*"`
- Triggered by camera button click
- Reference stored with `useRef`

**Preview Generation:**
```typescript
const reader = new FileReader();
reader.onloadend = () => {
  const imageUrl = reader.result as string; // base64
  setAvatarPreview(imageUrl);
  updateProfile({ avatar: imageUrl });
};
reader.readAsDataURL(file);
```

**Validation:**
1. Check file type (`file.type.startsWith('image/')`)
2. Check file size (max 5MB: `file.size > 5 * 1024 * 1024`)
3. Show error toast if validation fails

**Storage:**
- Avatar stored as base64 in user object
- Persisted to localStorage via Zustand persist middleware
- Automatically synced across all components showing user avatar

---

## User Flow Examples

### Updating Profile Name

1. User opens Profile panel
2. Clicks on "Full Name" field
3. Changes name from "Alex Chen" to "Alex Chen Jr."
4. "Save Changes" button appears
5. Clicks "Save Changes"
6. Toast notification: "Profile updated - Your profile information has been updated."
7. Name updates in header avatar dropdown immediately

### Uploading Profile Photo

1. User opens Profile panel
2. Clicks camera icon on avatar
3. File picker opens
4. Selects photo (e.g., headshot.jpg - 2.3MB)
5. Photo uploads and preview appears
6. Toast notification: "Profile photo updated"
7. Avatar in header updates with new photo
8. Photo persists after page refresh

### Changing Password

1. User opens Profile panel
2. Scrolls to "Change Password" section
3. Enters current password: "password123"
4. Enters new password: "NewSecure123!"
5. Confirms new password: "NewSecure123!"
6. Clicks "Update Password"
7. Success alert appears: "Password successfully updated!"
8. Form fields clear
9. Toast notification: "Password changed"

### Error Handling

**Invalid Email:**
- User enters "invalidemail"
- Red border appears on email field
- Error message: "Please enter a valid email address"
- "Save Changes" button remains disabled

**Password Mismatch:**
- User enters new password: "Test123"
- User enters confirm: "Test456"
- Error on confirm field: "Passwords don't match"
- Cannot submit form

**File Too Large:**
- User selects 8MB image
- Toast error: "File too large - Please select an image smaller than 5MB"
- File picker closes, no upload occurs

---

## Testing Checklist

### Profile Photo
- [ ] Click camera icon opens file picker
- [ ] Upload JPG image under 5MB → success
- [ ] Upload PNG image under 5MB → success
- [ ] Try to upload 6MB image → error
- [ ] Try to upload PDF file → error
- [ ] Avatar updates in header immediately
- [ ] Photo persists after page refresh

### Profile Information
- [ ] Change name → "Save Changes" button appears
- [ ] Save name → toast notification appears
- [ ] Name updates in header dropdown
- [ ] Change email to invalid format → validation error
- [ ] Change email to valid format → saves successfully
- [ ] Refresh page → changes persist

### Password Change
- [ ] Enter wrong current password → error message
- [ ] Enter passwords that don't match → validation error
- [ ] Enter passwords under 6 characters → validation error
- [ ] Successfully change password → success alert
- [ ] Form fields clear after success
- [ ] Toast notification appears

### General
- [ ] Profile panel opens from header dropdown
- [ ] Close button (X) closes panel
- [ ] Click outside panel closes it
- [ ] All sections visible without scrolling issues
- [ ] Responsive on mobile devices
- [ ] Consistent styling with SettingsSheet

---

## Integration with Existing Features

### Header Component
- Profile menu item now functional (was previously placeholder)
- Opens ProfileSheet when clicked
- Shows user's current avatar and info

### Auth Store
- Added `updateProfile()` action
- Profile updates persist with existing user session
- Avatar syncs across all components

### Project Store
- Current user ID syncs from auth store
- Name changes reflect in project assignee displays
- Avatar updates appear in team member lists

---

## Production Recommendations

For production deployment, enhance the profile feature with:

### Backend Integration

1. **API Endpoints:**
   ```
   PUT /api/user/profile        - Update name and email
   PUT /api/user/avatar         - Upload profile photo
   PUT /api/user/password       - Change password
   ```

2. **File Upload:**
   - Use multipart/form-data for avatar uploads
   - Store images on S3/CloudStorage (not base64 in DB)
   - Generate thumbnail versions (50x50, 200x200)
   - Return image URLs instead of base64

3. **Password Security:**
   - Hash passwords with bcrypt (10+ rounds)
   - Verify current password hash on server
   - Enforce password strength requirements
   - Add rate limiting on password change endpoint
   - Email notification when password changes

4. **Email Verification:**
   - Send verification email when email changes
   - Require confirmation before updating
   - Keep old email until verified

5. **Validation:**
   - Server-side validation (don't trust client)
   - Check email uniqueness
   - Sanitize user inputs
   - Validate image file types on server

### Additional Features

- [ ] Crop/resize images before upload
- [ ] Gravatar integration as fallback
- [ ] Profile completeness indicator
- [ ] Two-factor authentication setup
- [ ] Account deletion option
- [ ] Data export (GDPR compliance)
- [ ] Activity log (recent logins, changes)
- [ ] Notification preferences
- [ ] Privacy settings
- [ ] Connected accounts (OAuth)

---

## Customization

### Changing Avatar Size

Edit `ProfileSheet.tsx` line ~170:
```typescript
<Avatar className={cn("h-20 w-20", user.avatarColor)}>
```
Change to: `h-24 w-24` for 96px, or any Tailwind size class.

### Changing Max File Size

Edit `ProfileSheet.tsx` line ~103:
```typescript
if (file.size > 5 * 1024 * 1024) {
```
Change `5` to desired max MB.

### Adding Profile Fields

1. Update User type in `types/auth.ts`
2. Add to profileSchema in `ProfileSheet.tsx`
3. Add form field in Profile Information section
4. Update updateProfile call

Example - Add phone number:
```typescript
// types/auth.ts
export interface User extends TeamMember {
  phone?: string;
}

// ProfileSheet.tsx schema
const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
});

// Add field
<Input
  id="phone"
  {...registerProfile('phone')}
  placeholder="Phone number"
/>
```

---

## Troubleshooting

### Issue: Profile photo not showing after upload

**Solution:** Check browser console for errors. Ensure:
- File is valid image format
- File under 5MB
- localStorage not full (clear if needed)

### Issue: Changes not persisting after refresh

**Solution:** Zustand persist middleware may have failed. Check:
- localStorage is enabled in browser
- No localStorage quota exceeded
- Clear `auth-store` key and re-login

### Issue: Can't change password

**Solution:** For demo, current password must be "password123". In production, implement proper backend validation.

### Issue: Profile panel not opening

**Solution:** Check:
- User is logged in (auth state)
- Header dropdown working correctly
- No JavaScript errors in console
- ProfileSheet imported in Index.tsx

---

## Summary

The Profile feature provides a complete user profile management experience with:
- ✅ Photo upload and preview
- ✅ Profile information editing
- ✅ Secure password changes
- ✅ Consistent design with existing UI
- ✅ Real-time validation
- ✅ Persistent storage
- ✅ Toast notifications

**Status:** ✅ Production Ready (with backend integration)

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Component:** ProfileSheet.tsx
