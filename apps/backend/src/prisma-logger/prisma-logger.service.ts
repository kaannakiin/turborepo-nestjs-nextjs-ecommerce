// src/common/services/prisma-logger.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PrismaLoggerService {
  private readonly logger = new Logger(PrismaLoggerService.name);

  constructor(private prisma: PrismaService) {}

  async logError(
    error: Error,
    context: string,
    meta: Record<string, any> = {},
  ) {
    try {
      await this.prisma.errorLog.create({
        data: {
          message: error.message,
          stack: error.stack,
          context: context,
          meta: meta || {},
          errorCode: (error as any).code,
        },
      });
    } catch (logError) {
      this.logger.error(
        `[CRITICAL] ErrorLog'a YAZMA BAŞARISIZ OLDU: ${logError.message}`,
      );
      this.logger.error(
        `[ORIGINAL ERROR] Context: ${context}, Error: ${error.message}`,
      );
    }
  }
}
