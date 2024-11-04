import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ClientSideApiService } from './services/ClientSideApiService'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('jwt')?.value;

  // Skip processing for login page
  if (request.nextUrl.pathname === '/login') {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const userData = await ClientSideApiService.me(token);
    const requestHeaders = new Headers();
    // Copy over existing headers if needed
    request.headers.forEach((value, key) => requestHeaders.set(key, value));
    requestHeaders.set('x-user-data', JSON.stringify(userData));

    if (request.nextUrl.pathname.startsWith('/admin') && !userData.userRoles.includes('admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // If we reach this point, the user is authenticated and authorized
    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  } catch (error) {
    // In case of an error, delete the cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('jwt');
    return response;
  }
}

export const config = {
  matcher: ['/login', '/profile/:path*', '/admin/:path*'],
};
