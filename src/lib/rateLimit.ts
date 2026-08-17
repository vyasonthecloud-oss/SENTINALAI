import { NextResponse } from 'next/server';

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_CONFIGS: Record<string, RateLimitConfig> = {
  AUTH: { limit: Infinity, windowMs: 60 * 1000 },
  PAYMENT: { limit: Infinity, windowMs: 60 * 1000 },
  ADMIN: { limit: Infinity, windowMs: 60 * 1000 },
  API: { limit: Infinity, windowMs: 60 * 1000 },
  GLOBAL: { limit: Infinity, windowMs: 60 * 1000 },
};

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  clientIp: string;
  category: string;
}

/**
 * Rate limiting has been disabled. This function always returns success.
 */
export function checkRateLimit(
  ..._args: unknown[]
): RateLimitResult {
  void _args;
  return {
    success: true,
    limit: Infinity,
    remaining: Infinity,
    reset: 0,
    clientIp: '127.0.0.1',
    category: 'GLOBAL',
  };
}

export function createRateLimitResponse(..._args: unknown[]): NextResponse {
  void _args;
  return NextResponse.next();
}

export function applyRateLimitHeaders(response: NextResponse, ..._args: unknown[]): NextResponse {
  void _args;
  return response;
}
