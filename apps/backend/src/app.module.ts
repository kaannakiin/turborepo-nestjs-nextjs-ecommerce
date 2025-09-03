import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { NestMinioModule } from 'nestjs-minio';
import { MinioModule } from './minio/minio.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AdminModule,
    NestMinioModule.register({
      isGlobal: true,
      endPoint: 'cdn.wellnessclubbyoyku.com',
      accessKey: 'mJjuqqxwBBcD32ns',
      secretKey: 'Q3UIEr9TReqY0Seego5AMHPBOxu8iA57',
    }),
    MinioModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
