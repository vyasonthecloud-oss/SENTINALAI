"use client";

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Mail, Lock, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

function SignUpForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.user.name, data.user.email, data.user.id, data.user.role);
      router.push(redirect);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `/api/auth/google${redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Logo/Brand Area */}
      <div className="text-center mb-10">
        <Link href="/" className="inline-block mb-6">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(25,25,112,0.3)] mx-auto border border-primary/30">
            <span className="font-black text-3xl text-gradient">S</span>
          </div>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 font-heading">Create an Account</h1>
        <p className="text-muted-foreground">Join Sentinel AI to track orders and save details.</p>
      </div>

      {/* Signup Card */}
      <div className="glass rounded-3xl p-8 card-glow border border-border/80 shadow-lg">
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="tech-label block ml-1" htmlFor="name">Full Name</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-background/80 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="tech-label block ml-1" htmlFor="email">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input 
                type="email" 
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background/80 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="tech-label block ml-1" htmlFor="password">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input 
                type="password" 
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background/80 border border-border rounded-xl py-3 pl-12 pr-4 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70"
          >
            {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 flex items-center gap-4 before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
          <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Or</span>
        </div>

        <div className="mt-6 space-y-4">
          <button 
            type="button" 
            onClick={handleGoogleSignup}
            className="w-full bg-card hover:bg-muted border border-border text-foreground font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Already have an account?{' '}
        <Link href={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="font-bold text-primary hover:text-primary/80 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-background relative flex items-center justify-center p-4 overflow-hidden">
      <Suspense fallback={<div className="text-center py-12 text-muted-foreground">Loading...</div>}>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
