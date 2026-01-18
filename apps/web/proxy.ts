import { adminRoutes, authRoutes, userRoutes } from '@lib/constants';
import { getStoreConfig } from '@lib/store-config';
import { Locale } from '@repo/database/client';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  LOCALE_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  STORE_TYPE_COOKIE_NAME,
  StoreZodOutputType,
  TokenPayload,
} from '@repo/types';
import { jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import parse, { Cookie, splitCookiesString } from 'set-cookie-parser';
const countryToLocale: Record<string, Locale> = {
  TR: 'TR',
  CY: 'TR',

  DE: 'DE',
  AT: 'DE',
  CH: 'DE',
  LI: 'DE',

  US: 'EN',
  GB: 'EN',
  AU: 'EN',
  CA: 'EN',
  IE: 'EN',
  NZ: 'EN',
};

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
  storeType: 'B2C' | 'B2B';
  shouldRedirect: boolean;
  redirectUrl?: string;
  shouldRewrite: boolean;
  rewritePath?: string;
}

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

function getGeoLocale(
  req: NextRequest,
  availableLocales: string[],
): Locale | null {
  const country = req.headers.get('cf-ipcountry');

  if (!country || country === 'XX') return null;

  const locale = countryToLocale[country];
  if (locale && availableLocales.includes(locale)) {
    return locale as Locale;
  }

  return null;
}

function getBrowserLocale(
  req: NextRequest,
  availableLocales: string[],
): Locale | null {
  const acceptLanguage = req.headers.get('accept-language');
  if (!acceptLanguage) return null;

  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [code, qValue] = lang.trim().split(';');
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;

      const locale = code.split('-')[0].toUpperCase();
      return { locale, quality };
    })
    .sort((a, b) => b.quality - a.quality);
  for (const { locale } of languages) {
    if (availableLocales.includes(locale)) {
      return locale as Locale;
    }
  }

  return null;
}

function resolveLocaleContext(
  req: NextRequest,
  config: StoreZodOutputType | null,
): LocaleContext {
  const { pathname, hostname } = req.nextUrl;
  const cookieLocale = req.cookies
    .get(LOCALE_COOKIE_NAME)
    ?.value?.toUpperCase() as Locale | undefined;

  if (!config) {
    return {
      locale: cookieLocale || 'TR',
      storeType: 'B2C',
      shouldRedirect: false,
      shouldRewrite: false,
    };
  }

  const storeType = determineStoreType(hostname, config);
  const isB2B = storeType === 'B2B';

  const defaultLocale = (
    isB2B ? config.b2bDefaultLocale : config.b2cDefaultLocale
  ) as Locale;
  const localeCurrencies = isB2B
    ? config.b2bLocaleCurrencies
    : config.b2cLocaleCurrencies;
  const availableLocales = localeCurrencies.map((lc) =>
    lc.locale.toUpperCase(),
  );

  let resolvedLocale: Locale = defaultLocale;
  let shouldRedirect = false;
  let redirectUrl: string | undefined;
  let shouldRewrite = false;
  let rewritePath: string | undefined;

  const shouldSkipLocaleHandling =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/auth') ||
    pathname.includes('.');

  if (shouldSkipLocaleHandling) {
    const finalLocale =
      cookieLocale ||
      getGeoLocale(req, availableLocales) ||
      getBrowserLocale(req, availableLocales) ||
      defaultLocale;
    return {
      locale: finalLocale,
      storeType,
      shouldRedirect: false,
      shouldRewrite: false,
    };
  }

  const { locale: pathLocale, cleanPath } = extractLocaleFromPath(pathname);

  if (pathLocale && availableLocales.includes(pathLocale)) {
    if (pathLocale === defaultLocale) {
      shouldRedirect = true;
      redirectUrl = cleanPath || '/';
      resolvedLocale = defaultLocale;
    } else {
      resolvedLocale = pathLocale;
      shouldRewrite = true;
      rewritePath = cleanPath || '/';
    }
  } else if (pathLocale && !availableLocales.includes(pathLocale)) {
    shouldRedirect = true;
    redirectUrl = cleanPath || '/';
    resolvedLocale =
      cookieLocale || getBrowserLocale(req, availableLocales) || defaultLocale;
  } else {
    resolvedLocale =
      cookieLocale || getBrowserLocale(req, availableLocales) || defaultLocale;
  }

  return {
    locale: resolvedLocale,
    storeType,
    shouldRedirect,
    redirectUrl,
    shouldRewrite,
    rewritePath,
  };
}

function setLocaleCookies(
  response: NextResponse,
  context: LocaleContext,
): NextResponse {
  response.cookies.set(LOCALE_COOKIE_NAME, context.locale, {
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

  if (localeContext.shouldRedirect && localeContext.redirectUrl) {
    const redirectResponse = NextResponse.redirect(
      new URL(localeContext.redirectUrl, req.url),
    );
    return setLocaleCookies(redirectResponse, localeContext);
  }

  if (localeContext.shouldRewrite && localeContext.rewritePath) {
    const rewriteUrl = new URL(localeContext.rewritePath, req.url);
    const response = NextResponse.rewrite(rewriteUrl);
    return setLocaleCookies(response, localeContext);
  }

  if (!isProtectedRoute(pathname) && !isAuthRoute(pathname)) {
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
    if (isProtectedRoute(pathname)) {
      if (isAdminRoute(pathname)) {
        const response = createClearRedirect('/', req);
        return setLocaleCookies(response, localeContext);
      }
      const response = createClearRedirect(
        `/auth?redirectUri=${encodeURIComponent(pathname)}`,
        req,
      );
      return setLocaleCookies(response, localeContext);
    }

    const response = NextResponse.next();
    return setLocaleCookies(response, localeContext);
  }

  if (isAuthRoute(pathname)) {
    const response = createRedirectWithCookies('/dashboard', req, newCookies);
    return setLocaleCookies(response, localeContext);
  }

  if (isAdminRoute(pathname)) {
    if (!isAdminOrOwner(userPayload.role)) {
      const response = createRedirectWithCookies('/', req, newCookies);
      return setLocaleCookies(response, localeContext);
    }
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
