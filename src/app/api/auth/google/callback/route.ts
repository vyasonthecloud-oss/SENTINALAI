import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';
import { Role } from '@/types/database';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state') || '/';
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectTarget = new URL(state, appUrl);

  if (error || !code) {
    console.error('Google OAuth callback error:', error || 'No authorization code');
    return NextResponse.redirect(new URL('/login?error=GoogleAuthFailed', appUrl));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackUrl = `${appUrl}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=GoogleAuthNotConfigured', appUrl));
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    if (!tokenRes.ok || !tokens.access_token) {
      console.error('Failed to exchange Google token:', tokens);
      return NextResponse.redirect(new URL('/login?error=TokenExchangeFailed', appUrl));
    }

    // 2. Fetch authenticated Google profile
    const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleProfile = await userinfoRes.json();

    if (!userinfoRes.ok || !googleProfile.email) {
      console.error('Failed to fetch Google user profile:', googleProfile);
      return NextResponse.redirect(new URL('/login?error=ProfileFetchFailed', appUrl));
    }

    const email = googleProfile.email.toLowerCase().trim();
    const name = googleProfile.name || googleProfile.given_name || 'Google User';

    // 3. Find or create user in Prisma DB
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const randomPassword = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: randomPassword,
          role: Role.USER,
        },
      });
    }

    // 4. Issue authenticated session cookie and redirect
    const response = NextResponse.redirect(redirectTarget);
    setSessionCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return response;
  } catch (err) {
    console.error('Unhandled Google OAuth error:', err);
    return NextResponse.redirect(new URL('/login?error=OAuthError', appUrl));
  }
}
