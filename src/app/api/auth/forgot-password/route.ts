import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Look up user in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // 2. Generate 32-byte cryptographically secure random token
      const rawToken = crypto.randomBytes(32).toString('hex');

      // 3. Compute SHA-256 hash for secure database storage
      const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

      // 4. Set 60-minute expiration timestamp
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

      // 5. Store hashed token in database
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: hashedToken,
          resetPasswordExpires: resetExpires,
        },
      });

      // 6. Construct reset URL with raw unhashed token for email
      const resetLink = `${APP_URL}/reset-password/${rawToken}`;

      // 7. Dispatch Password Reset Email (Never log raw/hashed tokens)
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetLink,
      });
    }

    // Always return generic success message to prevent user email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email address, a password reset link has been dispatched.',
    });
  } catch (error) {
    console.error('Error in forgot-password:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
