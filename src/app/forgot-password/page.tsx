"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, CheckCircle2, ChevronLeft, ShieldCheck, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setStatus('success');
      setMessage(data.message || 'Check your email for the password reset link.');
    } catch (err: unknown) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] bg-background relative flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      
      <div className="max-w-md w-full glass rounded-3xl p-8 border border-border/80 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-accent"></div>

        <Link href="/login" className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
            Reset Password
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Enter the email address associated with your Sentinel AI account. We&apos;ll send you a secure link to reset your password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm leading-relaxed text-foreground">
                {message}
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Didn&apos;t receive the email? Check your spam folder or wait a few minutes before trying again.
            </p>

            <Link
              href="/login"
              className="w-full bg-card hover:bg-muted border border-border text-foreground font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              Return to Login
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
                Account Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@domain.com"
                  className="w-full bg-background/50 border border-border rounded-xl py-3 pl-10 pr-4 text-sm text-foreground focus:outline-none focus:border-primary transition"
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
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-border/50 text-[11px] text-muted-foreground flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>256-Bit Cryptographic Signature Security</span>
        </div>
      </div>
    </div>
  );
}
