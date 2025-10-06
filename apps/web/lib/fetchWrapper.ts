type ApiSuccess<T> = { success: true; data: T; status: number };
type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

class FetchWrapperV2 {
  baseUrl: string =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;
  private csrfInitialized: boolean = false;

  constructor() {}

  // Cookie'den CSRF token'ı oku
  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;

    // Önce __Host- prefix'li cookie'yi ara
    let match = document.cookie.match(/__Host-csrf-token=([^;]+)/);

    // Bulamazsan prefix'siz olanı ara (development için)
    if (!match) {
      match = document.cookie.match(/csrf-token=([^;]+)/);
    }

    return match ? decodeURIComponent(match[1]) : null;
  }
  // Backend'den CSRF token al
  private async initializeCsrfToken(): Promise<void> {
    if (this.csrfInitialized || this.getCsrfTokenFromCookie()) {
      this.csrfInitialized = true;
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/csrf`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        this.csrfInitialized = true;
        // Cookie otomatik olarak set edilir
      } else {
        console.warn("CSRF token initialization failed:", response.statusText);
      }
    } catch (error) {
      console.warn("CSRF token initialization error:", error);
    }
  }

  private hasRefreshToken(): boolean {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("refreshToken");
  }

  private async refreshToken(): Promise<boolean> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          // Refresh sonrası CSRF token yenilenir
          this.csrfInitialized = false;
          await this.initializeCsrfToken();
        }

        return response.ok;
      } catch (error) {
        return false;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    url: string,
    init: RequestInit,
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      const method = init.method || "GET";
      const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(
        method.toUpperCase()
      );

      // İlk mutating request'te CSRF token'ı initialize et
      if (needsCsrf && !this.csrfInitialized && retryCount === 0) {
        await this.initializeCsrfToken();
      }

      const headers: HeadersInit = {
        ...(init.headers || {}),
      };

      if (init.body && typeof init.body === "string") {
        headers["Content-Type"] = "application/json";
      }

      // CSRF token'ı cookie'den oku ve header'a ekle
      if (needsCsrf) {
        const csrfToken = this.getCsrfTokenFromCookie();
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        } else {
          console.warn("CSRF token not found in cookie");
        }
      }

      const response = await fetch(this.baseUrl + url, {
        ...init,
        headers,
        credentials: "include",
      });

      // 403 Forbidden - CSRF token geçersiz/eksik
      if (response.status === 403 && retryCount === 0 && needsCsrf) {
        console.log("CSRF token invalid, refreshing...");
        this.csrfInitialized = false;
        await this.initializeCsrfToken();
        return this.request<T>(url, init, retryCount + 1);
      }

      // 401 Unauthorized - Access token süresi dolmuş
      if (response.status === 401 && retryCount === 0) {
        if (this.hasRefreshToken()) {
          console.log("Access token expired, refreshing...");
          const isRefreshed = await this.refreshToken();

          if (isRefreshed) {
            return this.request<T>(url, init, retryCount + 1);
          }
        }

        return {
          success: false,
          error: "Token yenilenemedi",
          status: 401,
        };
      }

      // Retry sonrası hala başarısız
      if (retryCount > 0 && !response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || `Request başarısız (${retryCount}. deneme)`,
          status: response.status,
        };
      }

      // Normal error handling
      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || response.statusText,
          status: response.status,
        };
      }

      // Success response
      const contentType = response.headers.get("content-type");
      const data =
        contentType && contentType.includes("application/json")
          ? await response.json()
          : ({} as T);

      return {
        success: true,
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
        status: 0,
      };
    }
  }

  async post<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...init, method: "POST" });
  }

  async get<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...init, method: "GET" });
  }

  async put<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...init, method: "PUT" });
  }

  async delete<T>(
    url: string,
    init: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...init, method: "DELETE" });
  }

  async patch<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...init, method: "PATCH" });
  }
}

const fetchWrapper = new FetchWrapperV2();
export default fetchWrapper;
