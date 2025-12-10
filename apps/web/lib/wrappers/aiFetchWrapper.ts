import { csrfManager } from "./csrf-manager";

export const createAIProxyFetch = (proxyBaseUrl: string) => {
  const aiFetch = async (
    input: string | URL | Request,
    init?: RequestInit
  ): Promise<Response> => {
    const targetUrl = input.toString();

    const proxyUrl = new URL(proxyBaseUrl);
    proxyUrl.searchParams.set("url", targetUrl);

    const method = (init?.method || "POST").toUpperCase();
    const needsCsrf = !["GET", "HEAD", "OPTIONS"].includes(method);
    const headers = new Headers(init?.headers);

    if (needsCsrf) {
      const csrfToken = await csrfManager.getToken();
      if (csrfToken) {
        headers.set("X-CSRF-Token", csrfToken);
      } else {
        console.error("AI Proxy Fetch: CSRF token alınamadı.");
      }
    }

    const newInit: RequestInit = {
      ...init,
      method: method,
      headers: headers,
      credentials: "include",
    };

    if (input instanceof Request) {
      newInit.body = input.body;
    }

    return fetch(proxyUrl.toString(), newInit);
  };

  return aiFetch;
};
