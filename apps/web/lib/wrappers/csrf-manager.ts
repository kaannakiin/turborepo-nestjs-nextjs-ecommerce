class CsrfTokenManager {
  private csrfToken: string | null = null;
  private initializationPromise: Promise<string> | null = null;

  constructor() {}

  private getBaseUrl() {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  public async getToken(): Promise<string | null> {
    if (this.csrfToken) {
      return this.csrfToken;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.fetchCsrfToken();

    try {
      return await this.initializationPromise;
    } catch (error) {
      console.error("CSRF Token alınamadı", error);
      return null;
    } finally {
      this.initializationPromise = null;
    }
  }

  public async refreshToken(): Promise<string | null> {
    this.csrfToken = null;
    return this.getToken();
  }

  private async fetchCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${this.getBaseUrl()}/auth/csrf`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("CSRF fetch failed");

      const data = (await response.json()) as { csrfToken: string };
      this.csrfToken = data.csrfToken;
      return data.csrfToken;
    } catch (error) {
      this.csrfToken = null;
      throw error;
    }
  }
}

export const csrfManager = new CsrfTokenManager();
