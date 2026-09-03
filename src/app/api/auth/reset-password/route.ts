import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, newPassword } = body;

    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 });
    }

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 1. Hash the incoming raw token with SHA-256 to compare with database
    const hashedToken = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // 2. Query user with matching unexpired hashed token
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json({ 
        error: 'This password reset link is invalid or has expired. Please request a new link.' 
      }, { status: 400 });
    }

    // 3. Hash New Password with bcryptjs (10 salt rounds)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update Password and Atomically Invalidate Token (Single-Use Guarantee)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Your password has been reset successfully. Please log in with your new credentials.',
    });

    // Invalidate any existing session cookie
    response.cookies.set('sentinel_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Error resetting password:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
