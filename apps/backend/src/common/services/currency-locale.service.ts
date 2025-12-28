import { Global, Injectable } from '@nestjs/common';
import { Currency, Locale } from '@repo/database';
import { PrismaService } from 'src/prisma/prisma.service';

@Global()
@Injectable()
export class CurrencyLocaleService {
  constructor(private readonly prismaService: PrismaService) {}

  getCurrencyLocaleMap(locale: Locale): Currency {
    switch (locale) {
      case Locale.TR:
        return Currency.TRY;
      case Locale.EN:
        return Currency.USD;
      case Locale.DE:
        return Currency.EUR;
      default:
        return Currency.TRY;
    }
  }
}
