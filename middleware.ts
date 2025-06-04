import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('jwt')?.value;
  const userId = request.cookies.get('userId')?.value;
  console.log(`[Middleware] Token: ${token}, UserId: ${userId}`);

  // Déterminer le type de loader en fonction du préfixe de la route
  let loaderType: string;
  if (pathname.startsWith('/public') || pathname.startsWith('/auth')) {
    loaderType = 'public';
  } else if (pathname.startsWith('/admin')) {
    loaderType = 'admin';
  } else if (pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile')) {
    loaderType = 'gestionnaire';
  } else {
    loaderType = 'default';
  }

  // Créer une réponse de base
  let response = NextResponse.next();
  response.headers.set('X-Loader-Type', loaderType);

  // Logger la requête
  console.log(`[Middleware] Requête: ${pathname} | Loader: ${loaderType} | Token: ${!!token} | UserId: ${!!userId}`);

  // Autoriser l'accès à /auth/login et /auth/register sans restrictions
  if (pathname === '/auth/login' || pathname === '/auth/register') {
    console.log(`[Middleware] Accès direct autorisé à ${pathname}`);
    return response;
  }

  // Rediriger les utilisateurs connectés qui tentent d'accéder à /auth/register
  if (pathname.startsWith('/auth/register') && token && userId) {
    console.log(`[Middleware] Utilisateur connecté, redirection depuis ${pathname} vers /gestionnaire/dashboard`);
    response = NextResponse.redirect(new URL('/gestionnaire/dashboard', request.url));
    response.headers.set('X-Loader-Type', 'gestionnaire');
    return response;
  }

  console.log("[Middleware] Vérification de l'authentification pour les routes protégées");

  // Protéger les routes /gestionnaire et /complete-profile contre les utilisateurs non connectés
  if ((pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile')) && (!token || !userId)) {
    console.log(`[Middleware] Accès non autorisé à ${pathname}, redirection vers /auth/login`);
    response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.headers.set('X-Loader-Type', 'public');
    response.cookies.delete('jwt');
    response.cookies.delete('userId');
    return response;
  }
  console.log('[Middleware] Accès autorisé à la route protégée');
  // Vérifier la complétion du profil pour /gestionnaire et /complete-profile
  if ((pathname.startsWith('/gestionnaire') || pathname.startsWith('/complete-profile')) && token && userId) {
    try {
      console.log(`[Middleware] Vérification du profil pour userId: ${userId}`);
      const res = await fetch(`https://api-gestiloc.vercel.app/api/user/profile-complete/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
          "Authorization-JWT": `Bearer ${token}`,
        },
      });
      console.log('[Middleware] Réponse de l\'API reçue', res);

      // Vérifier si la réponse est OK
      if (!res.ok) {
        console.log(`[Middleware] Erreur API: ${res.status} ${res.statusText}`);
        throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
      }

      // Vérifier si la réponse est un JSON valide
      const contentType = res.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await res.text();
        console.error(`[Middleware] Réponse non-JSON reçue: ${text}`);
        throw new Error('Réponse non-JSON reçue de l\'API');
      }

      const data = await res.json();
      console.log(`[Middleware] Profil complet: ${data.complete}`);

      // Rediriger si profil incomplet
      if (!data.complete && !pathname.startsWith('/complete-profile')) {
        console.log(`[Middleware] Profil incomplet, redirection vers /complete-profile`);
        response = NextResponse.redirect(new URL('/complete-profile', request.url));
        response.headers.set('X-Loader-Type', 'gestionnaire');
        return response;
      }

      // Rediriger si profil complet et sur /complete-profile
      if (data.complete && pathname.startsWith('/complete-profile')) {
        console.log(`[Middleware] Profil complet, redirection vers /gestionnaire/dashboard`);
        response = NextResponse.redirect(new URL('/gestionnaire/dashboard', request.url));
        response.headers.set('X-Loader-Type', 'gestionnaire');
        return response;
      }
    } catch (error) {
      console.error(`[Middleware] Erreur lors de la vérification du profil:`, error);
      response = NextResponse.redirect(new URL('/auth/login', request.url));
      response.headers.set('X-Loader-Type', 'public');
      response.cookies.delete('jwt');
      response.cookies.delete('userId');
      return response;
    }
  }

  // Autoriser toutes les autres routes
  console.log(`[Middleware] Accès autorisé à ${pathname}`);
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};