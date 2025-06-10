// core/loginUser.ts
'use server';

import { cookies } from 'next/headers';
import axios from 'axios';

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
export async function loginUser(
    email: string,
    password: string
): Promise<LoginResult> {
    try {
        const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;
        const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;
        const url = `${baseUrl}/auth/login`;
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

        const response = await axios.post(
            url,
            { email, motDePasse: password },
            { headers }
        );
        const result = response.data;

        // Gestion des cookies côté serveur
        const cookieStore = await cookies();
        cookieStore.set('userId', result.user.id, {
            path: '/',
            httpOnly: false,
        });
        cookieStore.set('jwt', result.token, { path: '/', httpOnly: false });

        return { success: true, user: result.user, token: result.token };
    } catch (error) {
        let errorMsg = 'Erreur lors de la connexion';
        if (axios.isAxiosError(error)) {
            const errorData = error.response?.data;
            if (errorData && typeof errorData === 'object') {
                errorMsg =
                    (errorData as any).error ||
                    (errorData as any).message ||
                    errorMsg;
            } else if (typeof errorData === 'string') {
                errorMsg = errorData;
            }
        } else if (error instanceof Error) {
            errorMsg = error.message;
        }
        return { success: false, error: errorMsg };
    }
}
