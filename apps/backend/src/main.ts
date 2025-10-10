import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import * as ExpressUseragent from 'express-useragent';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const configService = app.get<ConfigService>(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';

    // ✅ 1. HELMET - Güvenlik header'ları
    app.use(
      helmet({
        contentSecurityPolicy: isProduction ? undefined : false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    // ✅ 2. Cookie Parser (CSRF'den önce olmalı)
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

    // ✅ 3. User Agent
    app.use(ExpressUseragent.express());

    // ✅ 4. CORS - CSRF'DEN ÖNCE OLMALI! (ÇOK ÖNEMLİ)
    let allowedOrigins: string[] | boolean;
    if (isProduction) {
      const originsFromEnv = configService.get<string>('ALLOWED_ORIGINS');
      if (!originsFromEnv) {
        throw new Error('ALLOWED_ORIGINS must be set in production');
      }
      allowedOrigins = originsFromEnv
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
    } else {
      allowedOrigins = true;
    }

    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
      ],
      exposedHeaders: ['Set-Cookie'],
      credentials: true,
      maxAge: 86400,
    });

    const csrfEnabled = configService.get<boolean>('CSRF_ENABLED', true);

    if (csrfEnabled) {
      const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
        getSecret: () => configService.getOrThrow<string>('CSRF_SECRET'),
        cookieName: 'csrf-token',
        cookieOptions: {
          httpOnly: false,
          sameSite: isProduction ? 'none' : 'lax',
          secure: isProduction,
          path: '/',
          ...(isProduction
            ? { domain: configService.get<string>('DOMAIN') }
            : {}),
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getCsrfTokenFromRequest: (req) => {
          const token = req.headers['x-csrf-token'] as string;

          return token;
        },
        getSessionIdentifier: (req) => {
          const sessionId = req.ip || req.socket.remoteAddress || 'unknown';
          return sessionId;
        },
      });
      app.use((req, res, next) => {
        const cookieName = 'csrf-token';

        if (!req.cookies[cookieName]) {
          generateCsrfToken(req, res, {
            overwrite: true,
          }); // overwrite: true
        }

        req['csrfToken'] = generateCsrfToken;
        next();
      });
      app.use((req, res, next) => {
        const paymentCallback = configService.get<string>(
          'IYZICO_CALLBACK_URL',
          'http://localhost:3001/payment/iyzico/three-d-callback',
        );
        const paymentCallbackUrl = new URL(paymentCallback);

        const excludedPaths = [
          '/auth/csrf',
          '/auth/refresh',
          '/payment/iyzico/webhook',
          paymentCallbackUrl.pathname,
          '/user-categories/get-category-products',
        ];

        if (excludedPaths.includes(req.path)) {
          return next();
        }

        doubleCsrfProtection(req, res, next);
      });

      // CSRF token generator'ı ekle
      app.use((req, _res, next) => {
        req['csrfToken'] = generateCsrfToken;
        next();
      });
    }

    // ✅ 6. Graceful Shutdown
    app.enableShutdownHooks();

    // ✅ 7. Port Configuration
    const port = configService.get<number>('PORT', 3001);
    await app.listen(port);

    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
