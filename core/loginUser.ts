// core/loginUser.ts
'use server';

import { cookies } from 'next/headers';

export interface User {
  id: string;
  // Ajoutez d'autres propriétés utilisateur selon votre modèle
  [key: string]: unknown;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

/**
 * Connecte un utilisateur, gère les cookies et retourne le résultat.
 * @param email Email de l'utilisateur
 * @param password Mot de passe
 */
export async function loginUser(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.NEXT_PUBLIC_API_TOKEN as string,
      },
      body: JSON.stringify({ email, motDePasse: password }),
    });

    const result = await response.json();

    if (!response.ok) {
      let errorMsg = 'Erreur lors de la connexion';
      if (result.error) {
        if (typeof result.error === 'object') {
          errorMsg = Object.values(result.error).flat().join(', ');
        } else if (typeof result.error === 'string') {
          errorMsg = result.error;
        }
      }
      return { success: false, error: errorMsg };
    }

    // Gestion des cookies côté serveur
    const cookieStore = await cookies();
    cookieStore.set('userId', result.user.id, { path: '/', httpOnly: false });
    cookieStore.set('jwt', result.token, { path: '/', httpOnly: false });

    return { success: true, user: result.user, token: result.token };
  } catch (error) {
    let message = 'Erreur lors de la connexion';
    if (error instanceof Error) {
      message = error.message;
    }
    return { success: false, error: message };
  }
}
