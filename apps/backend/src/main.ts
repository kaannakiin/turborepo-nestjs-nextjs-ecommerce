import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { TokenPayload } from '@repo/types';
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

    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));

    app.use(ExpressUseragent.express());

    const csrfEnabled = configService.get<boolean>('CSRF_ENABLED', true);
    if (csrfEnabled) {
      const { generateCsrfToken, doubleCsrfProtection } = doubleCsrf({
        getSecret: () => configService.getOrThrow<string>('CSRF_SECRET'),
        cookieName: '__Host-csrf-token',
        cookieOptions: {
          httpOnly: true,
          sameSite: 'lax',
          secure: isProduction,
          ...(nodeEnv === 'production' && {
            domain: configService.get('DOMAIN') as string,
          }),
        },
        size: 64,
        ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
        getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,

        getSessionIdentifier: (req) => {
          const user = req.user as TokenPayload | null | undefined;
          if (user?.id) {
            return user.id;
          }
          const ip = req.ip || req.socket.remoteAddress || 'unknown';
          const userAgent = req.headers['user-agent'] || 'unknown';
          return `${ip}-${userAgent}`;
        },
      });
      app.use(doubleCsrfProtection);
      app.use((req, _res, next) => {
        req['csrfToken'] = generateCsrfToken;
        next();
      });
    }

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

    console.log('🌍 Allowed CORS Origins:', allowedOrigins);
    console.log('🔧 Environment:', nodeEnv);
    console.log('🛡️  CSRF Protection:', csrfEnabled ? 'Enabled' : 'Disabled');

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

    // ✅ 8. Graceful Shutdown
    app.enableShutdownHooks();

    // ✅ 9. Port Configuration
    const port = configService.get<number>('PORT', 3001);

    await app.listen(port);

    console.log(`✅ Application is running on: ${await app.getUrl()}`);

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
