import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const allowedOrigins =
    process.env.NODE_ENV === 'production'
      ? [
          'https://terravivashop.com',
          'https://www.terravivashop.com',
          'https://api.terravivashop.com', // Backend subdomain'i de ekle
        ]
      : ['http://localhost:3000', 'http://127.0.0.1:3000'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0'); // 0.0.0.0 ekle
}
bootstrap();
