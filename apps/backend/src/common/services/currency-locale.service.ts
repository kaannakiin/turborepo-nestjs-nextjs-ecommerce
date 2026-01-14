import { RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Currency, Locale, StoreType } from '@repo/database';
import { Redis } from 'ioredis';
import { PrismaService } from 'src/prisma/prisma.service';

interface CachedStoreSettings {
  id: string;
  type: StoreType;
  subdomain: string;
  defaultLocale: Locale;
  localeConfigs: Record<Locale, Currency>;
}

@Injectable()
export class CurrencyLocaleService implements OnModuleInit {
  private readonly logger = new Logger(CurrencyLocaleService.name);
  private redis: Redis | null = null;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    if (!this.redis) {
      this.redis = this.redisService.getOrThrow('cache');
    }
  }

  @OnEvent('store.updated')
  async handleStoreUpdated(payload: { storeId: string }) {
    try {
      await this.invalidateStoreCache(payload.storeId);
      await this.redis.del('store_id:default');
      this.logger.log(`Cache invalidated for store: ${payload.storeId}`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate cache for store: ${payload.storeId}`,
        error.stack,
      );
    }
  }

  async invalidateStoreCache(storeId: string): Promise<void> {
    await this.redis.del(`store_settings:${storeId}`);
  }

  /**
   * Verilen locale için currency döndürür
   * @param locale - Dil kodu
   * @param storeId - Store ID (opsiyonel, yoksa default store kullanılır)
   * @param storeType - Store type (B2C veya B2B) - opsiyonel
   */
  async getCurrencyForLocale(
    locale: Locale,
    storeId?: string,
    storeType?: StoreType,
  ): Promise<Currency> {
    let targetStoreId = storeId;

    // Store ID yoksa default store'u al
    if (!targetStoreId) {
      targetStoreId = await this.getDefaultStoreId(storeType);
    }

    if (!targetStoreId) {
      this.logger.warn(
        `No active ${storeType || 'any'} store found. Falling back to TRY.`,
      );
      return Currency.TRY;
    }

    const settings = await this.getStoreSettings(targetStoreId);

    if (!settings) {
      this.logger.warn(`Store settings not found for: ${targetStoreId}`);
      return Currency.TRY;
    }

    // 1. İlgili locale için currency varsa onu döndür
    if (settings.localeConfigs[locale]) {
      return settings.localeConfigs[locale];
    }

    // 2. Default locale'in currency'sini döndür
    const defaultLocaleCurrency =
      settings.localeConfigs[settings.defaultLocale];
    if (defaultLocaleCurrency) {
      return defaultLocaleCurrency;
    }

    // 3. İlk bulunan currency'i döndür
    const firstCurrency = Object.values(settings.localeConfigs)[0];
    if (firstCurrency) {
      return firstCurrency;
    }

    // 4. Son çare: TRY
    return Currency.TRY;
  }

  /**
   * Default store ID'sini döndürür
   * @param storeType - Opsiyonel: B2C veya B2B store type
   */
  async getDefaultStoreId(storeType?: StoreType): Promise<string | null> {
    const cacheKey = storeType
      ? `store_id:default:${storeType}`
      : 'store_id:default';

    const cachedId = await this.redis.get(cacheKey);
    if (cachedId) return cachedId;

    const whereClause: any = {
      isActive: true,
    };

    if (storeType) {
      whereClause.type = storeType;
    }

    const defaultStore = await this.prismaService.store.findFirst({
      where: whereClause,
      orderBy: {
        createdAt: 'asc',
      },
      select: { id: true },
    });

    if (defaultStore) {
      await this.redis.set(cacheKey, defaultStore.id, 'EX', 60 * 60 * 24 * 7);
      return defaultStore.id;
    }

    return null;
  }

  /**
   * Store settings'i cache'den veya DB'den getirir
   */
  async getStoreSettings(storeId: string): Promise<CachedStoreSettings | null> {
    try {
      const cached = await this.redis.get(`store_settings:${storeId}`);

      if (cached) {
        return JSON.parse(cached);
      }

      return await this.refreshStore(storeId);
    } catch (error) {
      this.logger.error(
        `Failed to get store settings for: ${storeId}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Store'u DB'den çekip cache'e yazar
   */
  async refreshStore(storeId: string): Promise<CachedStoreSettings | null> {
    try {
      const store = await this.prismaService.store.findUnique({
        where: { id: storeId },
        include: {
          localeConfigs: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          },
          settings: true,
        },
      });

      if (!store) {
        this.logger.warn(`Store not found: ${storeId}`);
        return null;
      }

      if (!store.settings) {
        this.logger.error(
          `Critical: Store ${storeId} exists but has no related Settings record!`,
        );
        return null;
      }

      if (!store.localeConfigs || store.localeConfigs.length === 0) {
        this.logger.error(
          `Critical: Store ${storeId} has no active locale configurations!`,
        );
        return null;
      }

      const configMap: Partial<Record<Locale, Currency>> = {};
      store.localeConfigs.forEach((conf) => {
        configMap[conf.locale] = conf.currency;
      });

      const data: CachedStoreSettings = {
        id: store.id,
        type: store.type,
        subdomain: store.subdomain,
        defaultLocale: store.settings.defaultLocale,
        localeConfigs: configMap as Record<Locale, Currency>,
      };

      await this.redis.set(
        `store_settings:${store.id}`,
        JSON.stringify(data),
        'EX',
        60 * 60 * 24 * 7, // 7 gün
      );

      this.logger.log(`Cache updated for store: ${storeId}`);
      return data;
    } catch (error) {
      this.logger.error(`Failed to refresh store: ${storeId}`, error.stack);
      return null;
    }
  }

  /**
   * Store'un tüm aktif locale-currency eşleşmelerini döndürür
   */
  async getAvailableLocaleCurrencies(
    storeId: string,
  ): Promise<Array<{ locale: Locale; currency: Currency }>> {
    const settings = await this.getStoreSettings(storeId);

    if (!settings) {
      return [];
    }

    return Object.entries(settings.localeConfigs).map(([locale, currency]) => ({
      locale: locale as Locale,
      currency,
    }));
  }

  /**
   * Store'un default currency'sini döndürür (default locale'in currency'si)
   */
  async getDefaultCurrency(storeId: string): Promise<Currency> {
    const settings = await this.getStoreSettings(storeId);

    if (!settings) {
      return Currency.TRY;
    }

    const defaultCurrency = settings.localeConfigs[settings.defaultLocale];
    return defaultCurrency || Currency.TRY;
  }

  /**
   * Store type'a göre tüm store'ları cache'den temizle
   */
  async invalidateAllStoresByType(storeType: StoreType): Promise<void> {
    try {
      const stores = await this.prismaService.store.findMany({
        where: { type: storeType, isActive: true },
        select: { id: true },
      });

      for (const store of stores) {
        await this.invalidateStoreCache(store.id);
      }

      await this.redis.del(`store_id:default:${storeType}`);
      await this.redis.del('store_id:default');

      this.logger.log(`All ${storeType} store caches invalidated`);
    } catch (error) {
      this.logger.error(
        `Failed to invalidate ${storeType} store caches`,
        error.stack,
      );
    }
  }
}
