import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// Tipler aynı kalır
type ApiSuccess<T> = { success: true; data: T; status: number };
export type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

class AxiosWrapper {
  private api: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  private csrfToken: string | null = null;
  private csrfInitializationPromise: Promise<void>;
  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.initializeInterceptors();

    // 2. Wrapper oluşturulur oluşturulmaz CSRF token'ı al ve promise'ı ata
    this.csrfInitializationPromise = this.initializeCsrf().catch((err) => {
      // Başlangıçta hata alsa bile uygulamanın çökmesini engelle
      console.error("Initial CSRF fetch failed in constructor:", err);
    });
  }

  private async initializeCsrf(): Promise<void> {
    try {
      const response = await axios.get<{ csrfToken: string }>(
        `${this.api.defaults.baseURL}/auth/csrf`,
        { withCredentials: true }
      );

      this.csrfToken = response.data.csrfToken;
      console.log("CSRF token initialized/refreshed.");
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
      // Başarısız olursa Promise'ı reject et
      throw new Error("CSRF token initialization failed");
    }
  }

  private hasRefreshToken(): boolean {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("refreshToken");
  }

  private processQueue(error: Error | null, token: string | null = null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private initializeInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const method = config.method || "get";
        const needsCsrf = !["get", "head", "options"].includes(
          method.toLowerCase()
        );

        if (needsCsrf) {
          if (!this.csrfToken) {
            console.warn("CSRF token not ready, awaiting initialization...");
            try {
              await this.csrfInitializationPromise;
            } catch (e) {
              console.error("CSRF token await failed in request interceptor");
            }
          }

          if (this.csrfToken) {
            config.headers["X-CSRF-Token"] = this.csrfToken;
          } else {
            console.error("Cannot set CSRF token, it's still null.");
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (error.response.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log("CSRF token invalid, refreshing...");
            this.csrfInitializationPromise = this.initializeCsrf();
            await this.csrfInitializationPromise;

            return this.api(originalRequest);
          } catch (csrfError) {
            console.error("CSRF token refresh failed:", csrfError);
            return Promise.reject(error);
          }
        }

        // ... 401 Unauthorized kısmı aynı ...

        return Promise.reject(error);
      }
    );
  }
  private formatError<T>(error: unknown): ApiError {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error:
          error.response?.data?.message || error.message || "Bir hata oluştu.",
        status: error.response?.status || 0,
      };
    }
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu.",
      status: 0,
    };
  }
  public async getValidCsrfToken(): Promise<string | null> {
    try {
      await this.csrfInitializationPromise;
    } catch (e) {
      console.warn("CSRF promise was rejected, re-initializing...");
      this.csrfInitializationPromise = this.initializeCsrf();
      try {
        await this.csrfInitializationPromise;
      } catch (e2) {
        console.error("CSRF re-initialization failed.");
        return null;
      }
    }
    return this.csrfToken;
  }
  public async get<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  public async post<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  public async put<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  public async delete<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete<T>(url, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  public async patch<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch<T>(url, data, config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }

  public async postFormData<T>(
    url: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.post<T>(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return this.formatError(error);
    }
  }
}

const fetchWrapper = new AxiosWrapper();
export default fetchWrapper;
