import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setSessionCookie } from '@/lib/auth';
import { Role } from '@/types/database';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = (body.email || 'user@gmail.com').toLowerCase().trim();
    const name = body.name || (email.includes('admin') ? 'Sentinal Admin' : 'Verified User');
    const targetRole = (body.asAdmin || email.includes('admin')) ? Role.ADMIN : Role.USER;

    // 1. Find or create demo user in database
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const defaultPassword = await bcrypt.hash('admin123', 10);
      user = await prisma.user.create({
        data: {
          email,
          name,
          password: defaultPassword,
          role: targetRole,
        },
      });
    } else if (targetRole === Role.ADMIN && user.role !== Role.ADMIN) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: Role.ADMIN },
      });
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

    // 2. Set cryptographically signed HTTP-only session cookie
    setSessionCookie(response, {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return response;
  } catch (error) {
    console.error('Error in demo-login:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
