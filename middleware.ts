import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Define public routes that don't need a token
  const isAuthPage = pathname.startsWith('/Pages/Login') || pathname.startsWith('/Pages/Login/Register');

  // 2. If no token and trying to access a protected page -> redirect to login
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/Pages/Login', request.url));
  }

  // 3. If token exists and trying to access auth pages -> redirect to dashboard/home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/Pages/Admin', request.url));
  }

  return NextResponse.next();
}

// Protect all routes except static assets and API routes
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};