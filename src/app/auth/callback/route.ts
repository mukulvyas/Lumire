import { NextResponse } from 'next/server';
import { createClient } from '@/server/auth/supabaseClient';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    try {
      const supabase = createClient();
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // Graceful fallback if offline or linking in test mode
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
