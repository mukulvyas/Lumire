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
 * Signs in with Google OAuth. If the user already has an active anonymous
 * session, it attempts to link their identity to preserve their plan data.
 */
export async function signInWithGoogle(): Promise<{ error: Error | null }> {
  const supabase = createClient();
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined;

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    // Only attempt linkIdentity if the user is already authenticated as an anonymous user
    if (session?.user && session.user.is_anonymous) {
      const { data, error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: { redirectTo },
      });
      if (!error) {
        if (data?.url && typeof window !== 'undefined') {
          window.location.href = data.url;
        }
        return { error: null };
      }
    }
  } catch {
    // Session check / linking failed, fall through to signInWithOAuth
  }

  // Standard Google OAuth sign-in (for unauthenticated or standard users)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });

  if (error) {
    return { error };
  }

  if (data?.url && typeof window !== 'undefined') {
    window.location.href = data.url;
  }

  return { error: null };
}

export const linkGoogleAccount = signInWithGoogle;
