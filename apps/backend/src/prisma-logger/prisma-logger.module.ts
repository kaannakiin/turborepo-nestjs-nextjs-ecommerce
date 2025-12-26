import { Global, Module } from '@nestjs/common';
import { PrismaLoggerService } from './prisma-logger.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Global()
@Module({
  controllers: [],
  providers: [PrismaLoggerService],
  exports: [PrismaLoggerService],
  imports: [PrismaModule],
})
export class PrismaLoggerModule {}
