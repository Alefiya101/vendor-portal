import { projectId, publicAnonKey } from './supabase/info';
import { rateLimiter, maskSensitiveData } from './security';

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  rateLimit?: {
    maxRequests: number;
    timeWindowMs: number;
  };
}

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipRateLimit?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;
  private retries: number;
  private rateLimit: { maxRequests: number; timeWindowMs: number };

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || `https://${projectId}.supabase.co/functions/v1/make-server-155272a3`;
    this.timeout = config.timeout || 30000; // 30 seconds
    this.retries = config.retries || 2;
    this.rateLimit = config.rateLimit || { maxRequests: 100, timeWindowMs: 60000 }; // 100 requests per minute
  }

  private async fetchWithTimeout(url: string, options: RequestOptions): Promise<Response> {
    const timeout = options.timeout || this.timeout;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
          ...options.headers
        }
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryRequest(
    url: string,
    options: RequestOptions,
    attempt: number = 0
  ): Promise<Response> {
    try {
      const response = await this.fetchWithTimeout(url, options);

      // Retry on server errors (5xx)
      if (response.status >= 500 && attempt < this.retries) {
        console.warn(`Request failed with status ${response.status}, retrying... (${attempt + 1}/${this.retries})`);
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.retryRequest(url, options, attempt + 1);
      }

      return response;
    } catch (error: any) {
      if (attempt < this.retries && error.name === 'AbortError') {
        console.warn(`Request timeout, retrying... (${attempt + 1}/${this.retries})`);
        await this.delay(Math.pow(2, attempt) * 1000);
        return this.retryRequest(url, options, attempt + 1);
      }
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private checkRateLimit(endpoint: string): boolean {
    return rateLimiter.isAllowed(
      `api:${endpoint}`,
      this.rateLimit.maxRequests,
      this.rateLimit.timeWindowMs
    );
  }

  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Check rate limit
    if (!options.skipRateLimit && !this.checkRateLimit(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    try {
      // Log request (mask sensitive data in production)
      if (process.env.NODE_ENV === 'development') {
        console.log('API Request:', {
          url,
          method: options.method || 'GET',
          body: options.body ? JSON.parse(options.body as string) : undefined
        });
      }

      const response = await this.retryRequest(url, options);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const error: any = new Error(data.message || data.error || 'Request failed');
        error.status = response.status;
        error.data = data;
        throw error;
      }

      // Log response (mask sensitive data)
      if (process.env.NODE_ENV === 'development') {
        console.log('API Response:', {
          url,
          status: response.status,
          data: maskSensitiveData(data)
        });
      }

      return data;
    } catch (error: any) {
      // Log error (mask sensitive data)
      console.error('API Error:', {
        url,
        message: error.message,
        status: error.status,
        data: error.data ? maskSensitiveData(error.data) : undefined
      });

      // Enhance error message for better UX
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      }

      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      throw error;
    }
  }

  async get<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  async patch<T = any>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();

// Helper function for handling API errors
export function handleApiError(error: any): string {
  if (error.status === 401) {
    return 'Unauthorized. Please log in again.';
  }
  if (error.status === 403) {
    return 'You do not have permission to perform this action.';
  }
  if (error.status === 404) {
    return 'Resource not found.';
  }
  if (error.status === 429) {
    return 'Too many requests. Please try again later.';
  }
  if (error.status >= 500) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
}
