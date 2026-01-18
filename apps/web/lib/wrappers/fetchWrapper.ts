import {
  LOCALE_COOKIE_NAME,
  NOT_RETRY_REFRESH_TOKEN_ENDPOINTS,
  STORE_TYPE_COOKIE_NAME,
} from '@repo/types';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';
import { getCookie } from 'cookies-next';

type ApiSuccess<T> = { success: true; data: T; status: number };
export type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type CookieStore = {
  get(name: string): { value: string } | undefined;
  getAll(): { name: string; value: string }[];
};

class ServerAxiosWrapper {
  private cookieStore: CookieStore | null = null;

  setCookies(cookieStore: CookieStore) {
    this.cookieStore = cookieStore;
    return this;
  }

  private createInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: process.env.BACKEND_URL || 'http://localhost:3001',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      if (this.cookieStore) {
        const allCookies = this.cookieStore.getAll();
        if (allCookies.length > 0) {
          config.headers.Cookie = allCookies
            .map((c) => `${c.name}=${c.value}`)
            .join('; ');

          // Locale header'larını cookie'den oku ve ekle
          const localeCookie = this.cookieStore.get(LOCALE_COOKIE_NAME);
          const storeTypeCookie = this.cookieStore.get(STORE_TYPE_COOKIE_NAME);

          if (localeCookie?.value) {
            config.headers['X-Locale'] = localeCookie.value;
          }

          if (storeTypeCookie?.value) {
            config.headers['X-Store-Type'] = storeTypeCookie.value;
          }
        }
      }
      return config;
    });

    return instance;
  }

  private formatError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'Bir hata oluştu.',
        status: error.response?.status || 0,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.',
      status: 0,
    };
  }

  async get<T>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.createInstance().get<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async post<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.createInstance().post<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async put<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.createInstance().put<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.createInstance().patch<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async delete<T>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.createInstance().delete<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async postFormData<T>(
    url: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.createInstance().post<T>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }
}

class ClientAxiosWrapper {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001',
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    this.initializeInterceptors();
  }

  private hasRefreshToken(): boolean {
    return document.cookie.includes('refreshToken');
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(undefined);
      }
    });
    this.failedQueue = [];
  }

  private async getCsrfToken(): Promise<string | null> {
    const { csrfManager } = await import('./csrf-manager');
    return csrfManager.getToken();
  }

  private async refreshCsrfToken(): Promise<string | null> {
    const { csrfManager } = await import('./csrf-manager');
    return csrfManager.refreshToken();
  }

  private initializeInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        // Locale header'larını cookie'den oku ve ekle
        const locale = getCookie(LOCALE_COOKIE_NAME);
        const storeType = getCookie(STORE_TYPE_COOKIE_NAME);

        if (locale) {
          config.headers['X-Locale'] = locale;
        }

        if (storeType) {
          config.headers['X-Store-Type'] = storeType;
        }

        const method = config.method || 'get';
        const needsCsrf = !['get', 'head', 'options'].includes(
          method.toLowerCase(),
        );

        if (needsCsrf) {
          const token = await this.getCsrfToken();
          if (token) {
            config.headers['X-CSRF-Token'] = token;
          }
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
          _csrfRetry?: boolean;
        };

        if (!error.response || !originalRequest) {
          return Promise.reject(error);
        }

        if (error.response.status === 403 && !originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true;
          try {
            await this.refreshCsrfToken();
            return this.api(originalRequest);
          } catch {
            return Promise.reject(error);
          }
        }

        if (error.response.status === 401 && !originalRequest._retry) {
          if (NOT_RETRY_REFRESH_TOKEN_ENDPOINTS.includes(originalRequest.url)) {
            return Promise.reject(error);
          }

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.api(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          if (!this.hasRefreshToken()) {
            this.isRefreshing = false;
            return Promise.reject(new Error('Refresh token bulunamadı.'));
          }

          try {
            await this.api.post('/auth/refresh', {});
            this.processQueue(null);
            return this.api(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError as Error);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private formatError(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || 'Bir hata oluştu.',
        status: error.response?.status || 0,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.',
      status: 0,
    };
  }

  async get<T>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async post<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async put<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async delete<T>(
    url: string,
    config: AxiosRequestConfig = {},
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  async postFormData<T>(
    url: string,
    formData: FormData,
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<T>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }
}

export const createServerFetch = () => new ServerAxiosWrapper();

let clientInstance: ClientAxiosWrapper | null = null;
const getClientFetch = () => {
  if (!clientInstance) {
    clientInstance = new ClientAxiosWrapper();
  }
  return clientInstance;
};

const getFetchWrapper = () => {
  if (typeof window === 'undefined') {
    return createServerFetch();
  }
  return getClientFetch();
};

const fetchWrapper = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    getFetchWrapper().get<T>(url, config),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    getFetchWrapper().post<T>(url, data, config),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    getFetchWrapper().put<T>(url, data, config),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    getFetchWrapper().patch<T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    getFetchWrapper().delete<T>(url, config),

  postFormData: <T>(url: string, formData: FormData) =>
    getFetchWrapper().postFormData<T>(url, formData),
};

export default fetchWrapper;
export type { ApiResponse, ApiSuccess };
