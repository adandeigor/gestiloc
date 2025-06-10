import { NextResponse, NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('jwt')?.value;
    const userId = request.cookies.get('userId')?.value;

    if (process.env.NODE_ENV !== 'production') {
        console.log(
            `[Middleware] Requête pour ${pathname} | Token: ${token ? 'Présent' : 'Absent'} | UserId: ${userId ? 'Présent' : 'Absent'}`
        );
    }

    let loaderType =
        pathname.startsWith('/public') || pathname.startsWith('/auth')
            ? 'public'
            : pathname.startsWith('/admin')
              ? 'admin'
              : pathname.startsWith('/gestionnaire') ||
                  pathname.startsWith('/complete-profile')
                ? 'gestionnaire'
                : 'default';

    let response = NextResponse.next();
    response.headers.set('X-Loader-Type', loaderType);

    // Autoriser l'accès direct à /auth/login et /auth/register
    if (pathname === '/auth/login' || pathname === '/auth/register') {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[Middleware] Accès direct à ${pathname}`);
        }
        return response;
    }

    // Vérifier les cookies pour les routes protégées
    if (
        (pathname.startsWith('/gestionnaire') ||
            pathname.startsWith('/complete-profile') ||
            pathname.startsWith('/admin')) &&
        (!token || !userId)
    ) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(
                `[Middleware] Cookies manquants, redirection vers /auth/login`
            );
        }
        response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.headers.set('X-Loader-Type', 'public');
        response.cookies.delete('jwt');
        response.cookies.delete('userId');
        return response;
    }

    // Vérification du profil complet pour /gestionnaire
    if (pathname.startsWith('/gestionnaire') && token && userId) {
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/user/profile-complete/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ''}`,
                        'Authorization-JWT': `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(
                        `[Middleware] Erreur API: ${res.status} ${res.statusText}`
                    );
                }
                // Cas spécifique pour 404 : profil incomplet
                if (res.status === 404) {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log(
                            'Profil incomplet (404), redirection vers /complete-profile'
                        );
                    }
                    return NextResponse.redirect(
                        new URL('/complete-profile', request.url)
                    );
                }
                // Autres erreurs (401, 500, etc.) : redirection vers /auth/login
                response = NextResponse.redirect(
                    new URL('/auth/login', request.url)
                );
                response.cookies.delete('jwt');
                response.cookies.delete('userId');
                return response;
            }

            const data = await res.json();
            if (process.env.NODE_ENV !== 'production') {
                console.log('data', data.complete);
            }

            if (typeof data.complete !== 'boolean') {
                console.error(
                    `[Middleware] Réponse inattendue: ${JSON.stringify(data)}`
                );
                response = NextResponse.redirect(
                    new URL('/auth/login', request.url)
                );
                response.cookies.delete('jwt');
                response.cookies.delete('userId');
                return response;
            }

            if (data.complete === false) {
                if (process.env.NODE_ENV !== 'production') {
                    console.log(
                        'Profil incomplet, redirection vers /complete-profile'
                    );
                }
                return NextResponse.redirect(
                    new URL('/complete-profile', request.url)
                );
            }

            if (process.env.NODE_ENV !== 'production') {
                console.log('Profil complet, accès autorisé');
            }
        } catch (e) {
            console.error(
                `[Middleware] Erreur lors de la vérification du profil: ${e}`
            );
            response = NextResponse.redirect(
                new URL('/auth/login', request.url)
            );
            response.cookies.delete('jwt');
            response.cookies.delete('userId');
            return response;
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
