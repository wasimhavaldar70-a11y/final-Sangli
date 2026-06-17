import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAskingAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAskingLogin = request.nextUrl.pathname === '/admin/login'

  if (isAskingAdminRoute) {
    const isAdminLoggedIn = request.cookies.get('sb-admin-preview-session')?.value === 'true'

    if (!isAdminLoggedIn) {
      if (!isAskingLogin) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/login'
        return NextResponse.redirect(url)
      }
    } else {
      if (isAskingLogin) {
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths starting with /admin
     */
    '/admin/:path*',
  ],
}
