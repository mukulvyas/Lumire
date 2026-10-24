import { createClient } from './supabaseClient';

export interface UserSession {
  userId: string;
  isAnonymous: boolean;
  email?: string;
}

/**
 * Ensures a valid session exists. If the user is unauthenticated,
 * signs in anonymously so they have an owner_id for RLS policies.
 */
export async function getOrCreateAnonymousSession(): Promise<UserSession> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    return {
      userId: session.user.id,
      isAnonymous: session.user.is_anonymous ?? false,
      email: session.user.email,
    };
  }

  // Sign in anonymously
  const { data, error } = await supabase.auth.signInAnonymously();

  if (error || !data.user) {
    // Development fallback if Supabase is offline
    const fallbackId = '00000000-0000-0000-0000-000000000001';
    return {
      userId: fallbackId,
      isAnonymous: true,
    };
  }

  return {
    userId: data.user.id,
    isAnonymous: true,
  };
}

/**
 * Links an anonymous user account with Google OAuth so their created
 * event and data are preserved under their verified Google account.
 */
export async function linkGoogleAccount(): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });

  return { error };
}
