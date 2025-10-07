import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@repo/database';
import { createId } from '@repo/shared';
import {
  $Enums,
  BasketItem,
  BinCheckRequest,
  BinCheckResponse,
  BinCheckSuccessResponse,
  CompleteThreeDSRequest,
  CompleteThreeDSResponse,
  GetCartByIdReturn,
  InstallmentRequest,
  InstallmentResponse,
  InstallmentSuccessResponse,
  NonThreeDSRequest,
  NonThreeDSResponse,
  PaymentType,
  SignatureValidationData,
  ThreeDCallback,
  ThreeDSRequest,
  ThreeDSResponse,
} from '@repo/types';
import { createHmac } from 'crypto';
import { Request, Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShippingService } from 'src/shipping/shipping.service';

type ValidateSignature =
  | '3ds-initialize'
  | '3ds-preauth-initialize'
  | '3ds-auth'
  | '3ds-postauth'
  | 'non-3ds-auth'
  | 'non-3ds-preauth'
  | 'non-3ds-postauth'
  | 'payment-detail'
  | 'callback-url'
  | 'refund'
  | 'amount-base-refund';

@Injectable()
export class PaymentService {
  private baseUrl: string = '';
  private secretKey: string = '';
  private readonly separator = ':';
  constructor(
    private prisma: PrismaService,
    private shippingService: ShippingService,
    private configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('IYZICO_BASE_URL');
    this.secretKey = this.configService.get<string>('IYZICO_SECRET_KEY') || '';
  }

  private createIyzicoHeaders(
    data: string,
    uri_path: string,
  ): Record<string, string> {
    const apiKey = this.configService.get<string>('IYZICO_API_KEY');
    const secretKey = this.configService.get<string>('IYZICO_SECRET_KEY');

    if (!apiKey || !secretKey) {
      throw new BadRequestException('Bilinmeyen hata oluştu');
    }

    const randomKey =
      Date.now().toString() + Math.random().toString(36).substring(2, 15);
    const payload = data ? randomKey + uri_path + data : randomKey + uri_path;
    const encryptedData = createHmac('sha256', secretKey)
      .update(payload, 'utf8')
      .digest('hex');
    const authorizationString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${encryptedData}`;
    const base64EncodedAuthorization = Buffer.from(
      authorizationString,
      'utf8',
    ).toString('base64');

    return {
      Authorization: `IYZWSv2 ${base64EncodedAuthorization}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  private async iyzicoFetch<TRequest, TResponse>(
    endpoint: string,
    requestData: TRequest,
  ): Promise<TResponse> {
    const jsonData = JSON.stringify(requestData);
    const headers = this.createIyzicoHeaders(jsonData, endpoint);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers,
        body: jsonData,
      });

      if (!response.ok) {
        throw new BadRequestException(
          `İyzico API HTTP Error: ${response.status}`,
        );
      }

      const result = (await response.json()) as TResponse;
      return result;
    } catch (error) {
      throw new BadRequestException('İyzico API ile iletişim hatası');
    }
  }

  private generateSignature(dataArray: string[]): string {
    const dataToEncrypt = dataArray.join(this.separator);
    const encryptedData = createHmac('sha256', this.secretKey)
      .update(dataToEncrypt)
      .digest('hex');
    return encryptedData;
  }

  private formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toString();
  }

  private validateSignature(
    type: ValidateSignature,
    data: SignatureValidationData,
  ): boolean {
    let parametersArray: string[] = [];

    switch (type) {
      case '3ds-initialize':
        // Parametre sırası: paymentId, conversationId
        parametersArray = [data.paymentId!, data.conversationId];
        break;

      case '3ds-preauth-initialize':
        // Parametre sırası: paymentId, conversationId
        parametersArray = [data.paymentId!, data.conversationId];
        break;

      case '3ds-auth':
        // Parametre sırası: paymentId, currency, basketId, conversationId, paidPrice, price

        parametersArray = [
          data.paymentId!,
          data.currency!,
          data.basketId!,
          data.conversationId,
          this.formatPrice(data.paidPrice!),
          this.formatPrice(data.price!),
        ];
        break;

      case '3ds-postauth':
        // Parametre sırası: paymentId, currency, basketId, conversationId, paidPrice, price
        parametersArray = [
          data.paymentId!,
          data.currency!,
          data.basketId!,
          data.conversationId,
          this.formatPrice(data.paidPrice!),
          this.formatPrice(data.price!),
        ];
        break;

      case 'non-3ds-auth':
        // Parametre sırası: paymentId, currency, basketId, conversationId, paidPrice, price
        parametersArray = [
          data.paymentId!,
          data.currency!,
          data.basketId!,
          data.conversationId,
          this.formatPrice(data.paidPrice!),
          this.formatPrice(data.price!),
        ];
        break;

      case 'non-3ds-preauth':
        // Parametre sırası: paymentId, currency, basketId, conversationId, paidPrice, price
        parametersArray = [
          data.paymentId!,
          data.currency!,
          data.basketId!,
          data.conversationId,
          this.formatPrice(data.paidPrice!),
          this.formatPrice(data.price!),
        ];
        break;

      case 'non-3ds-postauth':
        // Parametre sırası: paymentId, currency, basketId, conversationId, paidPrice, price
        parametersArray = [
          data.paymentId!,
          data.currency!,
          data.basketId!,
          data.conversationId,
          this.formatPrice(data.paidPrice!),
          this.formatPrice(data.price!),
        ];
        break;

      case 'payment-detail':
        // Parametre sırası: paymentId, currency, basketId, conversationId, paidPrice, price
        parametersArray = [
          data.paymentId!,
          data.currency!,
          data.basketId!,
          data.conversationId,
          this.formatPrice(data.paidPrice!),
          this.formatPrice(data.price!),
        ];
        break;

      case 'callback-url':
        // Parametre sırası: conversationData, conversationId, mdStatus, paymentId, status
        parametersArray = [
          data.conversationData!,
          data.conversationId,
          data.mdStatus!,
          data.paymentId!,
          data.status!,
        ];
        break;

      case 'refund':
        // Parametre sırası: paymentId, price, currency, conversationId
        parametersArray = [
          data.paymentId!,
          this.formatPrice(data.price!),
          data.currency!,
          data.conversationId,
        ];
        break;

      case 'amount-base-refund':
        // Parametre sırası: paymentId, price, currency, conversationId
        parametersArray = [
          data.paymentId!,
          this.formatPrice(data.price!),
          data.currency!,
          data.conversationId,
        ];
        break;

      default:
        throw new Error(`Unsupported signature type: ${type}`);
    }

    const generatedSignature = this.generateSignature(parametersArray);

    return generatedSignature === data.signature;
  }

  async binCheck(binNumber: string): Promise<{
    success: boolean;
    message?: string;
    data?: BinCheckSuccessResponse;
  }> {
    const cleanBinNumber = binNumber.replace(/\s+/g, '');
    if (cleanBinNumber.length < 6) {
      return {
        success: false,
        message: 'Geçersiz kart numarası',
      };
    }

    const conversationId = createId();
    const binRequestData: BinCheckRequest = {
      locale: 'tr',
      conversationId,
      binNumber: cleanBinNumber.substring(0, 6),
    };

    const binReq = await this.iyzicoFetch<BinCheckRequest, BinCheckResponse>(
      '/payment/bin/check',
      binRequestData,
    );
    if (binReq.status === 'failure') {
      return {
        success: false,
        message: binReq.errorMessage,
      };
    }
    if (binReq.conversationId === conversationId) {
      return {
        success: true,
        message: 'Kart bilgisi geçerli',
        data: binReq as BinCheckSuccessResponse,
      };
    }
  }

  async checkInstallments(
    data: Omit<InstallmentRequest, 'conversationId'>,
  ): Promise<{
    success: boolean;
    message: string;
    data?: InstallmentSuccessResponse;
  }> {
    const cleanBinNumber = data.binNumber.replace(/\s+/g, '');
    if (cleanBinNumber.length < 6) {
      return {
        success: false,
        message: 'Geçersiz kart numarası',
      };
    }
    if (data.price <= 0) {
      return {
        success: false,
        message: 'Geçersiz tutar',
      };
    }
    const conversationId = createId();

    const installmentRequestData: InstallmentRequest = {
      locale: 'tr',
      binNumber: cleanBinNumber.substring(0, 6),
      price: data.price,
      conversationId,
    };
    const installmentReq = await this.iyzicoFetch<
      InstallmentRequest,
      InstallmentResponse
    >('/payment/installment', installmentRequestData);

    if (installmentReq.status === 'failure') {
      return {
        success: false,
        message: installmentReq.errorMessage,
      };
    }
    if (installmentReq.conversationId === conversationId) {
      return {
        success: true,
        message: 'Taksit bilgisi geçerli',
        data: installmentReq,
      };
    }
  }

  // async createPaymentIntent(
  //   cartId: string,
  //   paymentData: PaymentType,
  //   user: User | null,
  //   req: Request,
  // ): Promise<{
  //   success: boolean;
  //   message: string;
  //   initThreeD?: boolean;
  //   threeDSHtmlContent?: string;
  //   orderNumber?: string;
  // }> {
  //   const cart = await this.cartService.getCart(cartId, { status: 'ACTIVE' });
  //   if (!cart) {
  //     return {
  //       success: false,
  //       message: 'Geçersiz sepet',
  //     };
  //   }

  //   const basketItems = this.createBasketItems(cart.items, 'TRY');
  //   if (basketItems.length === 0) {
  //     return {
  //       success: false,
  //       message: 'Sepetiniz boş lütfen ürün ekleyiniz.',
  //     };
  //   }
  //   const totalPrice = parseFloat(
  //     basketItems.reduce((acc, item) => acc + item.price, 0).toFixed(2),
  //   );

  //   const installmentReq = await this.checkInstallments({
  //     binNumber: paymentData.creditCardNumber,
  //     locale: 'tr',
  //     price: totalPrice,
  //   });

  //   if (!installmentReq.success) {
  //     return {
  //       success: false,
  //       message: installmentReq.message,
  //     };
  //   }

  //   const availableShippingRules =
  //     await this.shippingService.getAvailableShippingMethods(cartId);

  //   if (
  //     !availableShippingRules.success ||
  //     availableShippingRules.shippingMethods.rules.length < 1 ||
  //     !availableShippingRules.shippingMethods.rules.find(
  //       (rule) => rule.id === cart.cargoRuleId,
  //     )
  //   ) {
  //     return {
  //       success: false,
  //       message: 'Lütfen geçerli bir kargo yöntemi seçiniz.',
  //     };
  //   }

  //   const totalPriceWithShipping = parseFloat(
  //     (
  //       totalPrice +
  //       (availableShippingRules.shippingMethods.rules.find(
  //         (rule) => rule.id === cart.cargoRuleId,
  //       )?.price || 0)
  //     ).toFixed(2),
  //   );
  //   const conversationId = createId();

  //   const shippingAddress: ThreeDSRequest['shippingAddress'] = {
  //     city:
  //       cart.shippingAddress?.city?.name ||
  //       cart.shippingAddress?.state?.name ||
  //       'N/A',
  //     country: cart.shippingAddress.country.name || 'N/A',
  //     address:
  //       `${cart.shippingAddress.addressLine1} ${cart.shippingAddress.addressLine2 || ''}`.trim() ||
  //       'N/A',
  //     contactName: `${cart.shippingAddress.name.trim() || ' '} ${cart.shippingAddress.surname.trim() || ' '}`,
  //     zipCode: cart.shippingAddress.zipCode || 'N/A',
  //   };

  //   const billingAddress: ThreeDSRequest['billingAddress'] =
  //     paymentData.isBillingAddressSame
  //       ? shippingAddress
  //       : {
  //           city:
  //             cart.billingAddress?.city?.name ||
  //             cart.billingAddress?.state?.name ||
  //             'N/A',
  //           country: cart.billingAddress.country.name || 'N/A',
  //           address:
  //             `${cart.billingAddress.addressLine1} ${cart.billingAddress.addressLine2 || ''}`.trim() ||
  //             'N/A',
  //           contactName: `${cart.billingAddress.name.trim() || ' '} ${cart.billingAddress.surname.trim() || ' '}`,
  //           zipCode: cart.billingAddress.zipCode || 'N/A',
  //         };

  //   const buyer: ThreeDSRequest['buyer'] = {
  //     city:
  //       cart.shippingAddress?.city?.name ||
  //       cart.shippingAddress?.state?.name ||
  //       'N/A',
  //     country: cart.shippingAddress.country.name || 'N/A',
  //     email: user?.email || cart.shippingAddress?.email || 'N/A',
  //     gsmNumber: user?.phone || cart.shippingAddress?.phone || 'N/A',
  //     id: user.id || cart.shippingAddressId || 'N/A',
  //     identityNumber: '11111111111',
  //     name: user?.name || cart.shippingAddress?.name || 'N/A',
  //     surname: user?.surname || cart.shippingAddress?.surname || 'N/A',
  //     zipCode: cart.shippingAddress.zipCode || 'N/A',
  //     registrationAddress:
  //       `${cart.shippingAddress.addressLine1} ${cart.shippingAddress.addressLine2 || ''}`.trim() ||
  //       'N/A',
  //     ip: req.socket.remoteAddress || req.ip || 'N/A',
  //   };
  //   const paymentCard: ThreeDSRequest['paymentCard'] = {
  //     cardHolderName: paymentData.creditCardName,
  //     cardNumber: paymentData.creditCardNumber.replace(/\s+/g, ''),
  //     expireMonth: paymentData.expiryDate.split('/')[0].trim(),
  //     expireYear: paymentData.expiryDate.split('/')[1].trim(),
  //     cvc: paymentData.cvv,
  //   };

  //   const paymentRequest: ThreeDSRequest | NonThreeDSRequest = {
  //     locale: 'tr',
  //     basketItems: basketItems,
  //     conversationId: conversationId,
  //     paidPrice: totalPriceWithShipping,
  //     price: totalPrice,
  //     installment: 1,
  //     currency: 'TRY',
  //     paymentChannel: 'WEB',
  //     paymentGroup: 'PRODUCT',
  //     shippingAddress,
  //     billingAddress,
  //     basketId: cart.id,
  //     buyer,
  //     paymentCard,
  //   };
  //   if (installmentReq.data.installmentDetails[0].force3ds) {
  //     // 3D Secure işlemleri
  //     const callbackUrl = new URL(
  //       this.configService.get<string>(
  //         'IYZICO_CALLBACK_URL',
  //         'http://localhost:3001/payment/three-d-callback',
  //       ),
  //     );
  //     callbackUrl.searchParams.append('cartId', cart.id);
  //     (paymentRequest as ThreeDSRequest).callbackUrl = callbackUrl.toString();

  //     const threeDReq = await this.iyzicoFetch<ThreeDSRequest, ThreeDSResponse>(
  //       '/payment/3dsecure/initialize',
  //       paymentRequest as ThreeDSRequest,
  //     );
  //     if (threeDReq.status === 'failure') {
  //       return {
  //         success: false,
  //         message:
  //           'Lütfen kart bilgilerinizi kontrol ediniz ve tekrar deneyiniz.',
  //       };
  //     }
  //     if (threeDReq.conversationId === conversationId) {
  //       const isValidSignature = this.validateSignature('3ds-initialize', {
  //         paymentId: threeDReq.paymentId,
  //         conversationId: threeDReq.conversationId,
  //         signature: threeDReq.signature,
  //       });
  //       if (!isValidSignature) {
  //         return {
  //           success: false,
  //           message:
  //             'Lütfen kart bilgilerinizi kontrol ediniz ve tekrar deneyiniz.',
  //         };
  //       }
  //       const orderNumber = this.createOrderNumber();

  //       const createdOrder = await this.prisma.order.upsert({
  //         where: {
  //           cartId: cart.id,
  //         },
  //         create: {
  //           orderNumber: orderNumber,
  //           userId: user?.id || undefined,
  //           cartId: cart.id,
  //           paymentId: threeDReq.paymentId,
  //           subtotal: totalPrice,
  //           totalAmount: totalPriceWithShipping,
  //           binNumber:
  //             installmentReq.data.installmentDetails[0].binNumber || null,
  //           cardAssociation:
  //             installmentReq.data.installmentDetails[0].cardAssociation || null,
  //           cardFamily:
  //             installmentReq.data.installmentDetails[0].cardFamilyName || null,
  //           cardType:
  //             installmentReq.data.installmentDetails[0].cardType || null,
  //           lastFourDigits:
  //             paymentData.creditCardNumber.replace(/\s+/g, '').slice(-4) ||
  //             null,
  //           currency: 'TRY',
  //           locale: 'TR',
  //           billingAddress: billingAddress
  //             ? JSON.parse(
  //                 JSON.stringify({
  //                   ...billingAddress,
  //                   email: buyer.email,
  //                   phone: buyer.gsmNumber,
  //                 }),
  //               )
  //             : JSON.parse(
  //                 JSON.stringify({
  //                   ...shippingAddress,
  //                   email: buyer.email,
  //                   phone: buyer.gsmNumber,
  //                 }),
  //               ),
  //           shippingAddress: JSON.parse(
  //             JSON.stringify({
  //               ...shippingAddress,
  //               email: buyer.email,
  //               phone: buyer.gsmNumber,
  //             }),
  //           ),
  //         },
  //         update: {
  //           paymentId: threeDReq.paymentId,
  //           subtotal: totalPrice,
  //           totalAmount: totalPriceWithShipping,
  //           binNumber:
  //             installmentReq.data.installmentDetails[0].binNumber || null,
  //           cardAssociation:
  //             installmentReq.data.installmentDetails[0].cardAssociation || null,
  //           cardFamily:
  //             installmentReq.data.installmentDetails[0].cardFamilyName || null,
  //           cardType:
  //             installmentReq.data.installmentDetails[0].cardType || null,
  //           lastFourDigits:
  //             paymentData.creditCardNumber.replace(/\s+/g, '').slice(-4) ||
  //             null,
  //           currency: 'TRY',
  //           locale: 'TR',
  //           billingAddress: billingAddress
  //             ? JSON.parse(
  //                 JSON.stringify({
  //                   ...billingAddress,
  //                   email: buyer.email,
  //                   phone: buyer.gsmNumber,
  //                 }),
  //               )
  //             : JSON.parse(
  //                 JSON.stringify({
  //                   ...shippingAddress,
  //                   email: buyer.email,
  //                   phone: buyer.gsmNumber,
  //                 }),
  //               ),
  //           shippingAddress: JSON.parse(
  //             JSON.stringify({
  //               ...shippingAddress,
  //               email: buyer.email,
  //               phone: buyer.gsmNumber,
  //             }),
  //           ),
  //           userId: user?.id || undefined,
  //         },
  //       });

  //       await this.orderService.createOrderItemBeforeThreeD(
  //         createdOrder.id,
  //         paymentRequest.basketItems,
  //       );

  //       return {
  //         success: true,
  //         message: '3D Secure doğrulaması gerekiyor.',
  //         initThreeD: true,
  //         threeDSHtmlContent: threeDReq.threeDSHtmlContent,
  //       };
  //     }
  //   } else {
  //     const nonThreeDReq = await this.iyzicoFetch<
  //       NonThreeDSRequest,
  //       NonThreeDSResponse
  //     >('/payment/auth', paymentRequest as NonThreeDSRequest);

  //     if (nonThreeDReq.status === 'failure') {
  //       return {
  //         success: false,
  //         message:
  //           ' Lütfen kart bilgilerinizi kontrol ediniz ve tekrar deneyiniz.',
  //       };
  //     }
  //     if (nonThreeDReq.conversationId === conversationId) {
  //       const isValidSignature = this.validateSignature('non-3ds-auth', {
  //         paymentId: nonThreeDReq.paymentId,
  //         conversationId: nonThreeDReq.conversationId,
  //         basketId: nonThreeDReq.basketId,
  //         currency: nonThreeDReq.currency,
  //         paidPrice: nonThreeDReq.paidPrice,
  //         price: nonThreeDReq.price,
  //         signature: nonThreeDReq.signature,
  //       });

  //       if (!isValidSignature) {
  //         return {
  //           success: false,
  //           message:
  //             ' Lütfen kart bilgilerinizi kontrol ediniz ve tekrar deneyiniz.',
  //         };
  //       }
  //       const orderNumber = this.createOrderNumber();

  //       const createdOrder = await this.prisma.order.create({
  //         data: {
  //           orderNumber: orderNumber,
  //           userId: user?.id || undefined,
  //           cartId: cart.id,
  //           paymentId: nonThreeDReq.paymentId,
  //           subtotal: totalPrice,
  //           totalAmount: totalPriceWithShipping,
  //           binNumber:
  //             installmentReq.data.installmentDetails[0].binNumber || null,
  //           cardAssociation:
  //             installmentReq.data.installmentDetails[0].cardAssociation || null,
  //           cardFamily:
  //             installmentReq.data.installmentDetails[0].cardFamilyName || null,
  //           cardType:
  //             installmentReq.data.installmentDetails[0].cardType || null,
  //           lastFourDigits:
  //             paymentData.creditCardNumber.replace(/\s+/g, '').slice(-4) ||
  //             null,
  //           currency: 'TRY',
  //           locale: 'TR',
  //           billingAddress: billingAddress
  //             ? JSON.parse(
  //                 JSON.stringify({
  //                   ...billingAddress,
  //                   email: buyer.email,
  //                   phone: buyer.gsmNumber,
  //                 }),
  //               )
  //             : JSON.parse(
  //                 JSON.stringify({
  //                   ...shippingAddress,
  //                   email: buyer.email,
  //                   phone: buyer.gsmNumber,
  //                 }),
  //               ),
  //           shippingAddress: JSON.parse(
  //             JSON.stringify({
  //               ...shippingAddress,
  //               email: buyer.email,
  //               phone: buyer.gsmNumber,
  //             }),
  //           ),
  //           paymentType: 'NON_THREE_D_SECURE',
  //         },
  //       });

  //       await this.prisma.cart.update({
  //         where: {
  //           id: cart.id,
  //         },
  //         data: {
  //           status: 'CONVERTED',
  //         },
  //       });

  //       await this.orderService.createOrderItem(
  //         createdOrder.id,
  //         nonThreeDReq.itemTransactions,
  //       );
  //       return {
  //         success: true,
  //         message: 'Ödeme işlemi başarılı.',
  //         initThreeD: false,
  //         orderNumber: orderNumber,
  //       };
  //     }
  //   }
  // }

  private createBasketItems(
    cartItems: GetCartByIdReturn['items'],
    cartCurrency: $Enums.Currency,
  ): BasketItem[] {
    const basketItems: BasketItem[] = [];
    cartItems.forEach((item) => {
      if (item.deletedAt !== null || item.isVisible === false) {
        return;
      }

      if (item.variant && item.variantId) {
        const price = item.variant.prices.find(
          (p) => p.currency === cartCurrency,
        );
        const translation =
          item.product.translations.find((t) => t.locale === 'TR') ||
          item.product.translations[0];

        if (!price || !translation) {
          return;
        }
        for (let i = 0; i < item.quantity; i++) {
          basketItems.push({
            category1:
              item.product.categories[0]?.category?.id || 'Uncategorized',
            id: `${item.productId}-${item.variantId}`,
            name: translation.name,
            itemType: item.product.type === 'PHYSICAL' ? 'PHYSICAL' : 'VIRTUAL',
            price: price.discountedPrice ? price.discountedPrice : price.price,
          });
        }

        return;
      } else {
        const price = item.product.prices.find(
          (p) => p.currency === cartCurrency,
        );
        const translation =
          item.product.translations.find((t) => t.locale === 'TR') ||
          item.product.translations[0];

        if (!price || !translation) {
          return;
        }
        for (let i = 0; i < item.quantity; i++) {
          basketItems.push({
            category1:
              item.product.categories[0]?.category?.id || 'Uncategorized',
            id: item.productId,
            name: translation.name,
            itemType: item.product.type === 'PHYSICAL' ? 'PHYSICAL' : 'VIRTUAL',
            price: price.discountedPrice ? price.discountedPrice : price.price,
          });
        }
        return;
      }
    });
    return basketItems;
  }

  async threeDCallback(body: ThreeDCallback, res: Response, cartId: string) {
    const webUrl = this.configService.get<string>(
      'WEB_UI_REDIRECT',
      'http://localhost:3000',
    );

    try {
      const isValidSignature = this.validateSignature('callback-url', {
        conversationData: body.conversationData,
        conversationId: body.conversationId,
        mdStatus: body.mdStatus,
        paymentId: body.paymentId,
        status: body.status,
        signature: body.signature,
      });

      if (!isValidSignature) {
        throw new Error('Geçersiz imza');
      }
      if (body.status !== 'success' || body.mdStatus !== '1') {
        throw new Error('3D Doğrulama başarısız');
      }

      const conversationId = createId();
      const threeDSRequestData: CompleteThreeDSRequest = {
        locale: 'tr',
        paymentId: body.paymentId,
        conversationId: conversationId,
        conversationData: body.conversationData,
      };

      const paymentDetail = await this.iyzicoFetch<
        CompleteThreeDSRequest,
        CompleteThreeDSResponse
      >('/payment/3dsecure/auth', threeDSRequestData);

      if (paymentDetail.status == 'failure') {
        throw new Error('3D Doğrulama işlemi başarısız');
      }

      if (paymentDetail.conversationId !== conversationId) {
        throw new Error('3D Doğrulama işlemi başarısız');
      }

      const ThreeDSAuthIsValidSignature = this.validateSignature('3ds-auth', {
        conversationId: paymentDetail.conversationId,
        signature: paymentDetail.signature,
        basketId: paymentDetail.basketId,
        currency: paymentDetail.currency,
        paidPrice: paymentDetail.paidPrice,
        paymentId: paymentDetail.paymentId,
        price: paymentDetail.price,
      });

      if (!ThreeDSAuthIsValidSignature) {
        throw new Error('Geçersiz imza');
      }
      await this.prisma.cart.update({
        where: {
          id: paymentDetail.basketId,
        },
        data: {
          status: 'CONVERTED',
        },
      });
      const updatedOrder = await this.prisma.order.update({
        where: {
          paymentId: paymentDetail.paymentId,
        },
        data: {
          paymentStatus: 'PAID',
        },
      });

      // await this.orderService.createOrderItem(
      //   updatedOrder.id,
      //   paymentDetail.itemTransactions,
      //   true,
      // );

      return res.redirect(`${webUrl}/orders/${updatedOrder.orderNumber}`);
    } catch (error) {
      // await this.orderService.deleteOrderAndOrderItems(cartId);
      return res.redirect(
        `${webUrl}/checkout/${cartId}?step=payment&error=${encodeURIComponent(
          error instanceof Error ? error.message : 'Bilinmeyen hata',
        )}`,
      );
    }
  }
  private createOrderNumber(): string {
    return `ORD-${new Date().toISOString().slice(2, 10).replace(/-/g, '')}-${createId().slice(0, 6).toUpperCase()}`;
  }
}
