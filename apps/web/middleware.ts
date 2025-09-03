import { TokenPayload } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";
import parse, { Cookie, splitCookiesString } from "set-cookie-parser";

// Route tanımları
const authRoutes = ["/auth"];
const apiAuthRoutes = ["/api/auth"];
const adminRoutes = ["/api/admin", "/admin"];
const userRoutes = ["/dashboard", "/profile", "/api/user"];

const setCookieFromParsed = (response: NextResponse, cookie: Cookie) => {
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly ?? true,
    secure: cookie.secure ?? false,
    sameSite: (cookie.sameSite as "strict" | "lax" | "none") ?? "strict",
    path: cookie.path ?? "/",
    domain: cookie.domain,
    expires: cookie.expires,
    maxAge: cookie.maxAge,
  });
};

// Cookie'leri temizleyen helper function
const clearAuthCookies = (response: NextResponse) => {
  // Token ve refresh token'ı temizle
  response.cookies.set("token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // Geçmişe tarih vererek sil
    maxAge: 0,
  });

  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    path: "/",
    expires: new Date(0), // Geçmişe tarih vererek sil
    maxAge: 0,
  });

  return response;
};

// Response'a cookie'leri ekleyen helper function
const setNewCookiesToResponse = (
  response: NextResponse,
  newCookies: Cookie[]
) => {
  newCookies.forEach((cookie) => {
    setCookieFromParsed(response, cookie);
  });
  return response;
};

// Redirect response oluşturan helper function
const createRedirectResponse = (
  url: string,
  req: NextRequest,
  newCookies: Cookie[],
  clearCookies: boolean = false
) => {
  let response = NextResponse.redirect(new URL(url, req.url));

  if (clearCookies) {
    response = clearAuthCookies(response);
  }

  return setNewCookiesToResponse(response, newCookies);
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || null;
  const refreshToken = req.cookies.get("refresh_token")?.value || null;
  let tokenPayload: TokenPayload | null = null;
  const newCookies: Cookie[] = [];
  let shouldClearCookies = false;

  // Token refresh logic
  if (!token && !refreshToken) {
    tokenPayload = null;
  } else if (!token && refreshToken) {
    try {
      const refreshReq = await fetch(
        `${process.env.BACKEND_URL}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        }
      );

      if (refreshReq.ok) {
        const setCookies = refreshReq.headers.get("set-cookie");
        if (setCookies) {
          const splittedSetCookies = splitCookiesString(setCookies);
          if (splittedSetCookies) {
            const parsedCookies = parse(splittedSetCookies);

            // Backend'den gelen tüm cookie'leri sakla
            parsedCookies.forEach((cookie) => {
              if (
                (cookie.name === "token" || cookie.name === "refresh_token") &&
                cookie.value
              ) {
                newCookies.push(cookie);
              }
            });
          }
        }
      } else {
        // Refresh token geçersiz/süresi dolmuş - cookie'leri temizle
        shouldClearCookies = true;
      }
    } catch {
      // Network hatası vs. - cookie'leri temizle
      shouldClearCookies = true;
    }
  }

  const currentToken =
    newCookies.find((c) => c.name === "token")?.value || token;

  if (currentToken && !shouldClearCookies) {
    try {
      const meReq = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          Cookie: `token=${currentToken}`,
        },
      });

      if (meReq.ok) {
        tokenPayload = (await meReq.json()) as TokenPayload;
      } else if (meReq.status === 401) {
        shouldClearCookies = true;
      }
    } catch {
      tokenPayload = null;
      // Network hatası - cookie'leri temizleme (bu durumda kullanıcı denemeye devam edebilir)
    }
  }

  const { pathname } = req.nextUrl;
  const isLoggedIn = !!tokenPayload && !shouldClearCookies;
  const userRole = tokenPayload?.role;
  // Helper functions
  const isAuthRoute = (path: string) =>
    authRoutes.some((route) => path.startsWith(route)) ||
    apiAuthRoutes.some((route) => path.startsWith(route));

  const isAdminRoute = (path: string) =>
    adminRoutes.some((route) => path.startsWith(route));

  const isUserRoute = (path: string) =>
    userRoutes.some((route) => path.startsWith(route));

  const isAdminOrOwner = (role: string) => role === "ADMIN" || role === "OWNER";

  // RBAC Logic with cookie cleanup

  // Cookie temizliği gerekiyorsa ve protected route'daysa login'e yönlendir
  if (shouldClearCookies && (isAdminRoute(pathname) || isUserRoute(pathname))) {
    return createRedirectResponse("/auth", req, [], true);
  }

  // Cookie temizliği gerekiyorsa ve auth route'daysa cookie'leri temizle ama kalsın
  if (shouldClearCookies && isAuthRoute(pathname)) {
    const response = NextResponse.next();
    return clearAuthCookies(response);
  }

  // Cookie temizliği gerekiyorsa ve public route'daysa sadece cookie'leri temizle
  if (shouldClearCookies) {
    const response = NextResponse.next();
    return clearAuthCookies(response);
  }

  // 1. Giriş yapmış kullanıcı auth sayfalarına erişemez
  if (isLoggedIn && isAuthRoute(pathname)) {
    return createRedirectResponse("/dashboard", req, newCookies);
  }

  // 2. Giriş yapmamış kullanıcı protected routes'lara erişemez
  if (!isLoggedIn && (isAdminRoute(pathname) || isUserRoute(pathname))) {
    return createRedirectResponse("/auth", req, newCookies);
  }

  // 3. Admin routes - sadece ADMIN veya OWNER erişebilir
  if (isLoggedIn && isAdminRoute(pathname)) {
    if (!userRole || !isAdminOrOwner(userRole)) {
      return createRedirectResponse("/", req, newCookies);
    }
  }

  // Normal response (no redirect needed)
  const response = NextResponse.next();
  return setNewCookiesToResponse(response, newCookies);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
