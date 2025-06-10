import getCookie from "./getCookie";

class HttpClient {
  private baseUrl: string = '';

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Gestion des réponses et erreurs
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Prendre en compte le champ "error" retourné par l'API
      const errorMsg =
        errorData.error ||
        errorData.message ||
        'Une erreur s\'est produite';
      switch (response.status) {
        case 400:
          throw new Error(errorMsg || 'Requête invalide');
        case 401:
          throw new Error(errorMsg || 'Non autorisé');
        case 404:
          throw new Error(errorMsg || 'Ressource non trouvée');
        case 500:
          throw new Error(errorMsg || 'Erreur serveur');
        default:
          throw new Error(errorMsg);
      }
    }
    console.log("error", response)
    return response.json();
  }

  // En-têtes communs
  private getHeaders() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const token = getCookie('jwt');
    const api_token = process.env.NEXT_PUBLIC_API_TOKEN;
    if (token) {
      headers.append('Authorization', `Bearer ${api_token}`);
    }
    if (api_token) {
      headers.append('Authorization-JWT', token as string);
    }
    return headers;
  }

  // Normalisation de l'endpoint
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  // Construction de l'URL
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): URL {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const urlString = this.baseUrl ? `${this.baseUrl}${normalizedEndpoint}` : normalizedEndpoint;
    const url = new URL(urlString, this.baseUrl ? undefined : window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== false) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    console.log('URL construite:', url.toString());
    return url;
  }

  // GET
  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const url = this.buildUrl(
        endpoint,
        params as Record<string, string | number | boolean | undefined>
      );
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Erreur GET: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // POST
  async post<T>(endpoint: string, body: Record<string, unknown> | null | undefined): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Erreur POST: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // PUT
  async put<T>(endpoint: string, body: Record<string, unknown> | null | undefined): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Erreur PUT: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // DELETE
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const url = this.buildUrl(endpoint);
      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Erreur DELETE: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
}

export const httpClient = new HttpClient();