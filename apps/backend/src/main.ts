import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    const configService = app.get<ConfigService>(ConfigService);
    const nodeEnv = configService.get<string>('NODE_ENV');

    let allowedOrigins: string[];

    if (nodeEnv === 'production') {
      const originsFromEnv = configService.get<string>('ALLOWED_ORIGINS');
      if (!originsFromEnv) {
        throw new Error('ALLOWED_ORIGINS must be set in production');
      }
      allowedOrigins = originsFromEnv.split(',').map((origin) => origin.trim());
    } else {
      allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
    }

    console.log('Allowed CORS Origins:', allowedOrigins);
    console.log('Environment:', nodeEnv);

    app.enableCors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const port = parseInt(configService.get<string>('PORT') || '3001', 10);

    await app.listen(port, '0.0.0.0');

    console.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
