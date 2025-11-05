import { Global, Module } from '@nestjs/common';
import { PrismaLoggerService } from './prisma-logger.service';

@Global()
@Module({
  controllers: [],
  providers: [PrismaLoggerService],
  exports: [PrismaLoggerService],
})
export class PrismaLoggerModule {}
