import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { ResetPasswordClient } from './ResetPasswordClient';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  const rawToken = resolvedParams.token ? decodeURIComponent(resolvedParams.token).trim() : '';

  // 1. Hash the incoming raw token with SHA-256
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // 2. Query database for user with matching unexpired token
  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedToken,
      resetPasswordExpires: {
        gt: new Date(),
      },
    },
  });

  const isTokenValid = Boolean(user);

  return (
    <div className="min-h-[85vh] bg-background relative flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>

        {!isTokenValid ? (
          <div className="space-y-6 text-center">
            <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-500/20">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold text-foreground font-heading">
                Link Invalid or Expired
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                This password reset link is invalid, has expired, or has already been used. For your security, reset links can only be used once within 60 minutes of request.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/forgot-password"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <KeyRound className="w-4 h-4" />
                <span>Request New Reset Link</span>
              </Link>

              <Link
                href="/login"
                className="w-full bg-card hover:bg-muted border border-border text-foreground font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        ) : (
          <ResetPasswordClient token={rawToken} />
        )}
      </div>
    </div>
  );
}
