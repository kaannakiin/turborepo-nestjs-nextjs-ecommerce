type ApiSuccess<T> = { success: true; data: T; status: number };
type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

class FetchWrapperV2 {
  baseUrl: string =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {}

  private getCsrfTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;

    let match = document.cookie.match(/__Host-csrf-token=([^;]+)/);

    if (!match) {
      match = document.cookie.match(/csrf-token=([^;]+)/);
    }

    return match ? match[1] : null;
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

      const headers: HeadersInit = {
        ...(init.headers || {}),
      };

      if (init.body && typeof init.body === "string") {
        headers["Content-Type"] = "application/json";
      }

      if (needsCsrf) {
        const csrfToken = this.getCsrfTokenFromCookie();
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }
      }

      const response = await fetch(this.baseUrl + url, {
        ...init,
        headers,
        credentials: "include",
      });

      // 403 Forbidden - CSRF token geçersiz/eksik
      if (response.status === 403 && retryCount === 0 && needsCsrf) {
        // Backend yeni cookie set edecek, sadece retry
        return this.request<T>(url, init, retryCount + 1);
      }

      // 401 Unauthorized - Access token süresi dolmuş
      if (response.status === 401 && retryCount === 0) {
        if (this.hasRefreshToken()) {
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

      if (retryCount > 0 && !response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || `Request başarısız (${retryCount}. deneme)`,
          status: response.status,
        };
      }

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: errorText || response.statusText,
          status: response.status,
        };
      }

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

  async postFormData<T>(
    url: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: formData,
    });
  }
}

const fetchWrapper = new FetchWrapperV2();
export default fetchWrapper;
