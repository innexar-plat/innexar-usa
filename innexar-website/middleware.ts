import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './src/i18n/routing'

const intlMiddleware = createMiddleware(routing)

const CANONICAL_HOST = 'innexar.app'

export default function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  if (host.startsWith('www.')) {
    const url = request.nextUrl
    const canonical = `https://${CANONICAL_HOST}${url.pathname}${url.search}`
    return NextResponse.redirect(canonical, 301)
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: [
    String.raw`/((?!api|_next|_vercel|.*\..*).*)`
  ]
}