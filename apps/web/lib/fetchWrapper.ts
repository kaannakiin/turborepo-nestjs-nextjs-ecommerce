export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  success?: boolean;
}

export interface ApiClientOptions extends Omit<RequestInit, "method"> {
  baseURL?: string;
  timeout?: number;
}

class FetchWrapper {
  private baseURL: string;
  e;
  private defaultOptions: RequestInit;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL =
      options.baseURL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      "http://localhost:3001";

    this.defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      ...options,
    };
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch("/api/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;

      const config: RequestInit = {
        ...this.defaultOptions,
        ...options,
        headers: {
          ...this.defaultOptions.headers,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);

      if (response.status === 401 && !isRetry) {
        console.log("Token expired, attempting to refresh...");
        const refreshSuccess = await this.refreshToken();
        if (refreshSuccess) {
          return this.request<T>(endpoint, options, true);
        }
      }

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        return {
          error: data?.message || `HTTP Error: ${response.status}`,
          success: false,
          data: undefined,
        };
      }

      return {
        data,
        success: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Network error",
        success: false,
        data: undefined,
      };
    }
  }

  async get<T = unknown>(
    endpoint: string,
    options?: Omit<RequestInit, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | string | FormData,
    options?: Omit<RequestInit, "method" | "body">
  ): Promise<ApiResponse<T>> {
    const body =
      data instanceof FormData
        ? data
        : typeof data === "string"
          ? data
          : data
            ? JSON.stringify(data)
            : undefined;

    const headers =
      data instanceof FormData
        ? options?.headers
        : {
            "Content-Type": "application/json",
            ...options?.headers,
          };

    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      headers,
      body,
    });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | string,
    options?: Omit<RequestInit, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body:
        typeof data === "string"
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
    });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: Record<string, unknown> | string,
    options?: Omit<RequestInit, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body:
        typeof data === "string"
          ? data
          : data
            ? JSON.stringify(data)
            : undefined,
    });
  }

  async delete<T = unknown>(
    endpoint: string,
    options?: Omit<RequestInit, "method">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  async postFormData<T = unknown>(
    endpoint: string,
    formData: FormData,
    options?: Omit<RequestInit, "method" | "body">
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: formData,
      headers: {
        ...Object.fromEntries(
          Object.entries(options?.headers || {}).filter(
            ([key]) => key.toLowerCase() !== "content-type"
          )
        ),
      },
    });
  }
}

export const fetchWrapper = new FetchWrapper();
