import { BadRequestException, Injectable } from '@nestjs/common';
import {
  commonProductWhereClause,
  productDetailInclude,
  ProductDetailType,
} from '@repo/types';
import { CurrencyLocaleService } from 'src/common/services/currency-locale.service';
import { LocaleService } from 'src/common/services/locale.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
    private readonly currencyService: CurrencyLocaleService,
  ) {}

  async getProductPage(slug: string): Promise<ProductDetailType> {
    const product = await this.getProductBySlug(slug);

    if (!product) {
      throw new BadRequestException('Ürün bulunamadı');
    }

    return product;
  }

  private async getProductBySlug(
    slug: string,
  ): Promise<ProductDetailType | null> {
    const locale = this.localeService.getLocale();
    const currency = this.currencyService.getCurrencyLocaleMap(locale);

    const productWhere = commonProductWhereClause(currency, locale);

    const result = await this.prismaService.productTranslation.findUnique({
      where: {
        locale_slug: { locale, slug },
        Product: productWhere,
      },
      include: {
        Product: {
          include: productDetailInclude(locale, currency),
        },
      },
    });

    return result?.Product ?? null;
  }
}
