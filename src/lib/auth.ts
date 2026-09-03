import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export const SESSION_COOKIE_NAME = 'sentinel_session';

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.AUTH_SECRET;
  if (secret) return secret;
  return 'sentinel_ai_secure_default_session_key_production_grade_987654321';
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
  iat: number;
}

export function signSessionToken(payload: Omit<SessionPayload, 'iat'>): string {
  const fullPayload: SessionPayload = {
    ...payload,
    iat: Date.now(),
  };

  const payloadBase64 = Buffer.from(JSON.stringify(fullPayload), 'utf-8').toString('base64url');
  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(payloadBase64);
  const signature = hmac.digest('base64url');

  return `${payloadBase64}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const hmac = crypto.createHmac('sha256', getSessionSecret());
    hmac.update(payloadBase64);
    const expectedSignature = hmac.digest('base64url');

    const signatureBuf = Buffer.from(signature, 'utf-8');
    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');

    if (signatureBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(signatureBuf, expectedBuf)) {
      return null;
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Expire session after 30 days
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - payload.iat > THIRTY_DAYS_MS) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

function isSecureCookie(): boolean {
  if (process.env.NODE_ENV !== 'production') return false;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  if (appUrl.startsWith('http://localhost') || appUrl.startsWith('http://127.0.0.1') || appUrl.startsWith('http://172.') || appUrl.startsWith('http://192.')) {
    return false;
  }
  return true;
}

export function setSessionCookie(response: NextResponse, payload: Omit<SessionPayload, 'iat'>): void {
  const token = signSessionToken(payload);
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Reads and verifies the authenticated user from cookies or NextRequest.
 * Queries database to ensure user still exists and role/status is current.
 */
export async function getAuthenticatedUser(req?: NextRequest) {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    }

    if (!token) {
      return null;
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error fetching authenticated user:', error);
    return null;
  }
}

/**
 * Reads and verifies that the current user has ADMIN permissions.
 */
export async function getAuthenticatedAdmin(req?: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return null;
  }

  const isAdminRole = user.role === 'ADMIN';
  const isAdminEmail = Boolean(
    process.env.ADMIN_EMAIL && 
    user.email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()
  );

  if (!isAdminRole && !isAdminEmail) {
    return null;
  }

  return user;
}
