import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value
  const isAuthPage = request.nextUrl.pathname === '/'

  // Redirect to login if accessing protected routes without token
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Redirect to POS if trying to login again while already logged in
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/pos', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
