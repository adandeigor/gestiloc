import getCookie from "./getCookie";

export async function UserCompleteProfile(): Promise<boolean> {
  try {
    const token = getCookie('jwt') as string;
    if (!token) {
      console.error('Token JWT manquant');
      throw new Error('Token JWT manquant');
    }
    const userId = getCookie('userId') as string;
    if (!userId) {
      console.error('User ID manquant');
      throw new Error('User ID manquant');
    }
    console.log(`Vérification du profil pour userId: ${userId}`);
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile-complete/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN || ''}`,
        "Authorization-JWT": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Erreur API: ${res.status} ${res.statusText} - ${errorText}`);
      throw new Error(`Erreur API: ${res.status}`);
    }
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await res.text();
      console.error(`Réponse non-JSON: ${text}`);
      throw new Error('Réponse non-JSON');
    }
    const data = await res.json();
    console.log(`Réponse API: ${JSON.stringify(data)}`);
    if (typeof data.complete !== 'boolean') {
      console.error(`Valeur inattendue pour data.complete: ${JSON.stringify(data)}`);
      throw new Error('Réponse API invalide');
    }
    return data.complete;
  } catch (error) {
    console.error(`Erreur lors de la vérification du profil: ${error}`);
    throw error; // Propagate the error to be handled by the caller
  }
}