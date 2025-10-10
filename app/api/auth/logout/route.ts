// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = cookies();
    const cookiesToDelete = [
      'access_token',
      'refresh_token',
      'user',
      'X-CSRF-Token',
      'auth-session',
      'token',
    ];

    for (const name of cookiesToDelete) {
        cookieStore.set(name, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: -1,
        path: '/',
      });
    }

    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Error during logout:', error);
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
}
