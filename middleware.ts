import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt')?.value;
  const userId = request.cookies.get('userId')?.value;
  console.log(`[Middleware] Requête: ${pathname} | Token: ${token} | UserId: ${userId}`);

  let loaderType =
    pathname.startsWith('/public') || pathname.startsWith('/auth') ? 'public' :
    pathname.startsWith('/admin') ? 'admin' :
    pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile') ? 'gestionnaire' :
    'default';

  let response = NextResponse.next();
  response.headers.set('X-Loader-Type', loaderType);

  // Autoriser l'accès direct à /auth/login et /auth/register
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    console.log(`[Middleware] Accès direct à ${pathname}`);
    return response;
  }

  // Vérifier les cookies pour les routes protégées
  if ((pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile') || pathname.startsWith('/auth/register')) && (!token || !userId)) {
    console.log(`[Middleware] Cookies manquants, redirection vers /auth/login`);
    response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.headers.set('X-Loader-Type', 'public');
    response.cookies.delete('jwt');
    response.cookies.delete('userId');
    return response;
  }

  // Vérifier la complétion du profil pour les routes protégées
  if ((pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile') || pathname.startsWith('/auth/register')) && token && userId) {
    try {
      console.log(`[Middleware] Vérification du profil pour userId: ${userId}`);
      const res = await fetch(`/api/user/profile-complete/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ''}`,
          "Authorization-JWT": `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Middleware] Erreur API: ${res.status} ${res.statusText} - ${errorText}`);
        throw new Error(`Erreur API: ${res.status}`);
      }

      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        console.error(`[Middleware] Réponse non-JSON: ${text}`);
        throw new Error('Réponse non-JSON');
      }

      const data = await res.json();
      console.log(`[Middleware] Réponse API: ${JSON.stringify(data)}`);

      if (typeof data.complete !== 'boolean') {
        console.error(`[Middleware] Valeur inattendue pour data.complete: ${JSON.stringify(data)}`);
        throw new Error('Réponse API invalide');
      }

      // Rediriger si profil incomplet
      if (!data.complete && !pathname.startsWith('/complete-profile')) {
        console.log(`[Middleware] Profil incomplet, redirection vers /complete-profile`);
        response = NextResponse.redirect(new URL('/complete-profile', request.url));
        response.headers.set('X-Loader-Type', 'gestionnaire');
        return response;
      }

      // Rediriger si profil complet et sur /complete-profile ou /auth/register
      if (data.complete && (pathname.startsWith('/complete-profile') || pathname.startsWith('/auth/register'))) {
        console.log(`[Middleware] Profil complet, redirection vers /gestionnaire/dashboard`);
        response = NextResponse.redirect(new URL('/gestionnaire/dashboard', request.url));
        response.headers.set('X-Loader-Type', 'gestionnaire');
        return response;
      }
    } catch (error) {
      console.error(`[Middleware] Erreur lors de la vérification du profil: ${error}`);
      response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.headers.set('X-Loader-Type', 'public');
      response.cookies.delete('jwt');
      response.cookies.delete('userId');
      return response;
    }
  }

  console.log(`[Middleware] Accès autorisé à ${pathname}`);
  return response;
}

export const config = {
  matcher: [
    '/auth/:path*',
    '/gestionnaire/:path*',
    '/complete-profile/:path*',
    '/admin/:path*',
  ],
};