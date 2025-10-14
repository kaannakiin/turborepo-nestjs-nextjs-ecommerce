import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// Bu tipleri değiştirmeden kullanmaya devam ediyoruz
type ApiSuccess<T> = { success: true; data: T; status: number };
type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

class AxiosWrapper {
  private api: AxiosInstance;
  private isRefreshing: boolean = false;
  private failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.initializeInterceptors();
  }

  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    let match = document.cookie.match(/__Host-csrf-token=([^;]+)/);
    if (!match) {
      match = document.cookie.match(/csrf-token=([^;]+)/);
    }
    return match ? match[1].trim() : null;
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
      (config) => {
        const method = config.method || "get";
        const needsCsrf = !["get", "head", "options"].includes(
          method.toLowerCase()
        );

        if (needsCsrf) {
          const csrfToken = this.getCsrfTokenFromCookie();
          if (csrfToken) {
            config.headers["X-CSRF-Token"] = csrfToken;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 2. Cevap (Response) Interceptor'ı: Gelen hataları yönetir (401, 403 vb.)
    this.api.interceptors.response.use(
      (response) => response, // Başarılı cevapları doğrudan geçir
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        if (!error.response || !originalRequest) {
          return Promise.reject(error);
        }

        // 403 Forbidden - CSRF token hatası olabilir. Bir kez tekrar dene.
        if (error.response.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;
          return this.api(originalRequest);
        }

        // 401 Unauthorized - Access token süresi dolmuş
        if (error.response.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Zaten bir token yenileme işlemi var, isteği kuyruğa al
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
            // Logout logic can be triggered here
            return Promise.reject(new Error("Refresh token bulunamadı."));
          }

          return new Promise((resolve, reject) => {
            // Refresh token endpoint'ine istek at.
            // Burada 'axios' yerine 'this.api' kullanıyoruz ki baseURL'i alsın.
            this.api
              .post("/auth/refresh", {})
              .then(() => {
                this.processQueue(null, "refreshed");
                resolve(this.api(originalRequest));
              })
              .catch((refreshError) => {
                this.processQueue(refreshError, null);
                // Logout logic can be triggered here
                reject(refreshError);
              })
              .finally(() => {
                this.isRefreshing = false;
              });
          });
        }

        return Promise.reject(error);
      }
    );
  }

  // Hata formatını `ApiResponse<T>`'ye uygun hale getiren yardımcı metod
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

  // --- PUBLIC API METODLARI ---
  // Bu metodlar eski FetchWrapper'ınız ile birebir aynı imzaya sahip.

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

// Singleton instance oluşturup export ediyoruz.
// Bu sayede projenizin her yerinde aynı instance kullanılır.

const fetchWrapper = new AxiosWrapper();
export default fetchWrapper;
