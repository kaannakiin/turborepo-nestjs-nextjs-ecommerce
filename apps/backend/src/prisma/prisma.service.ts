import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@repo/database';
import pg from 'pg';

const { Pool } = pg;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private pool: pg.Pool; // 👈 Pool instance'ı sakla

  constructor(private configService: ConfigService) {
    // 1. Önce Pool oluştur (timeout ayarlarıyla)
    const pool = new Pool({
      connectionString: configService.getOrThrow<string>('DATABASE_URL'),
      max: 20, // Max connection sayısı
      idleTimeoutMillis: 30000, // Idle connection timeout
      connectionTimeoutMillis: 10000, // 👈 CRITICAL: Connection timeout
      keepAlive: true, // 👈 CRITICAL: TCP keepalive
      keepAliveInitialDelayMillis: 10000, // Keepalive başlangıç delay
      ssl: false,
    });

    // 2. Pool'u adapter'a ver
    const adapter = new PrismaPg(pool);

    // 3. PrismaClient'ı initialize et
    super({
      adapter,
      omit: {
        user: {
          password: true,
        },
      },
      log:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

    this.pool = pool;

    this.logger.log(
      `Database configured: ${configService.getOrThrow<string>('DATABASE_URL').substring(0, 30)}...`,
    );
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected successfully');

      // Health check
      await this.$queryRaw`SELECT 1`;
      this.logger.log('✅ Database health check passed');
    } catch (error) {
      this.logger.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end(); // 👈 Pool'u da kapat
    this.logger.log('Database disconnected');
  }

  // Bonus: Health check endpoint için
  async isHealthy(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
