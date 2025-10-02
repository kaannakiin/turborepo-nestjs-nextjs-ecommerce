// API response types
type ApiSuccess<T> = {
  success: true;
  data: T;
  status: number;
};

type ApiError = {
  success: false;
  error: string;
  status: number;
};

type ApiResponse<T> = ApiSuccess<T> | ApiError;

class FetchWrapperV2 {
  baseUrl: string =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  private csrfToken: string | null = null;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {}

  private async fetchCsrfToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/csrf`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.csrfToken;
        return true;
      }
      return false;
    } catch (error) {
      return false;
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

      if (needsCsrf && !this.csrfToken && retryCount === 0) {
        await this.fetchCsrfToken();
      }

      const headers: HeadersInit = {
        ...(init.headers || {}),
      };

      if (init.body) {
        headers["Content-Type"] = "application/json";
      }

      if (needsCsrf && this.csrfToken) {
        headers["X-CSRF-Token"] = this.csrfToken;
      }

      const response = await fetch(this.baseUrl + url, {
        ...init,
        headers,
        credentials: "include",
      });

      // 403 Forbidden - CSRF token geçersiz/eksik
      if (response.status === 403 && retryCount === 0 && needsCsrf) {
        this.csrfToken = null;
        const isCsrfFetched = await this.fetchCsrfToken();

        if (isCsrfFetched) {
          return this.request<T>(url, init, retryCount + 1);
        }

        return {
          success: false,
          error: "CSRF token alınamadı",
          status: 403,
        };
      }

      // 401 Unauthorized - Token süresi dolmuş
      if (response.status === 401 && retryCount === 0) {
        if (this.hasRefreshToken()) {
          const isRefreshed = await this.refreshToken();

          if (isRefreshed) {
            if (needsCsrf) {
              this.csrfToken = null;
              await this.fetchCsrfToken();
            }
            return this.request<T>(url, init, retryCount + 1);
          }
        }

        return {
          success: false,
          error: "Token yenilenemedi",
          status: 401,
        };
      }

      // Retry limitini aştık
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
    return this.request<T>(url, {
      ...init,
      method: "POST",
    });
  }

  async get<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...init,
      method: "GET",
    });
  }

  async put<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...init,
      method: "PUT",
    });
  }

  async delete<T>(
    url: string,
    init: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...init,
      method: "DELETE",
    });
  }

  async patch<T>(url: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...init,
      method: "PATCH",
    });
  }

  async postFormData<T>(
    url: string,
    formData: FormData
  ): Promise<ApiResponse<T>> {
    try {
      if (!this.csrfToken) {
        await this.fetchCsrfToken();
      }

      const headers: HeadersInit = {};

      if (this.csrfToken) {
        headers["X-CSRF-Token"] = this.csrfToken;
      }

      const response = await fetch(this.baseUrl + url, {
        method: "POST",
        body: formData,
        headers,
        credentials: "include",
      });

      // 403 Forbidden
      if (response.status === 403) {
        this.csrfToken = null;
        const isCsrfFetched = await this.fetchCsrfToken();

        if (isCsrfFetched) {
          headers["X-CSRF-Token"] = this.csrfToken!;
          const retryResponse = await fetch(this.baseUrl + url, {
            method: "POST",
            body: formData,
            headers,
            credentials: "include",
          });

          if (!retryResponse.ok) {
            const errorText = await retryResponse.text();
            return {
              success: false,
              error: errorText || retryResponse.statusText,
              status: retryResponse.status,
            };
          }

          const contentType = retryResponse.headers.get("content-type");
          const data =
            contentType && contentType.includes("application/json")
              ? await retryResponse.json()
              : ({} as T);

          return {
            success: true,
            data,
            status: retryResponse.status,
          };
        }

        return {
          success: false,
          error: "CSRF token alınamadı",
          status: 403,
        };
      }

      // 401 Unauthorized
      if (response.status === 401) {
        if (this.hasRefreshToken()) {
          const isRefreshed = await this.refreshToken();

          if (isRefreshed) {
            this.csrfToken = null;
            await this.fetchCsrfToken();

            headers["X-CSRF-Token"] = this.csrfToken!;
            const retryResponse = await fetch(this.baseUrl + url, {
              method: "POST",
              body: formData,
              headers,
              credentials: "include",
            });

            if (!retryResponse.ok) {
              const errorText = await retryResponse.text();
              return {
                success: false,
                error: errorText || retryResponse.statusText,
                status: retryResponse.status,
              };
            }

            const contentType = retryResponse.headers.get("content-type");
            const data =
              contentType && contentType.includes("application/json")
                ? await retryResponse.json()
                : ({} as T);

            return {
              success: true,
              data,
              status: retryResponse.status,
            };
          }
        }

        return {
          success: false,
          error: "Token yenilenemedi",
          status: 401,
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

  clearCsrfToken(): void {
    this.csrfToken = null;
  }
}

export default FetchWrapperV2;
