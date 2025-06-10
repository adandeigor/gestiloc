'use server';

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { cookies } from 'next/headers';

interface HttpOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: Record<string, unknown> | null;
    params?: Record<string, string | number | boolean | undefined>;
}

interface HttpResponse<T> {
    data: T | null;
    error: string | null;
    status: number;
}

export async function httpServer<T>(
    endpoint: string,
    options: HttpOptions = {}
): Promise<HttpResponse<T>> {
    const { method = 'GET', body, params } = options;

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('jwt')?.value;
        const apiToken = process.env.NEXT_PUBLIC_API_TOKEN;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization-JWT'] = token;
        if (apiToken) headers['Authorization'] = `Bearer ${apiToken}`;

        const normalizedEndpoint = endpoint.startsWith('/')
            ? endpoint
            : `/${endpoint}`;
        const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`;
        const url = new URL(normalizedEndpoint, baseUrl).toString();

        const config: AxiosRequestConfig = {
            method,
            url,
            headers,
            params,
            data: body,
        };

        const response: AxiosResponse<T> = await axios(config);
        console.log('response', response);
        return { data: response.data, error: null, status: response.status };
    } catch (error) {
        console.log('error', error);
        let errorMsg = "Une erreur s'est produite";
        let status = 500;

        if (axios.isAxiosError(error)) {
            status = error.response?.status || 500;
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

        return { data: null, error: errorMsg, status };
    }
}
