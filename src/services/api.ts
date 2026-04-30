import { SecurityService } from './security';

const API_BASE_URL = ''; // Caminho relativo para o mesmo domínio

export class ApiService {
  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // O endpoint agora é chamado diretamente conforme definido no DataService
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      // Se a resposta não for JSON (ex: erro 404 da Vercel), lança erro amigável
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Erro na API (${response.status}): Resposta não é JSON. Verifique se a rota ${endpoint} existe.`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Erro na operação. Verifique os dados e tente novamente.');
      }
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}
