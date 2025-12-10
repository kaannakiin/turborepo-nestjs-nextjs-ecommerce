"use client";

import { GraphQLClient, ClientError } from "graphql-request";
import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { csrfManager } from "./csrf-manager";

type ApiSuccess<T> = { success: true; data: T; status: number };
export type ApiError = { success: false; error: string; status: number };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

type Variables = Record<string, unknown>;

interface QueueItem {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

class GraphqlWrapper {
  private client: GraphQLClient;

  private isRefreshing: boolean = false;
  private failedQueue: QueueItem[] = [];

  constructor() {
    const endpoint =
      process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:3001/graphql";
    this.client = new GraphQLClient(endpoint, {
      fetch: typeof window !== "undefined" ? window.fetch.bind(window) : fetch,
      credentials: "include",
    });
  }

  private processQueue(error: Error | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(true);
      }
    });
    this.failedQueue = [];
  }

  private hasRefreshToken(): boolean {
    if (typeof document === "undefined") return false;
    return document.cookie.includes("refreshToken");
  }

  private async refreshAccessToken(): Promise<void> {
    const baseUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

    const response = await fetch(`${baseUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Refresh token failed");
    }
    console.log("Access token refreshed.");
  }

  /**
   * Hata 'unknown' olarak gelir, bunu güvenli bir şekilde işleriz.
   */
  private formatError(error: unknown): ApiError {
    let status = 0;
    let message = "Bilinmeyen bir hata oluştu.";

    if (error instanceof ClientError) {
      status = error.response.status;
      message = error.response.errors?.[0]?.message || error.message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    return {
      success: false,
      error: message,
      status: status,
    };
  }

  /**
   * Generic T: Dönen veri tipi
   * Generic V: Gönderilen değişkenler (Variables)
   */
  public async request<T = unknown, V extends Variables = Variables>(
    document: string | TypedDocumentNode<T, V>,
    variables?: V,
    isRetry: boolean = false
  ): Promise<ApiResponse<T>> {
    const token = await csrfManager.getToken();

    if (token) {
      this.client.setHeader("X-CSRF-Token", token);
    }

    try {
      const data = await this.client.request<T>(
        document,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        variables as any,
        {
          "X-CSRF-Token": token || "",
          "Content-Type": "application/json",
        }
      );

      return { success: true, data: data, status: 200 };
    } catch (error: unknown) {
      let status = 0;
      if (error instanceof ClientError) {
        status = error.response.status;
      }

      if (status === 403 && !isRetry) {
        await csrfManager.refreshToken();
        return this.request<T, V>(document, variables, true);
      }

      if (status === 401 && !isRetry) {
        if (this.isRefreshing) {
          return new Promise<ApiResponse<T>>((resolve, reject) => {
            this.failedQueue.push({
              resolve: (val) => resolve(val as Promise<ApiResponse<T>>),
              reject,
            });
          }).then((res) =>
            res
              ? this.request<T, V>(document, variables, true)
              : this.formatError(new Error("Retry failed"))
          );
        }

        this.isRefreshing = true;

        if (!this.hasRefreshToken()) {
          this.isRefreshing = false;
          return this.formatError(new Error("Refresh token bulunamadı."));
        }

        try {
          await this.refreshAccessToken();
          this.processQueue(null);
          return this.request<T, V>(document, variables, true);
        } catch (refreshError: unknown) {
          const err =
            refreshError instanceof Error
              ? refreshError
              : new Error("Refresh failed");
          this.processQueue(err);
          return this.formatError(err);
        } finally {
          this.isRefreshing = false;
        }
      }

      return this.formatError(error);
    }
  }
}

const graphqlWrapper = new GraphqlWrapper();
export default graphqlWrapper;
