import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import SpotifyService from './server/services/spotifyService';

const spotifyService = new SpotifyService();

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname === '/callback') {
    return NextResponse.next()
  }

  const access_Token = request.cookies.get('spotify_access_token')?.value
  const refresh_Token = request.cookies.get('spotify_refresh_token')?.value
  const tokenExpiresAt = request.cookies.get('spotify_token_expires_at')?.value

  if (!access_Token) {
    return NextResponse.redirect(new URL('/api/login', request.url))
  }

  if (tokenExpiresAt && Date.now() > parseInt(tokenExpiresAt)) {
    if (!refresh_Token) {
      return NextResponse.redirect(new URL('/api/login', request.url))
    }

    const { accessToken, refreshToken, expiresAt } = await spotifyService.refreshToken();

    if (!accessToken || !expiresAt) {
      return NextResponse.redirect(new URL('/api/login', request.url))
    }

    const { origin } = new URL(request.url);
    const response = NextResponse.redirect(`${origin}/`);

    response.cookies.set('spotify_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    });

    response.cookies.set('spotify_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    });

    response.cookies.set('spotify_token_expires_at', expiresAt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600
    });
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}