import { type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  // Pass the request to the Supabase middleware for session management
  // and Route Based Access Control
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths starting with /admin
     */
    '/admin/:path*',
  ],
}
