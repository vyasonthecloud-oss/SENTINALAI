"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, ShieldCheck, Loader2, KeyRound } from 'lucide-react';

export function ResetPasswordClient({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setStatus('success');
      setMessage(data.message || 'Your password has been reset successfully.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary border border-primary/20 mb-3">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
          Set New Password
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Create a strong password for your Sentinel AI account.
        </p>
      </div>

      {status === 'success' ? (
        <div className="space-y-4 animate-in fade-in text-center">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{message}</span>
          </div>
          <p className="text-xs text-muted-foreground">Redirecting to login portal in 2 seconds...</p>
          <Link
            href="/login"
            className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition"
          >
            Go to Login Now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === 'error' && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold">
              {message}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground ml-1">
              New Password (min 6 characters)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground ml-1">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition placeholder:text-muted-foreground/50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground font-bold py-3.5 rounded-xl transition shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 text-xs uppercase tracking-wider mt-2"
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-primary" />
        <span>Bcrypt Salted & Stored Securely</span>
      </div>
    </div>
  );
}
