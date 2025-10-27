import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// Tipler
type ApiSuccess<T> = { success: true; data: T; status: number };
export type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

class AxiosWrapper {
  private api: AxiosInstance;

  // 401 (Access Token) yenileme state'i
  private isRefreshing: boolean = false;
  private failedQueue: {
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
  }[] = [];

  // CSRF state'i
  private csrfToken: string | null = null;
  // CSRF token'ın constructor'da alınmasını beklemek için bir promise
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

    // Constructor'da async işlemi başlat, promise'ı sakla.
    // Bu sayede ilk istekler bu promise'ın çözülmesini bekleyebilir.
    this.csrfInitializationPromise = this.initializeCsrf().catch((err) => {
      // Başlangıçta hata alsa bile uygulamanın çökmesini engelle
      console.error("Initial CSRF fetch failed in constructor:", err);
    });
  }

  /**
   * CSRF token'ını backend'den alır ve sınıf değişkenine atar.
   */
  private async initializeCsrf(): Promise<void> {
    try {
      // Not: 'this.api.get' yerine 'axios.get' kullanıyoruz ki
      // bu ilk istek interceptor'a takılıp CSRF token aramasın.
      const response = await axios.get<{ csrfToken: string }>(
        `${this.api.defaults.baseURL}/auth/csrf`,
        { withCredentials: true }
      );

      this.csrfToken = response.data.csrfToken;
      console.log("CSRF token initialized/refreshed.");
    } catch (error) {
      console.error("Failed to initialize CSRF token:", error);
      // Başarısız olursa Promise'ı reject et, böylece bekleyenler hata alır
      throw new Error("CSRF token initialization failed");
    }
  }

  // --- 401 (Access Token) YARDIMCILARI ---
  // (Eski kodundan alındı)

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
  // --- Bitti ---

  private initializeInterceptors() {
    // --- 1. Request Interceptor ---
    // (CSRF token'ı ekler, gerekirse bekler)
    this.api.interceptors.request.use(
      async (config) => {
        const method = config.method || "get";
        const needsCsrf = !["get", "head", "options"].includes(
          method.toLowerCase()
        );

        if (needsCsrf) {
          // Eğer token henüz yoksa (constructor'daki istek bitmediyse),
          // promise'ın çözülmesini bekle.
          if (!this.csrfToken) {
            console.warn("CSRF token not ready, awaiting initialization...");
            try {
              await this.csrfInitializationPromise;
            } catch (e) {
              console.error("CSRF token await failed in request interceptor");
              // Token alınamazsa bile isteği göndermeyi dene,
              // muhtemelen 403 alıp response interceptor'da yenilenecek
            }
          }

          // Artık token'ın (başarılıysa) var olması gerekir
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

    // --- 2. Response Interceptor ---
    // (403 CSRF ve 401 Access Token hatalarını yönetir)
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // error.response olmadan bir şey yapamayız
        if (!error.response || !originalRequest) {
          return Promise.reject(error);
        }

        // --- 403 (CSRF Token) HATASI ---
        // (İlk kodundaki mantık)
        if (error.response.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            console.log("CSRF token invalid, refreshing...");
            // Yeni bir token al, promise'ı güncelle ve bekle
            this.csrfInitializationPromise = this.initializeCsrf();
            await this.csrfInitializationPromise;

            // İstek interceptor'ı yeni token'ı alıp kullanacak
            return this.api(originalRequest);
          } catch (csrfError) {
            console.error("CSRF token refresh failed:", csrfError);
            return Promise.reject(error); // Orijinal 403'ü döndür
          }
        }

        // --- 401 (Access Token) HATASI ---
        // (İkinci kodundaki eksik olan mantık)
        if (error.response.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Zaten bir refresh işlemi var, kuyruğa gir
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.api(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          if (!this.hasRefreshToken()) {
            console.error("Refresh token bulunamadı.");
            this.isRefreshing = false;
            // Burada logout işlemi tetiklenebilir (örn: router.push('/login'))
            return Promise.reject(new Error("Refresh token bulunamadı."));
          }

          // Refresh token'ı yenilemek için istek at
          return new Promise((resolve, reject) => {
            this.api
              .post("/auth/refresh", {}) // Endpoint'in bu olduğundan emin ol
              .then(() => {
                console.log("Access token refreshed.");
                this.processQueue(null, "refreshed");
                resolve(this.api(originalRequest));
              })
              .catch((refreshError) => {
                console.error("Access token refresh failed:", refreshError);
                this.processQueue(refreshError as Error, null);
                // Refresh fail olursa (örn: refresh token da geçersiz)
                // burada logout işlemi tetiklenebilir
                reject(refreshError);
              })
              .finally(() => {
                this.isRefreshing = false;
              });
          });
        }

        // Diğer tüm hatalar
        return Promise.reject(error);
      }
    );
  }

  /**
   * Hataları standart 'ApiError' formatına çevirir.
   */
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

  /**
   * Dışarıdan geçerli bir CSRF token'ı almak için (örn: FormData ile)
   * güvenli bir yol sağlar. Gerekirse token'ın alınmasını bekler.
   */
  public async getValidCsrfToken(): Promise<string | null> {
    try {
      // Önce mevcut promise'ı bekle
      await this.csrfInitializationPromise;
    } catch (e) {
      console.warn("CSRF promise was rejected, re-initializing...");
      // Hata olduysa, almayı tekrar dene
      this.csrfInitializationPromise = this.initializeCsrf();
      try {
        await this.csrfInitializationPromise;
      } catch (e2) {
        console.error("CSRF re-initialization failed.");
        return null; // Tekrar deneme de başarısız oldu
      }
    }
    return this.csrfToken; // Başarılıysa token'ı döndür
  }

  // --- PUBLIC API METODLARI ---
  // (Değişiklik yok)

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
