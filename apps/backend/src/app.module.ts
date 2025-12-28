import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestMinioModule } from 'nestjs-minio';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './ai/chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { CartV3Module } from './cart-v3/cart-v3.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { MinioModule } from './minio/minio.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaLoggerModule } from './prisma-logger/prisma-logger.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ShippingModule } from './shipping/shipping.module';
import { UserModule } from './user/user.module';
@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
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
    CartV3Module,
    ChatModule,
    PaymentsModule,
    OrdersModule,
    PrismaLoggerModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
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
  providers: [
    //   {
    //     provide: APP_GUARD,
    //     useClass: ThrottlerGuard,
    //   },
  ],
})
export class AppModule {}
