import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  Currency,
  Locale,
  Prisma,
  RoutingStrategy,
  StoreType,
} from '@repo/database';
import { StoreZodOutputType } from '@repo/types';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';
import { StoreDto } from './store-dto';

const STORE_CONFIG_CACHE_KEY = 'store_config:full';
const STORE_CONFIG_TTL = 60 * 60 * 24 * 7; // 7 gün

@Injectable()
export class StoreService implements OnModuleInit {
  private readonly logger = new Logger(StoreService.name);
  private redis: Redis | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.redis = this.redisService.getOrThrow('cache');
  }

  @OnEvent('store.updated')
  async handleStoreUpdated() {
    await this.invalidateStoreConfigCache();
    this.logger.log('Store config cache invalidated');
  }

  private async invalidateStoreConfigCache(): Promise<void> {
    if (this.redis) {
      await this.redis.del(STORE_CONFIG_CACHE_KEY);
    }
  }

  async upsertBothStores(dto: StoreDto) {
    return await this.prisma.$transaction(async (tx) => {
      let organization = await tx.organization.findFirst();

      if (!organization) {
        organization = await tx.organization.create({
          data: { name: dto.name },
        });
      } else {
        organization = await tx.organization.update({
          where: { id: organization.id },
          data: { name: dto.name },
        });
      }

      const results = {
        b2c: null,
        b2b: null,
      };

      if (dto.isB2CActive) {
        results.b2c = await this.upsertStoreByType(tx, organization.id, 'B2C', {
          name: dto.name,
          customDomain: dto.b2cCustomDomain,
          routing: dto.b2cRouting,
          defaultLocale: dto.b2cDefaultLocale,
          localeCurrencies: dto.b2cLocaleCurrencies,
        });
      } else {
        await this.deactivateStore(tx, organization.id, 'B2C');
      }

      if (dto.isB2BActive) {
        results.b2b = await this.upsertStoreByType(tx, organization.id, 'B2B', {
          name: dto.name,
          customDomain: dto.b2bCustomDomain,
          subdomain: dto.b2bSubdomain,
          routing: dto.b2bRouting,
          defaultLocale: dto.b2bDefaultLocale,
          localeCurrencies: dto.b2bLocaleCurrencies,
        });
      } else {
        await this.deactivateStore(tx, organization.id, 'B2B');
      }

      if (results.b2c) {
        this.eventEmitter.emit('store.updated', { storeId: results.b2c.id });
      }
      if (results.b2b) {
        this.eventEmitter.emit('store.updated', { storeId: results.b2b.id });
      }

      return results;
    });
  }

  private async upsertStoreByType(
    tx: Prisma.TransactionClient,
    organizationId: string,
    type: StoreType,
    data: {
      name: string;
      customDomain?: string | null;
      subdomain?: string | null;
      routing?: string;
      defaultLocale: string;
      localeCurrencies: Array<{ locale: string; currency: string }>;
    },
  ) {
    let store = await tx.store.findFirst({
      where: {
        organizationId: organizationId,
        type: type,
      },
    });

    const subdomain = data.subdomain || this.generateSubdomain(data.name, type);

    const storeNameSuffix = type === 'B2B' ? '(B2B)' : '(B2C)';

    const finalName = data.name.includes(storeNameSuffix)
      ? data.name
      : `${data.name} ${storeNameSuffix}`;

    if (!store) {
      store = await tx.store.create({
        data: {
          organizationId: organizationId,
          name: finalName,
          subdomain: subdomain,
          type: type,
          isActive: true,
        },
      });
    } else {
      store = await tx.store.update({
        where: { id: store.id },
        data: {
          name: finalName,
          subdomain: subdomain,
          isActive: true,
        },
      });
    }

    await tx.storeSettings.upsert({
      where: { storeId: store.id },
      create: {
        storeId: store.id,
        customDomain: data.customDomain || null,
        routing: (data.routing as RoutingStrategy) ?? 'PATH_PREFIX',
        defaultLocale: data.defaultLocale as Locale,
      },
      update: {
        customDomain: data.customDomain || null,
        routing: (data.routing as RoutingStrategy) ?? 'PATH_PREFIX',
        defaultLocale: data.defaultLocale as Locale,
      },
    });

    await tx.storeLocaleConfig.deleteMany({
      where: { storeId: store.id },
    });

    if (data.localeCurrencies && data.localeCurrencies.length > 0) {
      await tx.storeLocaleConfig.createMany({
        data: data.localeCurrencies.map((lc) => ({
          storeId: store.id,
          locale: lc.locale as Locale,
          currency: lc.currency as Currency,
          isActive: true,
        })),
      });
    }

    return await tx.store.findUnique({
      where: { id: store.id },
      include: {
        settings: true,
        localeConfigs: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  private async deactivateStore(
    tx: Prisma.TransactionClient,
    organizationId: string,
    type: StoreType,
  ) {
    const store = await tx.store.findFirst({
      where: {
        organizationId: organizationId,
        type: type,
      },
    });

    if (store) {
      await tx.store.update({
        where: { id: store.id },
        data: { isActive: false },
      });

      this.eventEmitter.emit('store.updated', { storeId: store.id });
    }
  }

  async getStores(): Promise<StoreZodOutputType | null> {
    // Önce cache'e bak
    if (this.redis) {
      const cached = await this.redis.get(STORE_CONFIG_CACHE_KEY);
      if (cached) {
        this.logger.debug('Store config served from cache');
        return JSON.parse(cached);
      }
    }

    const organization = await this.prisma.organization.findFirst({
      include: {
        stores: {
          include: {
            settings: true,
            localeConfigs: {
              where: { isActive: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    if (!organization) return null;

    const b2cStore = organization.stores.find((s) => s.type === 'B2C');
    const b2bStore = organization.stores.find((s) => s.type === 'B2B');

    const result: StoreZodOutputType = {
      name: organization.name,

      isB2CActive: b2cStore?.isActive ?? false,
      b2cCustomDomain: b2cStore?.settings?.customDomain || null,

      b2cRouting: (b2cStore?.settings?.routing as any) || 'PATH_PREFIX',
      b2cDefaultLocale: (b2cStore?.settings?.defaultLocale as any) || 'TR',
      b2cLocaleCurrencies:
        b2cStore?.localeConfigs.map((lc) => ({
          locale: lc.locale as any,
          currency: lc.currency as any,
        })) || [],

      isB2BActive: b2bStore?.isActive ?? false,
      b2bSubdomain: b2bStore?.subdomain || null,
      b2bCustomDomain: b2bStore?.settings?.customDomain || null,
      b2bRouting: (b2bStore?.settings?.routing as any) || 'PATH_PREFIX',
      b2bDefaultLocale: (b2bStore?.settings?.defaultLocale as any) || 'TR',
      b2bLocaleCurrencies:
        b2bStore?.localeConfigs.map((lc) => ({
          locale: lc.locale as any,
          currency: lc.currency as any,
        })) || [],
    };

    // Cache'e yaz
    if (this.redis) {
      await this.redis.set(
        STORE_CONFIG_CACHE_KEY,
        JSON.stringify(result),
        'EX',
        STORE_CONFIG_TTL,
      );
      this.logger.debug('Store config cached');
    }

    return result;
  }

  private generateSubdomain(name: string, type: StoreType): string {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 40);

    return type === 'B2B' ? `${base}-b2b` : base;
  }
}
