import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isMockClerk = 
  !process.env.CLERK_SECRET_KEY || 
  process.env.CLERK_SECRET_KEY.includes('sk_test_clerk-secret-key-2031') ||
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('pk_test_Y2xlcmstdGVzdC');

// Lazy load Clerk middleware only when Clerk is configured, preventing key/host checks in dev
let middlewareFn: any = null;

if (!isMockClerk) {
  try {
    const { clerkMiddleware, createRouteMatcher } = require('@clerk/nextjs/server');
    const isPublicRoute = createRouteMatcher([
      '/', 
      '/about', 
      '/research', 
      '/newsletter', 
      '/speaking', 
      '/knowledge', 
      '/projects', 
      '/ai-board', 
      '/contact',
      '/api/(.*)'
    ]);
    
    middlewareFn = clerkMiddleware(async (auth: any, request: any) => {
      if (!isPublicRoute(request)) {
        await auth.protect();
      }
    });
  } catch (err) {
    console.error('Failed to initialize Clerk middleware:', err);
  }
}

export default async function middleware(request: NextRequest, event: any) {
  if (isMockClerk || !middlewareFn) {
    return NextResponse.next();
  }
  return middlewareFn(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.[\\w]+$|_next/image|favicon.ico).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
