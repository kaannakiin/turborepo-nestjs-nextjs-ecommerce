import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createId } from '@repo/shared';
import {
  $Enums,
  BasketItem,
  Buyer,
  CheckoutPageCartType,
  CompleteThreeDSRequest,
  CompleteThreeDSResponse,
  CompleteThreeDSSuccessResponse,
  InstallmentRequest,
  InstallmentResponse,
  ItemTransaction,
  IyzicoAddress,
  NonThreeDSRequest,
  NonThreeDSResponse,
  NonThreeDSSuccessResponse,
  PaymentType,
  SignatureValidationData,
  ThreeDCallback,
  ThreeDSRequest,
  ThreeDSResponse,
} from '@repo/types';
import { createHmac } from 'crypto';
import { Response } from 'express';
import { CartService } from 'src/cart/cart.service';
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
    private cartService: CartService,
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
      console.error('İyzico API Error:', error);
      throw new BadRequestException('İyzico API ile iletişim hatası');
    }
  }

  private createBasketItems(
    cart: CheckoutPageCartType,
    currency: $Enums.Currency,
  ): BasketItem[] {
    const basketItems: BasketItem[] = [];

    cart.items.forEach((item) => {
      const productTranslation =
        item.product.translations.find((t) => t.locale === cart.locale) ||
        item.product.translations[0];

      let basketItem: BasketItem | null = null;

      if (item.variant && item.variantId) {
        const price = item.variant.prices.find((p) => p.currency === currency);
        if (price) {
          const finalPrice =
            price.discountedPrice && price.discountedPrice > 0
              ? price.discountedPrice
              : price.price;

          if (finalPrice && finalPrice > 0) {
            basketItem = {
              id: `${item.productId}-${item.variantId}`,
              itemType:
                item.product.type === 'DIGITAL' ? 'VIRTUAL' : 'PHYSICAL',
              category1: item.product.taxonomyCategoryId || createId(),
              name: productTranslation.name,
              price: finalPrice,
            };
          }
        }
      } else if (item.product && item.productId) {
        const price = item.product.prices.find((p) => p.currency === currency);
        if (price) {
          const finalPrice =
            price.discountedPrice && price.discountedPrice > 0
              ? price.discountedPrice
              : price.price;

          if (finalPrice && finalPrice > 0) {
            basketItem = {
              id: item.productId,
              itemType:
                item.product.type === 'DIGITAL' ? 'VIRTUAL' : 'PHYSICAL',
              category1: item.product.taxonomyCategoryId || createId(),
              name: productTranslation.name,
              price: finalPrice,
            };
          }
        }
      }

      // Quantity kadar basket item ekle
      if (basketItem) {
        for (let i = 0; i < item.quantity; i++) {
          basketItems.push({
            ...basketItem,
            id: `${basketItem.id}`, // Unique ID için
          });
        }
      }
    });

    return basketItems;
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

  async createPaymentIntent(cartId: string, paymentData: PaymentType) {
    const cart = await this.cartService.getCartById(cartId);
    if (!cart || !cart.cart) {
      throw new BadRequestException('Sepet bulunamadı');
    }
    const rules =
      await this.shippingService.getAvailableShippingMethods(cartId);
    if (!rules.success) {
      throw new BadRequestException(rules.message);
    }
    const ruleExists = rules.shippingMethods.rules.find(
      (r) => r.id === cart.cart.cargoRuleId,
    );
    if (!ruleExists) {
      throw new BadRequestException('Geçersiz kargo seçeneği');
    }

    const cleanCardNumber = paymentData.creditCardNumber.replace(/\s+/g, '');
    const installementConversationId = createId();
    const installementRequestData: InstallmentRequest = {
      locale: 'tr',
      binNumber: cleanCardNumber.substring(0, 6),
      conversationId: installementConversationId,
      price: 500,
    };
    console.log('Taksit sorgu isteği:', installementRequestData);
    const instReq = await this.iyzicoFetch<
      InstallmentRequest,
      InstallmentResponse
    >('/payment/iyzipos/installment', installementRequestData);
    console.log('Taksit sorgu yanıtı:', instReq);
    if (instReq.status === 'failure') {
      throw new BadRequestException(`${instReq.errorMessage}`);
    } else {
      if (instReq.conversationId === installementConversationId) {
        const basketItems = this.createBasketItems(cart.cart, 'TRY');
        if (basketItems.length === 0) {
          throw new BadRequestException('Sepette ürün bulunamadı');
        }
        const paymentRequestConversationId = createId();
        const shippingAddress: IyzicoAddress = {
          address: `${cart.cart.shippingAddress.addressLine1} ${cart.cart.shippingAddress.addressLine2 ? cart.cart.shippingAddress.addressLine2 : ''} `,
          city: cart.cart.shippingAddress.city
            ? cart.cart.shippingAddress.city.name
            : cart.cart.shippingAddress.state
              ? cart.cart.shippingAddress.state.name
              : 'N/A',
          contactName: `${cart.cart.shippingAddress.name} ${cart.cart.shippingAddress.surname}`,
          country: cart.cart.shippingAddress.country.translations[0].name,
          ...(cart.cart.shippingAddress.zipCode
            ? { zipCode: cart.cart.shippingAddress.zipCode }
            : {}),
        };

        const billingAddress: IyzicoAddress = cart.cart.billingAddress
          ? {
              address: `${cart.cart.billingAddress.addressLine1} ${cart.cart.billingAddress.addressLine2 ? cart.cart.billingAddress.addressLine2 : ''} `,
              city: cart.cart.billingAddress.city
                ? cart.cart.billingAddress.city.name
                : cart.cart.billingAddress.state
                  ? cart.cart.billingAddress.state.name
                  : 'N/A',
              contactName: `${cart.cart.shippingAddress.name} ${cart.cart.shippingAddress.surname}`,
              country: cart.cart.shippingAddress.country.translations[0].name,
              ...(cart.cart.shippingAddress.zipCode
                ? { zipCode: cart.cart.shippingAddress.zipCode }
                : {}),
            }
          : shippingAddress;
        const buyer: Buyer = cart.cart.user
          ? {
              city: cart.cart.shippingAddress.city
                ? cart.cart.shippingAddress.city.name
                : cart.cart.shippingAddress.state
                  ? cart.cart.shippingAddress.state.name
                  : 'N/A',
              country: cart.cart.shippingAddress.country.translations[0].name,
              email: cart.cart.user.email,
              gsmNumber: cart.cart.user.phone
                ? cart.cart.user.phone
                : cart.cart.shippingAddress.phone,
              id: cart.cart.user.id,
              name: cart.cart.user.name,
              surname: cart.cart.user.surname,
              identityNumber: '11111111111',
              registrationAddress: `${cart.cart.shippingAddress.addressLine1} ${cart.cart.shippingAddress.addressLine2 ? cart.cart.shippingAddress.addressLine2 : ''} `,
            }
          : {
              city: cart.cart.shippingAddress.city
                ? cart.cart.shippingAddress.city.name
                : cart.cart.shippingAddress.state
                  ? cart.cart.shippingAddress.state.name
                  : 'N/A',
              country: cart.cart.shippingAddress.country.translations[0].name,
              email: cart.cart.shippingAddress.email,
              gsmNumber: cart.cart.shippingAddress.phone,
              id: createId(),
              name: cart.cart.shippingAddress.name,
              surname: cart.cart.shippingAddress.surname,
              identityNumber: '11111111111',
              registrationAddress: `${cart.cart.shippingAddress.addressLine1} ${cart.cart.shippingAddress.addressLine2 ? cart.cart.shippingAddress.addressLine2 : ''} `,
            };
        //THREED SECURE
        console.log('3D Secure durumu:', instReq);
        if (
          instReq.installmentDetails &&
          instReq.installmentDetails.length > 0 &&
          instReq.installmentDetails[0].force3ds === 1
        ) {
          const paymentRequest: ThreeDSRequest = {
            locale: 'tr',
            currency: 'TRY',
            installment: 1,
            conversationId: paymentRequestConversationId,
            paymentGroup: 'PRODUCT',
            paymentChannel: 'WEB',
            basketId: cart.cart.id,
            callbackUrl: `${this.configService.get<string>('IYZICO_CALLBACK_URL')}`,
            shippingAddress,
            billingAddress,
            basketItems,
            buyer,
            paymentCard: {
              cardHolderName: paymentData.creditCardName,
              cardNumber: cleanCardNumber,
              cvc: paymentData.cvv,
              expireMonth: paymentData.expiryDate.split('/')[0].trim(),
              expireYear: paymentData.expiryDate.split('/')[1].trim(),
              registerCard: 0,
            },
            paidPrice:
              basketItems.reduce((sum, item) => sum + item.price, 0) +
              (cart.cart.cargoRule?.price || 0),
            price: basketItems.reduce((sum, item) => sum + item.price, 0),
          };
          console.log('3D Secure ödeme isteği:', paymentRequest);
          const threeDSRequest = await this.iyzicoFetch<
            ThreeDSRequest,
            ThreeDSResponse
          >('/payment/3dsecure/initialize', paymentRequest);
          if (threeDSRequest.status === 'failure') {
            throw new BadRequestException(`${threeDSRequest.errorMessage}`);
          }
          const isSignatureValid = this.validateSignature('3ds-initialize', {
            paymentId: threeDSRequest.paymentId,
            conversationId: threeDSRequest.conversationId,
            signature: threeDSRequest.signature,
          });

          if (!isSignatureValid) {
            throw new BadRequestException(
              'Şu an işleminizi gerçekleştiremiyoruz. Lütfen tekrar deneyiniz.',
            );
          }

          return {
            success: true,
            time: new Date().getTime(),
            message: '3D Secure yönlendirmesi gerekiyor',
            threeDSHtmlContent: threeDSRequest.threeDSHtmlContent,
          };
        } else {
          const nonThreeDSRequest: NonThreeDSRequest = {
            locale: 'tr',
            currency: 'TRY',
            installment: 1,
            conversationId: paymentRequestConversationId,
            paymentGroup: 'PRODUCT',
            paymentChannel: 'WEB',
            basketId: cart.cart.id,
            shippingAddress,
            billingAddress,
            basketItems,
            buyer,
            paymentCard: {
              cardHolderName: paymentData.creditCardName,
              cardNumber: cleanCardNumber,
              cvc: paymentData.cvv,
              expireMonth: paymentData.expiryDate.split('/')[0].trim(),
              expireYear: paymentData.expiryDate.split('/')[1].trim(),
              registerCard: 0,
            },
            paidPrice: 500,
            price: basketItems.reduce((sum, item) => sum + item.price, 0),
          };
          const nonThreeDReq = await this.iyzicoFetch<
            NonThreeDSRequest,
            NonThreeDSResponse
          >('/payment/auth', nonThreeDSRequest);

          if (nonThreeDReq.status === 'failure') {
            throw new BadRequestException(`${nonThreeDReq.errorMessage}`);
          } else if (nonThreeDReq.status === 'success') {
            const isValidSignature = this.validateSignature('non-3ds-auth', {
              paymentId: nonThreeDReq.paymentId,
              currency: nonThreeDReq.currency,
              basketId: nonThreeDReq.basketId,
              conversationId: nonThreeDReq.conversationId,
              paidPrice: nonThreeDReq.paidPrice,
              price: nonThreeDReq.price,
              signature: nonThreeDReq.signature,
            });
            if (!isValidSignature) {
              throw new BadRequestException(
                'Şu an işleminizi gerçekleştiremiyoruz. Lütfen tekrar deneyiniz.',
              );
            }
            console.log('Ödeme başarılı', nonThreeDReq);
            return {
              status: true,
            };
          }
        }
      }
    }
    return {
      success: true,
      message: 'Ödeme intenti oluşturuldu',
    };
  }

  async threeDCallback(body: ThreeDCallback, res: Response) {
    const webUrl = this.configService.get<string>('WEB_UI_REDIRECT');
    const isSignaturValid = this.validateSignature('callback-url', {
      signature: body.signature,
      conversationId: body.conversationId,
      ...(body.conversationData
        ? { conversationData: body.conversationData }
        : {}),
      mdStatus: body.mdStatus,
      paymentId: body.paymentId,
      status: body.status,
    });
    if (!isSignaturValid) {
      const redirectUri = new URL(
        `${webUrl}/checkout/${body.paymentId}?step=payment&error=1`,
      );
      return res.redirect(redirectUri.toString());
    }

    if (body.status === 'success') {
      const completeThreeDSReq = await this.iyzicoFetch<
        CompleteThreeDSRequest,
        CompleteThreeDSResponse
      >('/payment/3dsecure/auth', {
        locale: 'tr',
        conversationId: body.conversationId,
        paymentId: body.paymentId,
        ...(body.conversationData
          ? { conversationData: body.conversationData }
          : {}),
      });

      if (completeThreeDSReq.status === 'failure') {
        const redirectUri = new URL(
          `${webUrl}/checkout/${body.paymentId}?step=payment&error=1`,
        );
        return res.redirect(redirectUri.toString());
      } else if (
        completeThreeDSReq.fraudStatus == 0 ||
        completeThreeDSReq.fraudStatus == 1
      ) {
        const completeIsSignaturValid = this.validateSignature('3ds-auth', {
          signature: completeThreeDSReq.signature,
          conversationId: completeThreeDSReq.conversationId,
          paymentId: completeThreeDSReq.paymentId,
          currency: completeThreeDSReq.currency,
          basketId: completeThreeDSReq.basketId,
          paidPrice: completeThreeDSReq.paidPrice,
          price: completeThreeDSReq.price,
        });
        if (!completeIsSignaturValid) {
          const redirectUri = new URL(
            `${webUrl}/checkout/${body.paymentId}?step=payment&error=1`,
          );
          return res.redirect(redirectUri.toString());
        }
      } else if (completeThreeDSReq.fraudStatus == -1) {
        const redirectUri = new URL(
          `${webUrl}/checkout/${body.paymentId}?step=payment&error=1`,
        );
        return res.redirect(redirectUri.toString());
      }
      // completethreed
    } else if (body.status === 'failure') {
      const redirectUri = new URL(
        `${webUrl}/checkout/${body.paymentId}?step=payment&error=1`,
      );
      return res.redirect(redirectUri.toString());
    }
  }

  private generateUniqueOrderNumber() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomString = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    return `ORD-${date}-${randomString}`;
  }

  // private calculateOrderTotal(items: ItemTransaction[]): {
  //   subTotal: number;
  //   totalAmount: number;
  // } {
  //   let totalAmount: number = 0;
  //   let subTotal: number = 0;

  //   items.forEach((item) => {
  //     totalAmount += item.
  //   });
  // }

  // private async createThreeDOrder(data: CompleteThreeDSSuccessResponse) {
  //   const txResult = await this.prisma.$transaction(async (tx) => {
  //     const order = await tx.order.create({
  //       data: {
  //         orderNumber: this.generateUniqueOrderNumber(),
  //       },
  //     });
  //   });
  // }
}
