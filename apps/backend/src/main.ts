import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { doubleCsrf } from 'csrf-csrf';
import * as ExpressUseragent from 'express-useragent';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { CsrfService } from './auth/csrf.service';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const configService = app.get<ConfigService>(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    const isProduction = nodeEnv === 'production';
    const domain = configService.get<string>('DOMAIN'); // Örn: .mydomain.com
    const csrfService = app.get(CsrfService);
    app.use(
      helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }),
    );

    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

    app.use(ExpressUseragent.express());

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
      allowedOrigins = ['http://localhost:3000'];
    }

    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-Token',
        'User-Agent',
        'x-goog-api-key',
      ],

      credentials: true,
      maxAge: 86400,
    });

    const csrfEnabled = configService.get<boolean>('CSRF_ENABLED', true);
    if (csrfEnabled) {
      const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
        getSecret: () => configService.getOrThrow<string>('CSRF_SECRET'),

        cookieName: isProduction ? '__Secure-csrf-token' : 'csrf-token',

        cookieOptions: {
          httpOnly: true,
          sameSite: isProduction ? 'none' : 'lax',
          secure: isProduction,
          path: '/',
          ...(isProduction && domain ? { domain: domain } : {}),
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
        getSessionIdentifier: (req) => req.ip || 'unknown',
      });
      csrfService.generateCsrfToken = generateCsrfToken;
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
        ];

        if (excludedPaths.includes(req.path)) {
          return next();
        }

        doubleCsrfProtection(req, res, next);
      });
    }

    app.enableShutdownHooks();

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
