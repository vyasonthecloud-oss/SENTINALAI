import { NextResponse } from 'next/server';

export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match API routes and general paths except static assets
     */
    '/api/:path*',
  ],
};
