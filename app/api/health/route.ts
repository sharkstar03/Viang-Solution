import { NextResponse } from 'next/server';

/** Healthcheck para Docker y Cloudflare. */
export function GET(): NextResponse {
  return NextResponse.json({ status: 'ok' });
}
