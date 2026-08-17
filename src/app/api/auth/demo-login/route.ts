import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Demo authentication is disabled. Please sign in with valid administrator credentials.' },
    { status: 403 }
  );
}
