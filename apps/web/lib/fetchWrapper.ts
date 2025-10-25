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

  // 1. Token'ı cookie yerine burada, hafızada (in-memory) sakla
  private csrfToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001",
      withCredentials: true,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.initializeInterceptors();

    // 2. Wrapper oluşturulur oluşturulmaz CSRF token'ı al
    this.initializeCsrf();
  }

  // 3. YENİ METOD: CSRF token'ı backend'den alır ve değişkene atar
  private async initializeCsrf() {
    try {
      // Not: 'this.api.get' yerine 'axios.get' kullanıyoruz ki
      // bu ilk istek interceptor'a takılıp CSRF token aramasın.
      const response = await axios.get<{ csrfToken: string }>(
        `${this.api.defaults.baseURL}/auth/csrf`,
        { withCredentials: true }
      );

      this.csrfToken = response.data.csrfToken;
      console.log("CSRF token initialized.");
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
    }
  }

  // 4. BU FONKSİYONU SİLİYORUZ. ARTIK GEREKLİ DEĞİL.
  // private getCsrfTokenFromCookie(): string | null { ... }

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

        // 5. Token'ı cookie'den değil, 'this.csrfToken' değişkeninden oku
        if (needsCsrf && this.csrfToken) {
          config.headers["X-CSRF-Token"] = this.csrfToken;
        } else if (needsCsrf && !this.csrfToken) {
          // Token henüz alınamadıysa (initializeCsrf bitmediyse) uyarı ver
          console.warn(
            "CSRF token is not yet available for request:",
            config.url
          );
          // İsteği yine de göndermeyi deneyebilir veya hata fırlatabilirsiniz
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

        if (!error.response || !originalRequest) {
          return Promise.reject(error);
        }

        // 403 Forbidden - CSRF token hatası. Token'ı yenile ve tekrar dene.
        if (error.response.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log("CSRF token invalid, refreshing...");
            // CSRF token'ı arka planda yenile
            await this.initializeCsrf();

            // 'this.api(originalRequest)' çağırmak yeterli,
            // request interceptor bu sefer YENİ token'ı otomatik ekleyecektir.
            return this.api(originalRequest);
          } catch (csrfError) {
            console.error("CSRF token refresh failed:", csrfError);
            return Promise.reject(error); // Orijinal 403 hatasını döndür
          }
        }

        // 401 Unauthorized - Access token süresi dolmuş
        // (Bu kodun mükemmel çalışıyor, dokunmaya gerek yok)
        if (error.response.status === 401 && !originalRequest._retry) {
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
            return Promise.reject(new Error("Refresh token bulunamadı."));
          }

          return new Promise((resolve, reject) => {
            this.api
              .post("/auth/refresh", {})
              .then(() => {
                this.processQueue(null, "refreshed");
                resolve(this.api(originalRequest));
              })
              .catch((refreshError) => {
                this.processQueue(refreshError, null);
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
