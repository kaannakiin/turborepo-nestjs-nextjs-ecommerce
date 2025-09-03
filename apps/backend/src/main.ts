import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const configService = app.get<ConfigService>(ConfigService);
  const allowedOrigins =
    configService.get<string>('NODE_ENV') === 'production'
      ? [
          'https://terravivashop.com',
          'https://www.terravivashop.com',
          'https://api.terravivashop.com', // Backend subdomain'i de ekle
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];
  console.log(allowedOrigins, configService.get<string>('NODE_ENV'));
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(configService.get<string>('PORT') ?? 3001, '0.0.0.0'); // 0.0.0.0 ekle
}
bootstrap();
