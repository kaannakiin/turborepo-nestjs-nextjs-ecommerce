import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Locale } from '@repo/database';
import { CurrencyLocaleService } from '../services/currency-locale.service';

@Injectable()
export class ClientContextGuard implements CanActivate {
  private readonly logger = new Logger(ClientContextGuard.name);

  constructor(private readonly currencyLocaleService: CurrencyLocaleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    let storeId = request.headers['x-store-id'] as string;

    if (!storeId && request.cookies) {
      storeId = request.cookies['store_id'];
    }

    if (!storeId) {
      storeId = await this.currencyLocaleService.getDefaultStoreId();
    }

    if (!storeId) {
      this.logger.warn('No store context found via Header, Cookie or Default.');
      // throw new BadRequestException('Store context is required.');
    }

    request.storeId = storeId;

    let locale = request.headers['x-locale'] as Locale;

    if (!locale && request.cookies) {
      locale = request.cookies['locale'] as Locale;
    }

    if (!Object.values(Locale).includes(locale)) {
      locale = Locale.TR;
    }

    request.locale = locale;

    return true;
  }
}
