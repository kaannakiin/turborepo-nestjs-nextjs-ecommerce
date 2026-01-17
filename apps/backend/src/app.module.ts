import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { NestMinioModule } from 'nestjs-minio';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './ai/chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { CategoriesModule } from './categories/categories.module';
import { SharedModule } from './common/services/shared.module';
import { LocationsModule } from './locations/locations.module';
import { MinioModule } from './minio/minio.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ShippingModule } from './shipping/shipping.module';
import { UserModule } from './user/user.module';
import { ClientContextGuard } from './common/guards/client-context.guard';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      global: true,
    }),
    SharedModule,
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        config: {
          namespace: 'cache',
          url: config.getOrThrow<string>('REDIS_CACHE_URL'),
          reconnectOnError: (err) => {
            const targetError = 'READONLY';
            return err.message.includes(targetError);
          },
        },
      }),
    }),
    AdminModule,
    NestMinioModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => {
        const accessKey = configService.getOrThrow<string>('MINIO_ACCESS_KEY');
        const secretKey = configService.getOrThrow<string>('MINIO_SECRET_KEY');
        const endpointRaw = configService.getOrThrow<string>('MINIO_ENDPOINT');
        const url = new URL(endpointRaw);

        const settings = {
          endPoint: url.hostname,
          port: parseInt(url.port) || (url.protocol === 'https:' ? 443 : 80),
          useSSL: url.protocol === 'https:',
          accessKey,
          secretKey,
        };
        console.log('MinIO Bağlantı Ayarları:', settings);
        return {
          ...settings,
        };
      },
      inject: [ConfigService],
    }),
    MinioModule,
    LocationsModule,
    ShippingModule,
    ChatModule,
    PaymentsModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => {
    //     return {
    //       throttlers: [
    //         {
    //           name: 'global',
    //           ttl: 60000, // 1 dakika
    //           limit: 100, // 100 istek
    //         },
    //         {
    //           name: 'auth',
    //           ttl: 60000, // 1 dakika
    //           limit: 5, // sadece 5 istek
    //         },
    //         {
    //           name: 'auth-strict',
    //           ttl: 300000, // 5 dakika
    //           limit: 5, // sadece 5 istek
    //         },
    //         {
    //           name: 'refresh',
    //           ttl: 60000, // 1 dakika
    //           limit: 10, // 10 istek
    //         },
    //       ],
    //       errorMessage:
    //         'Çok fazla istek yapıldı. Lütfen bir süre sonra tekrar deneyin.',
    //       storage: new ThrottlerStorageRedisService(
    //         config.getOrThrow('REDIS_RATE_LIMIT_URL'),
    //       ),
    //     };
    //   },
    // }),
  ],
  controllers: [],
  providers: [
    {
      //   {
      //     provide: APP_GUARD,
      //     useClass: ThrottlerGuard,
      //   },
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ClientContextGuard,
    },
  ],
})
export class AppModule {}
