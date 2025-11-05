import { TokenPayload } from "@repo/types";
import { NextRequest, NextResponse } from "next/server";
import parse, { Cookie, splitCookiesString } from "set-cookie-parser";

const authRoutes = ["/auth"];
const adminRoutes = ["/api/admin", "/admin"];
const userRoutes = ["/dashboard", "/profile", "/api/user"];

const clearCookies = (response: NextResponse) => {
  // response.cookies.set("token", "", { expires: new Date(0), path: "/" });
  // response.cookies.set("refresh_token", "", {
  //   expires: new Date(0),
  //   path: "/",
  // });
  return response;
};

const createRedirectWithCookies = (
  url: string,
  req: NextRequest,
  newCookies: Cookie[]
) => {
  const response = NextResponse.redirect(new URL(url, req.url));
  return setNewCookiesToResponse(response, newCookies);
};

const createClearRedirect = (url: string, req: NextRequest) => {
  const response = NextResponse.redirect(new URL(url, req.url));
  return clearCookies(response);
};

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

const isAuthRoute = (path: string) =>
  authRoutes.some((route) => path.startsWith(route));

const isAdminRoute = (path: string) =>
  adminRoutes.some((route) => path.startsWith(route));

const isUserRoute = (path: string) =>
  userRoutes.some((route) => path.startsWith(route));

const isProtectedRoute = (path: string) =>
  isAdminRoute(path) || isUserRoute(path);

const isAdminOrOwner = (role: string) => role === "ADMIN" || role === "OWNER";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value || null;
  let refreshToken = req.cookies.get("refresh_token")?.value || null;

  if (!isProtectedRoute(pathname) && !isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  let currentToken = token;
  const newCookies: Cookie[] = [];
  let shouldClear = false;

  if (!currentToken && refreshToken) {
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

            currentToken =
              newCookies.find((c) => c.name === "token")?.value || null;
            refreshToken =
              newCookies.find((c) => c.name === "refresh_token")?.value || null;
          }
        }
      } else {
        shouldClear = true;
      }
    } catch {
      shouldClear = true;
    }
  }

  if (isAuthRoute(pathname)) {
    if (shouldClear) {
      return clearCookies(NextResponse.next());
    }
    if (currentToken) {
      return createRedirectWithCookies("/dashboard", req, newCookies);
    }

    return NextResponse.next();
  }

  if (!currentToken || shouldClear) {
    if (isAdminRoute(pathname)) {
      return createClearRedirect("/", req);
    }

    return createClearRedirect(
      `/auth?redirectUri=${encodeURIComponent(pathname)}`,
      req
    );
  }

  try {
    const meReq = await fetch(`${process.env.BACKEND_URL}/auth/me`, {
      method: "GET",
      credentials: "include",
      headers: { Cookie: `token=${currentToken}` },
      cache: "no-store",
    });
    if (meReq.ok) {
      const tokenPayload = (await meReq.json()) as TokenPayload;
      if (isAdminRoute(pathname) && !isAdminOrOwner(tokenPayload.role)) {
        return createRedirectWithCookies("/", req, newCookies);
      }
      const response = NextResponse.next();

      return setNewCookiesToResponse(response, newCookies);
    }

    if (meReq.status === 401) {
      if (isAdminRoute(pathname)) {
        return createClearRedirect("/", req);
      }
      return createClearRedirect(
        `/auth?redirectUri=${encodeURIComponent(pathname)}`,
        req
      );
    }

    throw new Error(`Auth/me failed with status ${meReq.status}`);
  } catch (error) {
    if (isAdminRoute(pathname)) {
      return createClearRedirect("/", req);
    }
    return createClearRedirect(
      `/auth?redirectUri=${encodeURIComponent(pathname)}`,
      req
    );
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
