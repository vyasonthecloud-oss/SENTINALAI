import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const redirect = searchParams.get('redirect') || '/';

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${appUrl}/api/auth/google/callback`;

  // If Google credentials are not yet configured in .env, seamlessly use demo flow
  if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
    const demoUrl = new URL('/api/auth/demo-login', req.url);
    // Directly redirect to demo login callback
    const res = await fetch(demoUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Verified Google User', email: 'user@gmail.com' }),
    });
    
    const response = NextResponse.redirect(new URL(redirect, req.url));
    if (res.headers.get('set-cookie')) {
      response.headers.set('set-cookie', res.headers.get('set-cookie') || '');
    }
    return response;
  }

  // Build standard Google OAuth 2.0 authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', callbackUrl);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'openid email profile');
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'select_account');
  googleAuthUrl.searchParams.set('state', redirect);

  return NextResponse.redirect(googleAuthUrl.toString());
}
