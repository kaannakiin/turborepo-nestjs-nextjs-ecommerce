import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { NestMinioModule } from 'nestjs-minio';
import { MinioModule } from './minio/minio.module';
import { LocationsModule } from './locations/locations.module';
import { DiscountsModule } from './discounts/discounts.module';
import { UserPageModule } from './user-page/user-page.module';
import { CartModule } from './cart/cart.module';
import { ShippingModule } from './shipping/shipping.module';
import { PaymentModule } from './payment/payment.module';

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
    DiscountsModule,
    UserPageModule,
    CartModule,
    ShippingModule,
    PaymentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
