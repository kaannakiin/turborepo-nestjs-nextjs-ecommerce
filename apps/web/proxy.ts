import {
  ACCESS_TOKEN_COOKIE_NAME,
  adminRoutes,
  authRoutes,
  CURRENCY_COOKIE_NAME,
  LOCALE_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  STORE_TYPE_COOKIE_NAME,
  userRoutes,
} from '@lib/constants';
import { getStoreConfig } from '@lib/store-config';
import { Locale } from '@repo/database/client';
import { StoreZodOutputType, TokenPayload } from '@repo/types';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import parse, { Cookie, splitCookiesString } from 'set-cookie-parser';

type SameSite = true | false | 'lax' | 'strict' | 'none' | undefined;

const JWT_ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_ACCESS_TOKEN_SECRET || 'secret-yoksa-patlar',
);

const clearCookies = (response: NextResponse) => {
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
  return response;
};

const setCookieFromParsed = (response: NextResponse, cookie: Cookie) => {
  response.cookies.set(cookie.name, cookie.value, {
    httpOnly: cookie.httpOnly ?? true,
    secure: cookie.secure ?? false,
    sameSite: (cookie.sameSite as SameSite) ?? 'lax',
    path: cookie.path ?? '/',
    domain: cookie.domain,
    expires: cookie.expires,
    maxAge: cookie.maxAge,
  });
};

const setNewCookiesToResponse = (
  response: NextResponse,
  newCookies: Cookie[],
) => {
  newCookies.forEach((cookie) => {
    setCookieFromParsed(response, cookie);
  });
  return response;
};

const createRedirectWithCookies = (
  url: string,
  req: NextRequest,
  newCookies: Cookie[],
) => {
  const response = NextResponse.redirect(new URL(url, req.url));
  return setNewCookiesToResponse(response, newCookies);
};

const createClearRedirect = (url: string, req: NextRequest) => {
  const response = NextResponse.redirect(new URL(url, req.url));
  return clearCookies(response);
};

const isAuthRoute = (path: string) =>
  authRoutes.some((route) => path.startsWith(route));

const isAdminRoute = (path: string) =>
  adminRoutes.some((route) => path.startsWith(route));

const isUserRoute = (path: string) =>
  userRoutes.some((route) => path.startsWith(route));

const isProtectedRoute = (path: string) =>
  isAdminRoute(path) || isUserRoute(path);

const isAdminOrOwner = (role?: string) => role === 'ADMIN' || role === 'OWNER';

async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_ACCESS_TOKEN_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

interface LocaleContext {
  locale: Locale;
  currency: string;
  storeType: 'B2C' | 'B2B';
  shouldRedirect: boolean;
  redirectUrl?: string;
  // PATH_PREFIX için rewrite path (URL'de /tr/products görünür, /products'a rewrite edilir)
  rewritePath?: string;
}

/**
 * Host'tan subdomain çıkarır
 * Örn: "tr.wellnessclubbyoyku.com" -> "TR"
 * Örn: "wellnessclubbyoyku.com" -> null
 * Örn: "b2b.wellnessclubbyoyku.com" -> "B2B"
 */
function extractSubdomain(
  hostname: string,
  customDomain: string | null,
): string | null {
  if (!customDomain) return null;

  if (hostname.includes('localhost')) {
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'localhost') {
      return parts[0].toUpperCase();
    }
    return null;
  }

  const baseDomain = customDomain.toLowerCase();
  const currentHost = hostname.toLowerCase();

  if (currentHost === baseDomain) {
    return null;
  }

  if (currentHost.endsWith(`.${baseDomain}`)) {
    const subdomain = currentHost.replace(`.${baseDomain}`, '');
    return subdomain.toUpperCase();
  }

  return null;
}

/**
 * Path'ten locale prefix'i çıkarır
 * Örn: "/tr/products" -> { locale: "TR", cleanPath: "/products" }
 * Örn: "/products" -> { locale: null, cleanPath: "/products" }
 */
function extractLocaleFromPath(pathname: string): {
  locale: Locale | null;
  cleanPath: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) {
    return { locale: null, cleanPath: '/' };
  }

  const firstSegment = segments[0].toUpperCase();
  if (Object.keys(Locale).includes(firstSegment as Locale)) {
    const cleanPath = '/' + segments.slice(1).join('/') || '/';
    return { locale: firstSegment as Locale, cleanPath };
  }

  return { locale: null, cleanPath: pathname };
}

/**
 * Store config'den locale için currency bulur
 */
function getCurrencyForLocale(
  locale: Locale,
  localeCurrencies: Array<{ locale: string; currency: string }>,
  defaultLocale: string,
): string {
  const match = localeCurrencies.find((lc) => lc.locale === locale);
  if (match) return match.currency;

  const defaultMatch = localeCurrencies.find(
    (lc) => lc.locale === defaultLocale,
  );
  if (defaultMatch) return defaultMatch.currency;

  return localeCurrencies[0]?.currency || 'TRY';
}

/**
 * Store type'ı belirler (B2C vs B2B)
 */
function determineStoreType(
  hostname: string,
  config: StoreZodOutputType,
): 'B2C' | 'B2B' {
  if (!config.isB2BActive) return 'B2C';
  if (!config.isB2CActive) return 'B2B';

  const currentHost = hostname.toLowerCase();

  if (config.b2bCustomDomain) {
    if (
      currentHost === config.b2bCustomDomain.toLowerCase() ||
      currentHost.endsWith(`.${config.b2bCustomDomain.toLowerCase()}`)
    ) {
      return 'B2B';
    }
  }

  if (config.b2bSubdomain) {
    const b2bSubdomain = config.b2bSubdomain.toLowerCase();
    if (
      currentHost.startsWith(`${b2bSubdomain}.`) ||
      currentHost === b2bSubdomain
    ) {
      return 'B2B';
    }
  }

  return 'B2C';
}

/**
 * Locale context'i belirler - routing stratejisine göre
 */
function resolveLocaleContext(
  req: NextRequest,
  config: StoreZodOutputType | null,
): LocaleContext {
  const { pathname, hostname } = req.nextUrl;
  const cookieLocale = req.cookies.get(LOCALE_COOKIE_NAME)?.value as
    | Locale
    | undefined;

  if (!config) {
    return {
      locale: cookieLocale || 'TR',
      currency: 'TRY',
      storeType: 'B2C',
      shouldRedirect: false,
    };
  }

  const storeType = determineStoreType(hostname, config);
  const isB2B = storeType === 'B2B';

  const routing = isB2B ? config.b2bRouting : config.b2cRouting;
  const defaultLocale = (
    isB2B ? config.b2bDefaultLocale : config.b2cDefaultLocale
  ) as Locale;
  const localeCurrencies = isB2B
    ? config.b2bLocaleCurrencies
    : config.b2cLocaleCurrencies;
  const customDomain = isB2B ? config.b2bCustomDomain : config.b2cCustomDomain;
  const availableLocales = localeCurrencies.map((lc) =>
    lc.locale.toUpperCase(),
  );

  let resolvedLocale: Locale = defaultLocale;
  let shouldRedirect = false;
  let redirectUrl: string | undefined;
  let rewritePath: string | undefined;

  switch (routing) {
    case 'SUBDOMAIN': {
      const subdomain = extractSubdomain(hostname, customDomain);

      if (
        subdomain &&
        availableLocales.includes(subdomain) &&
        Object.keys(Locale).includes(subdomain as Locale)
      ) {
        resolvedLocale = subdomain as Locale;
      } else if (subdomain && !availableLocales.includes(subdomain)) {
        resolvedLocale = defaultLocale;
      } else {
        resolvedLocale =
          cookieLocale && availableLocales.includes(cookieLocale)
            ? cookieLocale
            : defaultLocale;
      }
      break;
    }

    case 'PATH_PREFIX': {
      const { locale: pathLocale, cleanPath } = extractLocaleFromPath(pathname);

      if (pathLocale && availableLocales.includes(pathLocale)) {
        // Geçerli locale prefix var - rewrite yap
        resolvedLocale = pathLocale;
        // Admin, auth, api, static dosyalar için rewrite yapma
        if (
          !pathname.startsWith('/_next') &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/auth') &&
          !pathname.includes('.')
        ) {
          rewritePath = cleanPath;
        }
      } else if (pathLocale && !availableLocales.includes(pathLocale)) {
        // Geçersiz locale prefix - default locale'e redirect
        shouldRedirect = true;
        redirectUrl = `/${defaultLocale.toLowerCase()}${cleanPath}`;
        resolvedLocale = defaultLocale;
      } else {
        // Locale prefix yok
        const targetLocale =
          cookieLocale && availableLocales.includes(cookieLocale)
            ? cookieLocale
            : defaultLocale;

        // Admin, auth, api, static dosyalar için redirect yapma
        if (
          !pathname.startsWith('/_next') &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/admin') &&
          !pathname.startsWith('/auth') &&
          !pathname.includes('.')
        ) {
          shouldRedirect = true;
          redirectUrl = `/${targetLocale.toLowerCase()}${pathname}`;
        }
        resolvedLocale = targetLocale;
      }
      break;
    }

    case 'COOKIE_ONLY':
    default: {
      resolvedLocale =
        cookieLocale && availableLocales.includes(cookieLocale)
          ? cookieLocale
          : defaultLocale;
      break;
    }
  }

  const currency = getCurrencyForLocale(
    resolvedLocale,
    localeCurrencies,
    defaultLocale,
  );

  return {
    locale: resolvedLocale,
    currency,
    storeType,
    shouldRedirect,
    redirectUrl,
    rewritePath,
  };
}

/**
 * Response'a locale cookie'lerini ekler
 */
function setLocaleCookies(
  response: NextResponse,
  context: LocaleContext,
): NextResponse {
  response.cookies.set(LOCALE_COOKIE_NAME, context.locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  response.cookies.set(CURRENCY_COOKIE_NAME, context.currency, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  response.cookies.set(STORE_TYPE_COOKIE_NAME, context.storeType, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const storeConfig = await getStoreConfig();

  const localeContext = resolveLocaleContext(req, storeConfig);

  // PATH_PREFIX redirect (locale prefix yoksa ekle)
  if (localeContext.shouldRedirect && localeContext.redirectUrl) {
    const redirectResponse = NextResponse.redirect(
      new URL(localeContext.redirectUrl, req.url),
    );
    return setLocaleCookies(redirectResponse, localeContext);
  }

  // Effective path - rewrite varsa onu kullan, yoksa pathname
  const effectivePath = localeContext.rewritePath || pathname;

  // Protected/Auth route değilse
  if (!isProtectedRoute(effectivePath) && !isAuthRoute(effectivePath)) {
    // PATH_PREFIX rewrite gerekiyorsa uygula
    if (localeContext.rewritePath) {
      const url = req.nextUrl.clone();
      url.pathname = localeContext.rewritePath;
      const response = NextResponse.rewrite(url);
      return setLocaleCookies(response, localeContext);
    }
    const response = NextResponse.next();
    return setLocaleCookies(response, localeContext);
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
          method: 'POST',
          credentials: 'include',
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        },
      );

      if (refreshReq.ok) {
        const setCookies = refreshReq.headers.get('Set-Cookie');
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
            (c) => c.name === ACCESS_TOKEN_COOKIE_NAME,
          )?.value;
          if (newTokenValue) {
            userPayload = await verifyAccessToken(newTokenValue);
          }
        }
      }
    } catch (error) {
      console.error('Refresh failed', error);
    }
  }

  if (!userPayload) {
    if (isProtectedRoute(effectivePath)) {
      if (isAdminRoute(effectivePath)) {
        const response = createClearRedirect('/', req);
        return setLocaleCookies(response, localeContext);
      }
      // Redirect URL'de orijinal pathname kullan (locale prefix dahil)
      const response = createClearRedirect(
        `/auth?redirectUri=${encodeURIComponent(pathname)}`,
        req,
      );
      return setLocaleCookies(response, localeContext);
    }

    // Rewrite gerekiyorsa uygula
    if (localeContext.rewritePath) {
      const url = req.nextUrl.clone();
      url.pathname = localeContext.rewritePath;
      const response = NextResponse.rewrite(url);
      return setLocaleCookies(response, localeContext);
    }
    const response = NextResponse.next();
    return setLocaleCookies(response, localeContext);
  }

  if (isAuthRoute(effectivePath)) {
    const response = createRedirectWithCookies('/dashboard', req, newCookies);
    return setLocaleCookies(response, localeContext);
  }

  if (isAdminRoute(effectivePath)) {
    if (!isAdminOrOwner(userPayload.role)) {
      const response = createRedirectWithCookies('/', req, newCookies);
      return setLocaleCookies(response, localeContext);
    }
  }

  // Rewrite gerekiyorsa uygula
  if (localeContext.rewritePath) {
    const url = req.nextUrl.clone();
    url.pathname = localeContext.rewritePath;
    const response = NextResponse.rewrite(url);
    setNewCookiesToResponse(response, newCookies);
    return setLocaleCookies(response, localeContext);
  }

  const response = NextResponse.next();
  setNewCookiesToResponse(response, newCookies);
  return setLocaleCookies(response, localeContext);
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
