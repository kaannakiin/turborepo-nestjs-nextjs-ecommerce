import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, StorePaymentProvider, User } from '@repo/database';
import {
  BasketItem,
  CartItemForPayment,
  IyzicoPaymentMethodType,
  PaymentZodType,
  PayTRPaymentMethodType,
} from '@repo/types';
import { Request } from 'express';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsV2Service {
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private readonly provider: StorePaymentProvider | null = null;

  constructor(
    private readonly cartService: CartV3Service,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  private async preparePaymentProviderConfig(): Promise<{
    success: boolean;
    message: string;
    provider?: IyzicoPaymentMethodType | PayTRPaymentMethodType;
  }> {
    // TODO BURAYA KURALLAR DİZİSİ GELECEK KULLANICI BUNU EKLEYEBİLECEK
    const providers = await this.prisma.storePaymentProvider.findMany({
      where: { provider: { in: ['IYZICO', 'PAYTR'] } },
    });

    if (!providers || providers.length === 0) {
      return {
        success: false,
        message: 'Ödeme sağlayıcısı bulunamadı.',
      };
    }

    const found =
      (providers.find(
        (p) => p.provider === 'IYZICO',
      ) as unknown as IyzicoPaymentMethodType) ||
      (providers.find(
        (p) => p.provider === 'PAYTR',
      ) as unknown as PayTRPaymentMethodType);

    return {
      success: true,
      message: 'Ödeme sağlayıcısı yüklendi.',
      provider: found,
    };
  }

  private createBasketItems(
    items: CartItemForPayment[],
    locale: $Enums.Locale,
    currency: $Enums.Currency,
  ): Array<BasketItem & { quantity: number }> {
    return items.map((item) => {
      if (item.variantId) {
        const price = item.variant.prices.find((p) => p.currency === currency);

        if (!price) {
          throw new Error('Fiyat bulunamadı');
        }

        return {
          id: `${item.productId}-${item.variantId}`,
          name:
            item.product.translations.find((t) => t.locale === locale)?.name ||
            item.product.translations[0]?.name ||
            'Ürün İsmi Bulunamadı',
          category1: '',
          itemType: item.product.type === 'PHYSICAL' ? 'PHYSICAL' : 'VIRTUAL',
          price: price.discountedPrice ? price.discountedPrice : price.price,
          quantity: item.quantity,
        };
      }

      const price = item.product.prices.find((p) => p.currency === currency);

      if (!price) {
        throw new Error('Fiyat bulunamadı');
      }

      return {
        id: item.productId,
        name:
          item.product.translations.find((t) => t.locale === locale)?.name ||
          item.product.translations[0]?.name ||
          'Ürün İsmi Bulunamadı',
        category1: '',
        itemType: item.product.type === 'PHYSICAL' ? 'PHYSICAL' : 'VIRTUAL',
        price: price.discountedPrice ? price.discountedPrice : price.price,
        quantity: item.quantity,
      };
    });
  }

  async createPayment({
    data,
    cartId,
    user,
    req,
  }: {
    data: PaymentZodType;
    cartId: string;
    user: User | null;
    req: Request;
  }) {
    const cartResult = await this.cartService.getCartForPayment(cartId);

    if (!cartResult) {
      return {
        success: false,
        message: 'Sepet bulunamadı.',
      };
    }

    if (!cartResult.success) {
      return {
        success: false,
        message: cartResult.message,
      };
    }

    const providerConfig = await this.preparePaymentProviderConfig();

    if (!providerConfig.success || !providerConfig.provider) {
      return {
        success: false,
        message:
          'Şu anda ödeme yapılamıyor. Lütfen daha sonra tekrar deneyiniz.',
      };
    }

    const { cart } = cartResult.data;

    const basketItems = this.createBasketItems(
      cart.items as CartItemForPayment[],
      cart.locale,
      cart.currency,
    );

    const { provider } = providerConfig;

    if (provider.type === 'PAYTR') {
    }
  }
}
