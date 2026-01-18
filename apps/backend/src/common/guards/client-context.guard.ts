import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Currency, Locale, StoreType } from '@repo/database';
import { CurrencyLocaleService } from '../services/currency-locale.service';
import { LOCALE_COOKIE_NAME, STORE_TYPE_COOKIE_NAME } from '@repo/types';

export interface ClientContext {
  locale: Locale;
  storeType: StoreType;
  storeId: string | null;
  currency: Currency;
}

@Injectable()
export class ClientContextGuard implements CanActivate {
  private readonly logger = new Logger(ClientContextGuard.name);

  constructor(private readonly currencyLocaleService: CurrencyLocaleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let locale = request.headers['x-locale'] as Locale;
    if (!locale && request.cookies) {
      locale = request.cookies[LOCALE_COOKIE_NAME]?.toUpperCase() as Locale;
    }
    if (!locale || !Object.values(Locale).includes(locale)) {
      locale = Locale.TR;
    }

    let storeType = request.headers['x-store-type'] as StoreType;
    if (!storeType && request.cookies) {
      storeType = request.cookies[
        STORE_TYPE_COOKIE_NAME
      ]?.toUpperCase() as StoreType;
    }
    if (!storeType || !Object.values(StoreType).includes(storeType)) {
      storeType = StoreType.B2C;
    }

    let storeId = request.headers['x-store-id'] as string;
    if (!storeId && request.cookies) {
      storeId = request.cookies['store_id'];
    }
    if (!storeId) {
      storeId = await this.currencyLocaleService.getDefaultStoreId(storeType);
    }

    if (!storeId) {
      this.logger.warn(
        `No ${storeType} store found. Currency will fallback to TRY.`,
      );
    }

    const currency = await this.currencyLocaleService.getCurrencyForLocale(
      locale,
      storeId,
      storeType,
    );

    request.locale = locale;
    request.storeType = storeType;
    request.storeId = storeId;
    request.currency = currency;

    request.clientContext = {
      locale,
      storeType,
      storeId,
      currency,
    } as ClientContext;

    return true;
  }
}
