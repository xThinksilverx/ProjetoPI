import { NextResponse } from 'next/server';

function decodeJwt(token) {
  try {
    const base64Payload = token.split('.')[1];
    return JSON.parse(atob(base64Payload));
  } catch {
    return null;
  }
}

function isTokenExpirado(payload) {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

const protectedRoutes = ['/perfil', '/cadastro'];
const adminRoutes = ['/admin'];
const authRoutes = ['/login'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const payload = token ? decodeJwt(token) : null;
  const tokenValido = payload && !isTokenExpirado(payload);

  if (adminRoutes.some(route => pathname.startsWith(route))) {
    if (!tokenValido) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
    if (payload.tipo !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!tokenValido) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(url);
      if (token) response.cookies.delete('token');
      return response;
    }
  }

  if (authRoutes.includes(pathname) && tokenValido) {
    const dest = payload.tipo === 'admin' ? '/admin'
      : payload.tipo === 'psicologo' ? '/perfil'
      : '/';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/perfil/:path*', '/cadastro/:path*', '/admin/:path*', '/login'],
};
