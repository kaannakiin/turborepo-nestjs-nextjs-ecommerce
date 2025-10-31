import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, StorePaymentProvider, User } from '@repo/database';
import {
  BasketItem,
  CartItemForPayment,
  GetCartForPaymentReturnType,
  InstallmentRequest,
  InstallmentResponse,
  IyzicoPaymentMethodType,
  NonThreeDSRequest,
  NonThreeDSResponse,
  PaymentChannel,
  PaymentZodType,
  PayTRPaymentMethodType,
  ShippingAddressPayload,
  ThreeDSRequest,
  ThreeDSResponse,
} from '@repo/types';
import { Request, Response } from 'express';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IyzicoService } from './iyzico/iyzico.service';

@Injectable()
export class PaymentsService {
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private readonly provider: StorePaymentProvider | null = null;

  constructor(
    private readonly cartService: CartV3Service,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly iyzicoService: IyzicoService,
  ) {}
  private async getTodayOrdersCount(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return 5;
  }

  private async generateOrderNumber(): Promise<string> {
    const todayOrderCount = await this.getTodayOrdersCount();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const orderCount = (todayOrderCount + 1).toString().padStart(4, '0');
    return `ORD${year}${month}${day}${orderCount}`; // Örnek: ORD2406150001
  }

  private getPaymentChannel(req: Request): PaymentChannel {
    const customChannel = req.headers['x-request-channel'] as string;

    if (customChannel === 'MOBILE_IOS') {
      return 'MOBILE_IOS'; // Bu senin native iOS uygulaman
    }
    if (customChannel === 'MOBILE_ANDROID') {
      return 'MOBILE_ANDROID'; // Bu senin native Android uygulaman
    }

    const ua = req.useragent;

    if (ua.isWindowsPhone) {
      return 'MOBILE_WINDOWS';
    }

    if (ua.isTablet) {
      return 'MOBILE_TABLET';
    }

    if (ua.isMobile) {
      return 'MOBILE_PHONE';
    }

    return 'WEB';
  }

  private formatPrice(priceInTl: number): number {
    return Math.round(priceInTl * 100);
  }

  private async preparePaymentProviderConfig(): Promise<{
    success: boolean;
    message: string;
    provider?: IyzicoPaymentMethodType | PayTRPaymentMethodType;
  }> {
    const providers = await this.prisma.storePaymentProvider.findMany({});

    if (!providers || providers.length === 0) {
      return {
        success: false,
        message: 'Ödeme sağlayıcısı bulunamadı.',
      };
    }

    // TODO burada koşullar kontrol edilecek şimdilik diyelim ki iyzico bulundu
    const iyzicoProvider = providers.find((p) => p.provider === 'IYZICO');
    if (iyzicoProvider) {
      const options = iyzicoProvider.options as Pick<
        IyzicoPaymentMethodType,
        'iyzicoSecretKey' | 'iyzicoApiKey'
      >;
      return {
        success: true,
        message: 'Başarılı',
        provider: {
          isActive: iyzicoProvider.active,
          isTestMode: iyzicoProvider.isTestMode,
          iyzicoApiKey: options.iyzicoApiKey,
          iyzicoSecretKey: options.iyzicoSecretKey,
          type: 'IYZICO',
        } as IyzicoPaymentMethodType,
      };
    }
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
        const variantOptionNames = item.variant.options
          .map((o) => {
            const translation =
              o.productVariantOption.variantOption.translations.find(
                (t) => t.locale === locale,
              );
            return (
              translation?.name ||
              o.productVariantOption.variantOption.translations[0]?.name ||
              ''
            );
          })
          .filter(Boolean)
          .join('-');

        const productName =
          item.product.translations.find((t) => t.locale === locale)?.name ||
          item.product.translations[0]?.name ||
          'Ürün İsmi Bulunamadı';

        const fullName = variantOptionNames
          ? `${productName}-${variantOptionNames}`
          : productName;

        return {
          id: `${item.productId}-${item.variantId}`,
          name: fullName,
          category1: fullName,
          itemType: item.product.type === 'PHYSICAL' ? 'PHYSICAL' : 'VIRTUAL',
          price: price.discountedPrice ? price.discountedPrice : price.price,
          quantity: item.quantity,
        };
      }

      const price = item.product.prices.find((p) => p.currency === currency);
      if (!price) {
        throw new Error('Fiyat bulunamadı');
      }
      const name =
        item.product.translations.find((t) => t.locale === locale)?.name ||
        item.product.translations[0]?.name ||
        'Ürün İsmi Bulunamadı';
      return {
        id: item.productId,
        name,
        category1: name,
        itemType: item.product.type === 'PHYSICAL' ? 'PHYSICAL' : 'VIRTUAL',
        price: price.discountedPrice ? price.discountedPrice : price.price,
        quantity: item.quantity,
      };
    });
  }

  private convertIyzicoBasketItems(
    data: Array<BasketItem & { quantity: number }>,
  ): Array<Omit<BasketItem, 'quantity'>> {
    return data.flatMap((item) => {
      return Array.from({ length: item.quantity }, () => {
        const { quantity, ...rest } = item;
        return rest;
      });
    });
  }

  private async createOrder(cart: GetCartForPaymentReturnType['data']['cart']) {
    // return await this.prisma.$transaction(async (prisma) => {
    //   const orderNumber = await this.generateOrderNumber();
    //   const order = await prisma.order.create({
    //     data: {
    //       orderNumber,
    //     },
    //   });
    // });
  }

  async createPayment({
    data,
    cartId,
    user,
    req,
    res,
  }: {
    data: PaymentZodType;
    cartId: string;
    user: User | null;
    req: Request;
    res: Response;
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

    const cleanCardNumber = data.creditCardNumber.replace(/\s+/g, '');
    const locale = cart.locale === 'TR' ? 'tr' : 'en';
    const totalInInt = basketItems.reduce((sum, item) => {
      const priceInKurus = this.formatPrice(item.price);
      return sum + priceInKurus * item.quantity;
    }, 0);

    const totalPrice = totalInInt / 100;

    const cartShippingAddress = cart.shippingAddress as ShippingAddressPayload;
    const cartBillingAddress =
      cart.billingAddress as ShippingAddressPayload | null;

    const shippingAddress: NonThreeDSRequest['shippingAddress'] = {
      address:
        `${cartShippingAddress.addressTitle || ''} ${cartShippingAddress.addressLine1} ${cartShippingAddress.addressLine2 || ''}`.trim(),
      city: `${cartShippingAddress.city?.name || cartShippingAddress.state?.name || 'Bölge yok'}`.trim(),
      contactName:
        `${cartShippingAddress.name} ${cartShippingAddress.surname}`.trim(),
      country: cartShippingAddress.country?.name || 'Ülke yok',
      zipCode: cartShippingAddress.zipCode || '00000',
    };

    const ip =
      req.socket.remoteAddress ||
      req.ip ||
      req.headers['x-forwarded-for'] ||
      '';

    const paymentChannel = this.getPaymentChannel(req);

    const billingAddress: NonThreeDSRequest['billingAddress'] =
      cartBillingAddress
        ? {
            address:
              `${cartBillingAddress.addressTitle || ''} ${cartBillingAddress.addressLine1} ${cartBillingAddress.addressLine2 || ''}`.trim(),
            city: `${cartBillingAddress.city?.name || cartBillingAddress.state?.name || 'Bölge yok'}`.trim(),
            contactName:
              `${cartBillingAddress.name} ${cartBillingAddress.surname}`.trim(),
            country: cartBillingAddress.country?.name || 'Ülke yok',
            zipCode: cartBillingAddress.zipCode || '00000',
          }
        : shippingAddress;

    const buyer: NonThreeDSRequest['buyer'] = {
      city: cartShippingAddress.city?.name || 'Bölge yok',
      country: cartShippingAddress.country?.name || 'Ülke yok',
      email: cartShippingAddress?.email || user?.email || 'emailyok@gmail.com',
      gsmNumber: cartShippingAddress.phone || user.phone || '+905555555555',
      id: user ? user.id : cart.id,
      identityNumber: cartShippingAddress.tcKimlikNo || '00000000000',
      name: cartShippingAddress.name || user.name || 'İsim Yok',
      surname: cartShippingAddress.surname || user.surname || 'Soyisim Yok',
      registrationAddress:
        `${cartShippingAddress.addressLine1} ${cartShippingAddress.addressLine2 || ''}`.trim(),
      zipCode: cartShippingAddress.zipCode || '00000',
      ip: ip.toString(),
    };

    const paymentCard: NonThreeDSRequest['paymentCard'] = {
      cardHolderName: data.creditCardName.trim(),
      cardNumber: cleanCardNumber,
      cvc: data.cvv,
      expireMonth: data.expiryDate.replace(/\s+/g, '').split('/')[0],
      expireYear: data.expiryDate.replace(/\s+/g, '').split('/')[1],
    };

    if (providerConfig.provider.type === 'PAYTR') {
    }

    if (providerConfig.provider.type === 'IYZICO') {
      const { isTestMode, iyzicoApiKey, iyzicoSecretKey } =
        providerConfig.provider as IyzicoPaymentMethodType;

      const installmentConversationId = `installment_${new Date().toISOString()}`;

      const installementReq = await this.iyzicoService.iyzicoFetch<
        InstallmentRequest,
        InstallmentResponse
      >(iyzicoApiKey, iyzicoSecretKey, '/payment/installment', isTestMode, {
        binNumber: cleanCardNumber.substring(0, 6),
        locale,
        conversationId: installmentConversationId,
        price: totalPrice,
      });
      if (
        !installementReq.conversationId ||
        installementReq.conversationId !== installmentConversationId
      ) {
        throw new BadRequestException('Taksit bilgisi alınamadı.');
      }

      if (installementReq.status === 'failure') {
        throw new BadRequestException(
          installementReq.errorMessage || 'Taksit bilgisi alınamadı.',
        );
      }

      const { force3ds } = installementReq.installmentDetails[0];
      const paymentConversationId = `payment_${new Date().toISOString()}`;
      const basePaymentBody: NonThreeDSRequest = {
        shippingAddress,
        billingAddress,
        buyer,
        conversationId: paymentConversationId,
        locale,
        paymentCard,
        price: totalPrice,
        currency: cart.currency,
        paymentGroup: 'PRODUCT',
        basketId: cart.id,
        installment: 1,
        paymentChannel,
        paidPrice: totalPrice,
        basketItems: this.convertIyzicoBasketItems(basketItems),
      };

      if (force3ds) {
        const threeDSPaymentBody: ThreeDSRequest = {
          ...basePaymentBody,
          callbackUrl: 'https://localhost:3001/payment/iyzico/three-d-callback',
        };

        const threeDSreq = await this.iyzicoService.iyzicoFetch<
          ThreeDSRequest,
          ThreeDSResponse
        >(
          iyzicoApiKey,
          iyzicoSecretKey,
          '/payment/3dsecure/initialize',
          isTestMode,
          threeDSPaymentBody,
        );

        if (threeDSreq.conversationId !== paymentConversationId) {
          throw new BadRequestException('Ödeme başlatılamadı.');
        }

        if (threeDSreq.status === 'failure') {
          throw new BadRequestException(
            threeDSreq.errorMessage || 'Ödeme başlatılamadı.',
          );
        }

        const isValidSignature = this.iyzicoService.iyzicoValidateSignature(
          '3ds-initialize',
          {
            paymentId: threeDSreq.paymentId,
            conversationId: threeDSreq.conversationId,
            signature: threeDSreq.signature,
          },
          iyzicoSecretKey,
        );

        if (!isValidSignature) {
          throw new BadRequestException(
            'Ödeme başlatılamadı. Lütfen daha sonra tekrar deneyiniz.',
          );
        }

        return {
          success: true,
          message: '3D Secure doğrulaması gerekiyor.',
          data: {
            isThreeDS: true,
            threeDSHtmlContent: threeDSreq.threeDSHtmlContent,
          },
        };
      }

      const nonThreeDSeq = await this.iyzicoService.iyzicoFetch<
        NonThreeDSRequest,
        NonThreeDSResponse
      >(
        iyzicoApiKey,
        iyzicoSecretKey,
        '/payment/auth',
        isTestMode,
        basePaymentBody,
      );

      if (nonThreeDSeq.conversationId !== paymentConversationId) {
        throw new BadRequestException('Ödeme gerçekleştirilemedi.');
      }

      if (nonThreeDSeq.status === 'failure') {
        throw new BadRequestException(
          nonThreeDSeq.errorMessage || 'Ödeme gerçekleştirilemedi.',
        );
      }

      const isValidSignature = this.iyzicoService.iyzicoValidateSignature(
        'non-3ds-auth',
        {
          paymentId: nonThreeDSeq.paymentId,
          conversationId: nonThreeDSeq.conversationId,
          signature: nonThreeDSeq.signature,
          basketId: cart.id,
          currency: cart.currency,
          price: totalPrice,
          paidPrice: totalPrice,
        },
        iyzicoSecretKey,
      );

      if (!isValidSignature) {
        throw new BadRequestException(
          'Ödeme gerçekleştirilemedi. Lütfen daha sonra tekrar deneyiniz.',
        );
      }

      if (nonThreeDSeq.status === 'success') {
        console.log('Ödeme başarılı, yönlendiriliyor...');
        return res.redirect(
          `${this.configService.get<string>('WEB_UI_REDIRECT')}`,
        );
      }
    }
  }

  async handleWebhook({ req, res }: { req: Request; res: Response }) {
    console.log('=== İyzico Webhook Received ===');

    // Tüm header'ları yazdır
    console.log('\n📋 ALL HEADERS:');
    console.log('----------------');
    Object.keys(req.headers).forEach((key) => {
      console.log(`${key}: ${req.headers[key]}`);
    });
    console.log('----------------\n');

    // İyzico spesifik header'lar
    const eventType = req.headers['x-iyzico-event-type'] as string;
    const signature = req.headers['x-iyz-signature-v3'] as string;

    console.log('🔑 İyzico Specific Headers:');
    console.log('- Event Type:', eventType);
    console.log('- Signature V3:', signature);

    console.log('\n📦 Request Body:');
    console.log(JSON.stringify(req.body, null, 2));

    // Signature validation
    if (!signature) {
      console.error('❌ Missing X-Iyz-Signature-V3 header');
      return res.status(401).json({ error: 'Missing signature' });
    }

    // Webhook body parametreleri
    const {
      paymentConversationId,
      merchantId,
      paymentId,
      status,
      iyziReferenceCode,
      iyziEventType,
      iyziEventTime,
      iyziPaymentId,
    } = req.body;

    console.log('\n📊 Parsed Data:');
    console.log('- Payment Conversation ID:', paymentConversationId);
    console.log('- Merchant ID:', merchantId);
    console.log('- Payment ID:', paymentId);
    console.log('- Status:', status);
    console.log('- Iyzi Reference Code:', iyziReferenceCode);
    console.log('- Iyzi Event Type:', iyziEventType);
    console.log('- Iyzi Event Time:', iyziEventTime);
    console.log('- Iyzi Payment ID:', iyziPaymentId);

    // Ödeme durumuna göre işlem
    console.log('\n💳 Payment Status:');
    switch (status) {
      case 'SUCCESS':
        console.log('✓ Payment successful');
        break;
      case 'FAILURE':
        console.log('✗ Payment failed');
        break;
      case 'INIT_THREEDS':
        console.log('⟳ 3DS initiated');
        break;
      default:
        console.log('Status:', status);
    }

    console.log('================================\n');

    // Response
    res.status(200).json({ success: true });
  }
}
