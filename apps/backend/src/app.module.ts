import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import Redis from 'ioredis';
import { NestMinioModule } from 'nestjs-minio';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { LocationsModule } from './locations/locations.module';
import { MinioModule } from './minio/minio.module';
import { PaymentModule } from './payment/payment.module';
import { PrismaModule } from './prisma/prisma.module';
import { ShippingModule } from './shipping/shipping.module';
import { UserPageModule } from './user-page/user-page.module';
import { UserModule } from './user/user.module';
import { CartV3Module } from './cart-v3/cart-v3.module';
import { ChatModule } from './ai/chat/chat.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    NestMinioModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        endPoint: configService.get<string>('MINIO_ENDPOINT_SETTINGS'),
        port: parseInt(configService.get<string>('MINIO_PORT')) || 443,
        useSSL: configService.get<string>('MINIO_USE_SSL') === 'true',
        accessKey: configService.get<string>('MINIO_ACCESS_KEY'),
        secretKey: configService.get<string>('MINIO_SECRET_KEY'),
      }),
      inject: [ConfigService],
    }),
    MinioModule,
    LocationsModule,
    UserPageModule,
    ShippingModule,
    PaymentModule,
    CartV3Module,
    ChatModule,
    // ThrottlerModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (config: ConfigService) => {
    //     const redisClient = new Redis(config.get('REDIS_URL'), {
    //       maxRetriesPerRequest: 3,
    //       retryStrategy: (times) => {
    //         const delay = Math.min(times * 50, 2000);
    //         return delay;
    //       },
    //       reconnectOnError: (err) => {
    //         const targetError = 'READONLY';
    //         if (err.message.includes(targetError)) {
    //           return true;
    //         }
    //         return false;
    //       },
    //     });

    //     redisClient.on('connect', () => {
    //       console.log('✅ Redis connected for throttler');
    //     });

    //     redisClient.on('error', (err) => {
    //       console.error('❌ Redis error:', err);
    //     });

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
    //       storage: new ThrottlerStorageRedisService(redisClient),
    //     };
    //   },
    // }),
  ],
  controllers: [],
  // providers: [
  //   {
  //     provide: APP_GUARD,
  //     useClass: ThrottlerGuard,
  //   },
  // ],
})
export class AppModule {}
