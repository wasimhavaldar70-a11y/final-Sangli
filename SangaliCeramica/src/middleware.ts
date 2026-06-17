import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if this is an admin route
  if (pathname.startsWith('/admin')) {
    // Determine if user has a valid session cookie
    const hasPreviewSession = request.cookies.has('sb-admin-preview-session')
    
    // Check for Supabase auth cookie (e.g., sb-projectref-auth-token)
    const hasSupabaseSession = request.cookies.getAll().some(
      (cookie) => cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
    )

    const isAuthenticated = hasPreviewSession || hasSupabaseSession

    // If unauthenticated and NOT on the login page, redirect to login
    if (!isAuthenticated && pathname !== '/admin/login') {
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // If authenticated and trying to access the login page (or just /admin), redirect to dashboard
    if (isAuthenticated && (pathname === '/admin/login' || pathname === '/admin')) {
      const dashboardUrl = new URL('/admin/dashboard', request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths starting with /admin
     * This avoids running middleware on public routes and static files
     */
    '/admin/:path*',
  ],
}
