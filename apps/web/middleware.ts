import { TokenPayload } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";
import parse, { Cookie, splitCookiesString } from "set-cookie-parser";

const authRoutes = ["/auth"];
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

const setNewCookiesToResponse = (
  response: NextResponse,
  newCookies: Cookie[]
) => {
  newCookies.forEach((cookie) => {
    setCookieFromParsed(response, cookie);
  });
  return response;
};

const createRedirectResponse = (
  url: string,
  req: NextRequest,
  newCookies: Cookie[]
) => {
  const response = NextResponse.redirect(new URL(url, req.url));

  return setNewCookiesToResponse(response, newCookies);
};

const isAuthRoute = (path: string) =>
  authRoutes.some((route) => path.startsWith(route));

const isAdminRoute = (path: string) =>
  adminRoutes.some((route) => path.startsWith(route));

const isUserRoute = (path: string) =>
  userRoutes.some((route) => path.startsWith(route));

const isProtectedRoute = (path: string) =>
  isAdminRoute(path) || isUserRoute(path);

const isAdminOrOwner = (role: string) => role === "ADMIN" || role === "OWNER";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedRoute(pathname) && !isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value || null;
  const refreshToken = req.cookies.get("refresh_token")?.value || null;
  const newCookies: Cookie[] = [];
  let shouldClearCookies = false;

  if (!token && !refreshToken && isProtectedRoute(pathname)) {
    return createRedirectResponse(
      `/auth?redirectUri=${encodeURIComponent(pathname)}`,
      req,
      []
    );
  }

  // Token refresh logic - sadece token yoksa ama refresh token varsa
  if (!token && refreshToken) {
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
        shouldClearCookies = true;
      }
    } catch {
      shouldClearCookies = true;
    }
  }

  const currentToken =
    newCookies.find((c) => c.name === "token")?.value || token;

  // Cookie temizliği gerekiyorsa ve protected route'daysa
  if (shouldClearCookies && isProtectedRoute(pathname)) {
    return createRedirectResponse(
      `/auth?redirectUri=${encodeURIComponent(pathname)}`,
      req,
      []
    );
  }

  // Cookie temizliği gerekiyorsa ve auth route'daysa
  if (shouldClearCookies && isAuthRoute(pathname)) {
    const response = NextResponse.next();
    return setNewCookiesToResponse(response, []);
  }

  // Auth route kontrolü - token varsa dashboard'a yönlendir
  if (currentToken && isAuthRoute(pathname)) {
    return createRedirectResponse("/dashboard", req, newCookies);
  }

  // Protected route'a gidiyorsa ve token varsa payload kontrolü yap
  if (currentToken && isProtectedRoute(pathname)) {
    let tokenPayload: TokenPayload | null = null;

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
        // Token geçersiz
        return createRedirectResponse(
          `/auth?redirectUri=${encodeURIComponent(pathname)}`,
          req,
          []
        );
      }
    } catch {
      // Network hatası - kullanıcıyı login'e yönlendir
      return createRedirectResponse(
        `/auth?redirectUri=${encodeURIComponent(pathname)}`,
        req,
        []
      );
    }

    // Admin route kontrolü
    if (isAdminRoute(pathname)) {
      if (!tokenPayload?.role || !isAdminOrOwner(tokenPayload.role)) {
        return createRedirectResponse("/dashboard", req, newCookies);
      }
    }
  }

  // Normal response
  const response = NextResponse.next();
  return setNewCookiesToResponse(response, newCookies);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
