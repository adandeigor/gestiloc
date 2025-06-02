// httpClient.ts

import { isFormDataEndpoint } from "../core/apiEndpointConfig";
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
      switch (response.status) {
        case 400:
          throw new Error(errorData.message || 'Requête invalide');
        case 401:
          throw new Error('Non autorisé');
        case 404:
          throw new Error('Ressource non trouvée');
        case 500:
          throw new Error(errorData.message || 'Erreur serveur');
        default:
          throw new Error(errorData.message || 'Une erreur s\'est produite');
      }
    }
    return response.json();
  }

  // En-têtes communs
  private getHeaders(isFormData: boolean = false) {
    const headers = new Headers();
    if (!isFormData) {
      headers.append('Content-Type', 'application/json');
    }
    headers.append('Access-Control-Allow-Origin', '*');
    const token = getCookie('jwt');
    const api_token = process.env.NEXT_PUBLIC_API_TOKEN;
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    if (api_token) {
      headers.append('authorization-jwt', api_token);
    }
    return headers;
  }

  // Normalisation de l'endpoint
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  // Construction de l'URL
  private buildUrl(endpoint: string, params?: Record<string, any>): URL {
    const normalizedEndpoint = this.normalizeEndpoint(endpoint);
    const urlString = this.baseUrl ? `${this.baseUrl}${normalizedEndpoint}` : normalizedEndpoint;
    const url = new URL(urlString, this.baseUrl ? undefined : window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value);
        }
      });
    }
    console.log('URL construite:', url.toString());
    return url;
  }

  // GET
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = this.buildUrl(endpoint, params);
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
  async post<T>(endpoint: string, body: any, forceFormData: boolean = false): Promise<T> {
    try {
      const normalizedEndpoint = this.normalizeEndpoint(endpoint);
      const isFormData = forceFormData || isFormDataEndpoint(normalizedEndpoint);
      const url = this.buildUrl(endpoint);
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: this.getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
      });
      return this.handleResponse(response);
    } catch (error) {
      throw new Error(`Erreur POST: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }

  // PUT
  async put<T>(endpoint: string, body: any, forceFormData: boolean = false): Promise<T> {
    try {
      const normalizedEndpoint = this.normalizeEndpoint(endpoint);
      const isFormData = forceFormData || isFormDataEndpoint(normalizedEndpoint);
      const url = this.buildUrl(endpoint);
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: this.getHeaders(isFormData),
        body: isFormData ? body : JSON.stringify(body),
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