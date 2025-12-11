import {
  ACCESS_TOKEN_COOKIE_NAME,
  adminRoutes,
  authRoutes,
  REFRESH_TOKEN_COOKIE_NAME,
  userRoutes,
} from "@lib/constants";
import { TokenPayload } from "@repo/types";
import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import parse, { Cookie, splitCookiesString } from "set-cookie-parser";

type SameSite = true | false | "lax" | "strict" | "none" | undefined;
const JWT_ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_TOKEN_SECRET || "secret-yoksa-patlar"
);

const clearCookies = (response: NextResponse) => {
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
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
    sameSite: (cookie.sameSite as SameSite) ?? "lax",
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

const isAdminOrOwner = (role?: string) => role === "ADMIN" || role === "OWNER";

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_TOKEN_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!isProtectedRoute(pathname) && !isAuthRoute(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  let userPayload = token ? await verifyAccessToken(token) : null;
  const newCookies: Cookie[] = [];

  if (!userPayload && refreshToken) {
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
          const parsedCookies = parse(splittedSetCookies);

          parsedCookies.forEach((cookie) => {
            if (
              (cookie.name === ACCESS_TOKEN_COOKIE_NAME ||
                cookie.name === REFRESH_TOKEN_COOKIE_NAME) &&
              cookie.value
            ) {
              newCookies.push(cookie);
            }
          });

          const newTokenValue = newCookies.find(
            (c) => c.name === ACCESS_TOKEN_COOKIE_NAME
          )?.value;
          if (newTokenValue) {
            userPayload = await verifyAccessToken(newTokenValue);
          }
        }
      }
    } catch (error) {
      console.error("Refresh failed", error);
    }
  }

  if (!userPayload) {
    if (isProtectedRoute(pathname)) {
      if (isAdminRoute(pathname)) {
        return createClearRedirect("/", req);
      }
      return createClearRedirect(
        `/auth?redirectUri=${encodeURIComponent(pathname)}`,
        req
      );
    }

    return NextResponse.next();
  }

  if (isAuthRoute(pathname)) {
    return createRedirectWithCookies("/dashboard", req, newCookies);
  }

  if (isAdminRoute(pathname)) {
    if (!isAdminOrOwner(userPayload.role)) {
      return createRedirectWithCookies("/", req, newCookies);
    }
  }

  const response = NextResponse.next();
  return setNewCookiesToResponse(response, newCookies);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
