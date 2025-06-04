import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt')?.value;
  const userId = request.cookies.get('userId')?.value;
  console.log(`[Middleware] Requête pour ${pathname} | Token: ${token ? 'Présent' : 'Absent'} | UserId: ${userId ? 'Présent' : 'Absent'}`);
  let loaderType =
    pathname.startsWith('/public') || pathname.startsWith('/auth') ? 'public' :
    pathname.startsWith('/admin') ? 'admin' :
    pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile') ? 'gestionnaire' :
    'default';

  let response = NextResponse.next();
  response.headers.set('X-Loader-Type', loaderType);

  // Autoriser l'accès direct à /auth/login et /auth/register
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Middleware] Accès direct à ${pathname}`);
    }
    return response;
  }

  // Vérifier les cookies et le token pour les routes protégées
  if (
    (pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile') || pathname.startsWith('/admin')) &&
    (!token || !userId)
  ) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Middleware] Cookies manquants, redirection vers /auth/login`);
    }
    response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.headers.set('X-Loader-Type', 'public');
    return response;
  }

  // Vérification du profil complet (exemple)
  if (pathname.startsWith('/gestionnaire') && token && userId) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile-complete/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ''}`,
          "Authorization-JWT": `Bearer ${token}`,
        },
      });
      console.log("response", res)
      if (res.ok) {
        const data = await res.json();
        console.log("data", data)
        if (!data.complete) {
          
          return NextResponse.redirect(new URL('/complete-profile', request.url));
        }
      }
    } catch (e) {
      console.error(e);
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/gestionnaire/:path*',
    '/complete-profile/:path*',
    '/admin/:path*',
    '/public/:path*',
  ],
};