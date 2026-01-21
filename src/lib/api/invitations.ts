import { supabase } from '@/lib/supabase';
import { nanoid } from 'nanoid';

export interface InviteUserData {
  email: string;
  role: 'admin' | 'designer';
}

export async function sendInvitation(data: InviteUserData) {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Only admins can send invitations');
  }

  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', data.email)
    .single();

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Store invitation metadata to be used when user signs up
  const invitationMetadata = {
    role: data.role,
    invited_by: user.id,
    invited_at: new Date().toISOString(),
  };

  // Send magic link using Supabase Auth OTP
  const { error: magicLinkError } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
      data: invitationMetadata,
      shouldCreateUser: true,
    }
  });

  if (magicLinkError) {
    throw new Error(`Failed to send magic link: ${magicLinkError.message}`);
  }

  // Create invitation record for tracking
  const token = nanoid(32);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

  await supabase
    .from('invitations')
    .insert({
      email: data.email,
      role: data.role,
      invited_by: user.id,
      token,
      expires_at: expiresAt.toISOString(),
    });

  return {
    message: `Magic link sent to ${data.email}`,
    email: data.email,
  };
}

export async function getPendingInvitations() {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function cancelInvitation(invitationId: string) {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
}

export async function verifyInviteToken(token: string) {
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .eq('status', 'pending')
    .single();

  if (error || !invitation) {
    throw new Error('Invalid invitation token');
  }

  // Check if expired
  if (new Date(invitation.expires_at) < new Date()) {
    throw new Error('Invitation has expired');
  }

  return invitation;
}

export async function acceptInvitation(token: string, userId: string) {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'accepted' })
    .eq('token', token);

  if (error) throw error;
}
