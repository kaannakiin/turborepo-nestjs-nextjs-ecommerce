import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums, StorePaymentProvider, User } from '@repo/database';
import {
  BasketItem,
  CartItemForPayment,
  CompleteThreeDSRequest,
  CompleteThreeDSResponse,
  InstallmentRequest,
  InstallmentResponse,
  IyzicoPaymentMethodType,
  IyzicoWebhookPayload,
  NonThreeDSRequest,
  NonThreeDSResponse,
  PaymentChannel,
  PaymentZodType,
  PayTRPaymentMethodType,
  ShippingAddressPayload,
  ThreeDCallback,
  ThreeDSRequest,
  ThreeDSResponse,
} from '@repo/types';
import { Request, Response } from 'express';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
import { OrdersService } from 'src/orders/orders.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { IyzicoService } from './iyzico/iyzico.service';

@Injectable()
export class PaymentsService {
  private readonly CACHE_TTL = 5 * 60 * 1000;
  private readonly provider: StorePaymentProvider | null = null;
  private readonly webUrl: string;
  constructor(
    private readonly cartService: CartV3Service,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly iyzicoService: IyzicoService,
    private readonly orderService: OrdersService,
  ) {
    this.webUrl = this.configService
      .getOrThrow<string>('WEB_UI_REDIRECT')
      .slice(0, -1);
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
  private async getPaymentProvdider(type: $Enums.PaymentProvider) {
    const provider = await this.prisma.storePaymentProvider.findUnique({
      where: {
        provider: type,
      },
    });
    return provider;
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
  }): Promise<{
    success: boolean;
    message: string;
    clearCart?: boolean;
    orderNumber?: string;
    data?: {
      isThreeDS: boolean;
      threeDSHtmlContent?: string;
    };
  }> {
    const cartResult = await this.cartService.getCartForPayment(cartId);

    if (!cartResult.success) {
      return {
        success: false,
        message: cartResult.message,
      };
    }
    if (!cartResult.data) {
      await this.cartService.createCartPaymentAttempt(
        cartId,
        false,
        'Sepet verisi bulunamadı.',
      );
      return {
        success: false,
        message: 'Sepet verisi bulunamadı.',
      };
    }

    const providerConfig = await this.preparePaymentProviderConfig();

    if (!providerConfig.success || !providerConfig.provider) {
      await this.cartService.createCartPaymentAttempt(
        cartId,
        false,
        'Ödeme sağlayıcısı bulunamadığı için ödeme yapılamıyor.',
      );
      return {
        success: false,
        message:
          'Şu anda ödeme yapılamıyor. Lütfen daha sonra tekrar deneyiniz.',
      };
    }

    const { cart, discountAmount, shippingCost, totalFinalPrice, totalPrice } =
      cartResult.data;

    const basketItems = this.createBasketItems(
      cart.items as CartItemForPayment[],
      cart.locale,
      cart.currency,
    );

    const cleanCardNumber = data.creditCardNumber.replace(/\s+/g, '');
    const locale = cart.locale === 'TR' ? 'tr' : 'en';

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

    const orderResponse = await this.orderService.createOrUpdateOrderForPayment(
      { cart, discountAmount, shippingCost, totalFinalPrice, totalPrice },
      cart.shippingAddress,
      cart.billingAddress || cart.shippingAddress,
      providerConfig.provider.type,
      req.headers['user-agent']?.toString(),
      ip.toString(),
    );

    if (!orderResponse.success) {
      return {
        success: false,
        message: orderResponse.message,
        clearCart: orderResponse.clearUserCart,
      };
    }

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

      const { force3ds, cardType, cardAssociation, cardFamilyName } =
        installementReq.installmentDetails[0];
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
          callbackUrl: `${this.configService.get<string>('IYZICO_CALLBACK_URL')}/${orderResponse.order.id}`,
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
          await this.prisma.orderTransactionSchema.create({
            data: {
              orderId: orderResponse.order.id,
              amount: orderResponse.order.totalFinalPrice,
              paymentType:
                cardType === 'CREDIT_CARD'
                  ? 'CREDIT_CARD'
                  : cardType === 'DEBIT_CARD'
                    ? 'DIRECT_DEBIT'
                    : 'OTHER',
              provider: 'IYZICO',
              status: 'FAILED',
              gatewayResponse: JSON.parse(
                JSON.stringify({
                  ...threeDSreq,
                  message: 'Conversation ID mismatch',
                }),
              ),
            },
          });

          throw new BadRequestException('Ödeme başlatılamadı.');
        }

        if (threeDSreq.status === 'failure') {
          await this.prisma.orderTransactionSchema.create({
            data: {
              orderId: orderResponse.order.id,
              amount: orderResponse.order.totalFinalPrice,
              paymentType:
                cardType === 'CREDIT_CARD'
                  ? 'CREDIT_CARD'
                  : cardType === 'DEBIT_CARD'
                    ? 'DIRECT_DEBIT'
                    : 'OTHER',
              provider: 'IYZICO',
              status: 'FAILED',
              gatewayResponse: JSON.parse(
                JSON.stringify({
                  ...threeDSreq,
                  message: threeDSreq.errorMessage,
                }),
              ),
            },
          });

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
          await this.prisma.orderTransactionSchema.create({
            data: {
              orderId: orderResponse.order.id,
              amount: orderResponse.order.totalFinalPrice,
              providerTransactionId: threeDSreq.paymentId,
              paymentType:
                cardType === 'CREDIT_CARD'
                  ? 'CREDIT_CARD'
                  : cardType === 'DEBIT_CARD'
                    ? 'DIRECT_DEBIT'
                    : 'OTHER',
              provider: 'IYZICO',
              status: 'FAILED',
              gatewayResponse: JSON.parse(
                JSON.stringify({ message: 'Invalid signature', ...threeDSreq }),
              ),
            },
          });

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
        await this.prisma.orderTransactionSchema.create({
          data: {
            orderId: orderResponse.order.id,
            amount: orderResponse.order.totalFinalPrice,
            paymentType:
              cardType === 'CREDIT_CARD'
                ? 'CREDIT_CARD'
                : cardType === 'DEBIT_CARD'
                  ? 'DIRECT_DEBIT'
                  : 'OTHER',
            provider: 'IYZICO',
            status: 'FAILED',
            gatewayResponse: JSON.parse(
              JSON.stringify({
                message: 'Conversation ID mismatch',
                ...nonThreeDSeq,
              }),
            ),
          },
        });

        throw new BadRequestException('Ödeme gerçekleştirilemedi.');
      }

      if (nonThreeDSeq.status === 'failure') {
        await this.prisma.orderTransactionSchema.create({
          data: {
            orderId: orderResponse.order.id,
            amount: orderResponse.order.totalFinalPrice,
            paymentType:
              cardType === 'CREDIT_CARD'
                ? 'CREDIT_CARD'
                : cardType === 'DEBIT_CARD'
                  ? 'DIRECT_DEBIT'
                  : 'OTHER',
            provider: 'IYZICO',
            status: 'FAILED',
            gatewayResponse: JSON.parse(
              JSON.stringify({
                message: nonThreeDSeq.errorMessage,
                ...nonThreeDSeq,
              }),
            ),
          },
        });

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
        await this.prisma.orderTransactionSchema.create({
          data: {
            orderId: orderResponse.order.id,
            amount: orderResponse.order.totalFinalPrice,
            providerTransactionId: nonThreeDSeq.paymentId,
            paymentType:
              cardType === 'CREDIT_CARD'
                ? 'CREDIT_CARD'
                : cardType === 'DEBIT_CARD'
                  ? 'DIRECT_DEBIT'
                  : 'OTHER',
            provider: 'IYZICO',
            status: 'FAILED',
            gatewayResponse: JSON.parse(
              JSON.stringify({
                message: 'Invalid signature',
                ...nonThreeDSeq,
              }),
            ),
          },
        });

        throw new BadRequestException(
          'Ödeme gerçekleştirilemedi. Lütfen daha sonra tekrar deneyiniz.',
        );
      }

      if (nonThreeDSeq.status === 'success') {
        await this.prisma.$transaction(async (tx) => {
          await tx.orderSchema.update({
            where: {
              id: orderResponse.order.id,
            },
            data: {
              cart: {
                update: {
                  status: 'CONVERTED',
                },
              },
              orderStatus: 'CONFIRMED',
              paymentStatus: 'PAID',
              transactions: {
                create: {
                  amount: orderResponse.order.totalFinalPrice,
                  providerTransactionId: nonThreeDSeq.paymentId,
                  paymentType:
                    cardType === 'CREDIT_CARD'
                      ? 'CREDIT_CARD'
                      : cardType === 'DEBIT_CARD'
                        ? 'DIRECT_DEBIT'
                        : 'OTHER',
                  provider: 'IYZICO',
                  status: 'PAID',
                  binNumber: nonThreeDSeq.binNumber,
                  lastFourDigits: nonThreeDSeq.lastFourDigits,
                  cardAssociation: nonThreeDSeq.cardAssociation,
                  cardFamilyName: nonThreeDSeq.cardFamily,
                  gatewayResponse: JSON.parse(JSON.stringify(nonThreeDSeq)),
                },
              },
            },
          });

          await this.orderService.decreaseStockLevelsForOrder(
            tx,
            orderResponse.order.itemsSchema.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            })),
          );
        });
        return {
          message: 'Ödeme başarıyla tamamlandı.',
          success: true,
          clearCart: true,
          orderNumber: orderResponse.order.orderNumber,
          data: {
            isThreeDS: false,
            threeDSHtmlContent: undefined,
          },
        };
      }
    }
  }

  private returnUrlWithErrorMessage(
    cartId: string,
    errorMessage: string,
  ): string {
    const webUrl = new URL(this.webUrl);
    return `${webUrl.toString()}/checkout/${cartId}?step=payment&error="${encodeURIComponent(
      errorMessage,
    )}"`;
  }

  private async returnMdStatusErrorUrl(
    cartId: string,
    mdStatus: string,
  ): Promise<string> {
    const webUrl = new URL(this.webUrl);

    let errorMessage = '3D Secure doğrulaması başarısız oldu.';

    switch (mdStatus) {
      case '0':
      case '-1':
        errorMessage =
          '3D Secure doğrulaması yapılamadı. Lütfen tekrar deneyin.';
        break;
      case '2':
        errorMessage =
          'Kartınız 3D Secure için kayıtlı değil. Lütfen bankanızla iletişime geçin.';
        break;
      case '3':
        errorMessage =
          'Bankanız 3D Secure sistemine kayıtlı değil. Farklı bir kart deneyebilirsiniz.';
        break;
      case '4':
        errorMessage =
          'Doğrulama işlemi tamamlanamadı. Lütfen daha sonra tekrar deneyin.';
        break;
      case '5':
        errorMessage =
          'Doğrulama yapılamıyor. Lütfen farklı bir ödeme yöntemi deneyin.';
        break;
      case '6':
        errorMessage =
          '3D Secure hatası oluştu. Lütfen tekrar deneyin veya farklı bir kart kullanın.';
        break;
      case '7':
        errorMessage =
          'Sistem hatası oluştu. Lütfen birkaç dakika sonra tekrar deneyin.';
        break;
      case '8':
        errorMessage =
          'Kart numarası tanınamadı. Lütfen kart bilgilerinizi kontrol edin.';
        break;
      default:
        errorMessage =
          'Ödeme işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    }

    webUrl.pathname = `/checkout/${cartId}`;
    webUrl.searchParams.set('error', errorMessage);
    webUrl.searchParams.set('step', 'payment');

    return webUrl.toString();
  }

  async handlePaymentCallback({
    orderId,
    data,
    res,
  }: {
    orderId: string;
    data: ThreeDCallback;
    res: Response;
  }) {
    const order = await this.orderService.getOrderByIdForPayment(orderId);

    if (!order) {
      return res.redirect(
        `${this.webUrl}/checkout/failure?error=Sipariş bulunamadı.`,
      );
    }

    if (!data) {
      await this.prisma.orderTransactionSchema.create({
        data: {
          orderId: order.id,
          amount: order.totalFinalPrice,
          provider: 'IYZICO',
          status: 'FAILED',
          gatewayResponse: { message: 'No data in callback' },
          paymentType: 'OTHER',
        },
      });
      return res.redirect(
        this.returnUrlWithErrorMessage(order.cartId, 'Geçersiz ödeme verisi.'),
      );
    }

    if (data.mdStatus && data.mdStatus !== '1') {
      await this.prisma.orderTransactionSchema.create({
        data: {
          orderId: order.id,
          amount: order.totalFinalPrice,
          provider: 'IYZICO',
          status: 'FAILED',
          gatewayResponse: {
            message: '3D Secure doğrulaması başarısız',
            ...data,
          },
          paymentType: 'OTHER',
          providerTransactionId: data.paymentId,
        },
      });
      return res.redirect(
        await this.returnMdStatusErrorUrl(order.cartId, data.mdStatus),
      );
    }

    const iyzicoProviderConfig = await this.getPaymentProvdider('IYZICO');

    if (!iyzicoProviderConfig) {
      await this.prisma.orderTransactionSchema.create({
        data: {
          orderId: order.id,
          amount: order.totalFinalPrice,
          provider: 'IYZICO',
          status: 'FAILED',
          gatewayResponse: { message: 'Iyzico provider not found' },
          paymentType: 'OTHER',
          providerTransactionId: data.paymentId,
        },
      });
      return res.redirect(
        this.returnUrlWithErrorMessage(
          order.cartId,
          'Ödeme sağlayıcısı bulunamadı. Lütfen tekrar deneyin.',
        ),
      );
    }

    const iyzicoKeys = iyzicoProviderConfig.options as Pick<
      IyzicoPaymentMethodType,
      'iyzicoApiKey' | 'iyzicoSecretKey'
    >;

    const isValidSignature = this.iyzicoService.iyzicoValidateSignature(
      'callback-url',
      {
        signature: data.signature,
        conversationId: data.conversationId,
        conversationData: data.conversationData,
        mdStatus: data.mdStatus,
        paymentId: data.paymentId,
        status: data.status,
      },
      iyzicoKeys.iyzicoSecretKey,
    );

    if (!isValidSignature) {
      await this.prisma.orderTransactionSchema.create({
        data: {
          orderId: order.id,
          amount: order.totalFinalPrice,
          provider: 'IYZICO',
          status: 'FAILED',
          gatewayResponse: { message: 'Invalid signature', ...data },
          paymentType: 'OTHER',
          providerTransactionId: data.paymentId,
        },
      });
      return res.redirect(
        this.returnUrlWithErrorMessage(
          order.cartId,
          'Ödeme doğrulaması başarısız oldu. Lütfen tekrar deneyin.',
        ),
      );
    }

    const conversationId = `complete-3ds-${new Date().toISOString()}`;

    const paymentResult = await this.iyzicoService.iyzicoFetch<
      CompleteThreeDSRequest,
      CompleteThreeDSResponse
    >(
      iyzicoKeys.iyzicoApiKey,
      iyzicoKeys.iyzicoSecretKey,
      '/payment/3dsecure/auth',
      iyzicoProviderConfig.isTestMode,
      {
        conversationData: data.conversationData,
        paymentId: data.paymentId,
        conversationId,
        locale: 'tr',
      },
    );

    if (paymentResult.conversationId !== conversationId) {
      await this.prisma.orderTransactionSchema.create({
        data: {
          orderId: order.id,
          amount: order.totalFinalPrice,
          provider: 'IYZICO',
          status: 'FAILED',
          gatewayResponse: JSON.parse(JSON.stringify(paymentResult)),
          paymentType: 'OTHER',
          providerTransactionId: data.paymentId,
        },
      });
      return res.redirect(
        this.returnUrlWithErrorMessage(
          order.cartId,
          'Ödeme tamamlanamadı. Lütfen tekrar deneyin.',
        ),
      );
    }

    if (paymentResult.status === 'failure') {
      await this.prisma.orderTransactionSchema.create({
        data: {
          orderId: order.id,
          amount: order.totalFinalPrice,
          provider: 'IYZICO',
          status: 'FAILED',
          gatewayResponse: JSON.parse(JSON.stringify(paymentResult)),
          providerTransactionId: data.paymentId,
          paymentType: 'OTHER',
        },
      });
      return res.redirect(
        this.returnUrlWithErrorMessage(
          order.cartId,
          paymentResult.errorMessage ||
            'Ödeme tamamlanamadı. Lütfen tekrar deneyin.',
        ),
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.orderSchema.update({
        where: {
          id: order.id,
        },
        data: {
          cart: {
            update: {
              status: 'CONVERTED',
            },
          },
          orderStatus: 'CONFIRMED',
          paymentStatus: 'PAID',
          transactions: {
            create: {
              amount: order.totalFinalPrice,
              paymentType:
                paymentResult.cardType === 'CREDIT_CARD'
                  ? 'CREDIT_CARD'
                  : paymentResult.cardType === 'DEBIT_CARD'
                    ? 'DIRECT_DEBIT'
                    : 'OTHER',
              provider: 'IYZICO',
              providerTransactionId: paymentResult.paymentId,
              status: 'PAID',
              binNumber: paymentResult.binNumber,
              lastFourDigits: paymentResult.lastFourDigits,
              cardAssociation: paymentResult.cardAssociation,
              cardFamilyName: paymentResult.cardFamily,
              gatewayResponse: JSON.parse(JSON.stringify(paymentResult)),
            },
          },
        },
      });
      await this.orderService.decreaseStockLevelsForOrder(
        tx,
        order.itemsSchema.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      );
    });

    return res.redirect(`${this.webUrl}/orders/${order.orderNumber}`);
  }

  //EN SON BURASI KALDI BURADA İŞLEYECEĞİZ
  async handleWebhook({ req, res }: { req: Request; res: Response }) {
    const {
      paymentConversationId,
      merchantId,
      paymentId,
      status,
      iyziReferenceCode,
      iyziEventType,
      iyziEventTime,
      iyziPaymentId,
    } = req.body as IyzicoWebhookPayload;

    console.log('Received Iyzico webhook:', req.body);
  }
}
