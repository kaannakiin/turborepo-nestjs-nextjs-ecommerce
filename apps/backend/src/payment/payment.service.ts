import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createId } from '@repo/shared';
import {
  BasketItem,
  BinCheckRequest,
  BinCheckResponse,
  BinCheckSuccessResponse,
  Buyer,
  CartV3,
  InstallmentRequest,
  InstallmentResponse,
  InstallmentSuccessResponse,
  NonThreeDSRequest,
  PaymentZodType,
  SignatureValidationData,
  ThreeDSRequest,
} from '@repo/types';
import { createHmac } from 'crypto';
import { CartV3Service } from 'src/cart-v3/cart-v3.service';
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
  private readonly payTrMerchantId = '700655';
  private readonly payTrMerchantKey = '';
  private readonly payTrMerchantSalt = '';
  constructor(
    private prisma: PrismaService,
    private shippingService: ShippingService,
    private configService: ConfigService,
    private readonly cartService: CartV3Service,
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

  private iyzicoGenerateSignature(dataArray: string[]): string {
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

  private iyzicoValidateSignature(
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

    const generatedSignature = this.iyzicoGenerateSignature(parametersArray);

    return generatedSignature === data.signature;
  }

  async iyzicoBinCheck(binNumber: string): Promise<{
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

  async iyzicoCheckInstallments(
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

  private basketItems(
    items: CartV3['items'],
  ): Array<BasketItem & { quantity: number }> {
    return items.map((item) => ({
      id: item.variantId
        ? `${item.productId}-${item.variantId}`
        : item.productId,
      name: item.productName,
      price: item.discountedPrice ? item.discountedPrice : item.price,
      quantity: item.quantity,
      category1: item.categories.length > 0 ? item.categories[0].name : 'Diğer',
      category2: item.categories.length > 1 ? item.categories[1].name : 'Diğer',
      itemType: 'PHYSICAL',
    }));
  }

  async createPaymentIntent(
    data: PaymentZodType,
    cartId: string,
  ): Promise<{ success: boolean; message: string }> {
    const cart = await this.cartService.getCartForClientCheckout(cartId);

    if (!cart || !cart.success || !cart.cart) {
      return {
        success: false,
        message: 'Sepet bulunamadı. Lütfen tekrar deneyiniz.',
      };
    }

    const { cart: checkoutCart } = cart;

    if (checkoutCart.items.length === 0) {
      return {
        success: false,
        message: 'Sepetinizde ürün bulunmamaktadır.',
      };
    }

    const availableShipping =
      await this.shippingService.getAvailableShippingMethods(cartId);
    if (
      !availableShipping ||
      !availableShipping.success ||
      !availableShipping.shippingMethods ||
      availableShipping.shippingMethods.rules.length === 0
    ) {
      return {
        success: false,
        message:
          'Geçerli bir teslimat yöntemi bulunamadı. Lütfen teslimat adresinizi kontrol ediniz.',
      };
    }

    const shippingMethod = availableShipping.shippingMethods.rules.find(
      (shipping) => shipping.id === checkoutCart.shippingAddress?.id,
    );

    if (!shippingMethod) {
      return {
        success: false,
        message:
          'Geçerli bir teslimat yöntemi bulunamadı. Lütfen teslimat adresinizi kontrol ediniz.',
      };
    }
    const basketItemsFillQuantity = this.basketItems(
      checkoutCart.items,
    ).flatMap((item) =>
      Array.from({ length: item.quantity }, () => item),
    ) as BasketItem[];

    const cleanCardNumber = data.creditCardNumber.replace(/\s+/g, '');
    const paidPrice =
      shippingMethod.price && shippingMethod.price > 0
        ? basketItemsFillQuantity.reduce((acc, item) => acc + item.price, 0) +
          shippingMethod.price
        : basketItemsFillQuantity.reduce((acc, item) => acc + item.price, 0);

    const installmentReq = await this.iyzicoCheckInstallments({
      binNumber: cleanCardNumber.substring(0, 6),
      locale: 'tr',
      price: paidPrice,
    });

    if (!installmentReq.success) {
      return {
        success: false,
        message:
          'Kart doğrulaması sırasında bir hata oluştu. Lütfen kart bilgilerinizi kontrol ediniz.',
      };
    }

    const shippingAddress: NonThreeDSRequest['shippingAddress'] = {
      address: `${checkoutCart.shippingAddress.addressLine1}, ${checkoutCart.shippingAddress.addressLine2 || ' '}  ${checkoutCart.shippingAddress.city.name}, ${checkoutCart.shippingAddress.country.name}`,
      city: checkoutCart.shippingAddress.city.name || 'N/A',
      contactName:
        `${checkoutCart.shippingAddress.name || 'N/A'} ${
          checkoutCart.shippingAddress.surname || 'N/A'
        }` || 'N/A',
      country: checkoutCart.shippingAddress.country.name || 'N/A',
      zipCode: checkoutCart.shippingAddress.zipCode || '00000',
    };
    const billingAddress: NonThreeDSRequest['billingAddress'] =
      checkoutCart.billingAddress
        ? {
            address: `${checkoutCart.billingAddress.addressLine1}, ${checkoutCart.billingAddress.addressLine2 || ' '}  ${checkoutCart.billingAddress.city.name}, ${checkoutCart.billingAddress.country.name}`,
            city: checkoutCart.billingAddress.city.name || 'N/A',
            contactName:
              `${checkoutCart.billingAddress.name || 'N/A'} ${
                checkoutCart.billingAddress.surname || 'N/A'
              }` || 'N/A',
            country: checkoutCart.billingAddress.country.name || 'N/A',
            zipCode: checkoutCart.billingAddress.zipCode || '00000',
          }
        : shippingAddress;

    const buyer: Buyer = {
      city: checkoutCart.shippingAddress.city.name || 'N/A',
      country: checkoutCart.shippingAddress.country.name || 'N/A',
      email:
        checkoutCart.shippingAddress.email || checkoutCart.user.email || 'N/A',
      gsmNumber:
        checkoutCart.shippingAddress.phone || checkoutCart.user.phone || 'N/A',
      id: checkoutCart.userId || createId(),
      identityNumber: checkoutCart.shippingAddress.tcKimlikNo || '00000000000',
      name:
        checkoutCart.shippingAddress.name || checkoutCart.user.name || 'N/A',
      surname:
        checkoutCart.shippingAddress.surname ||
        checkoutCart.user.surname ||
        'N/A',
      registrationAddress:
        `${checkoutCart.shippingAddress.addressLine1}, ${checkoutCart.shippingAddress.city.name}, ${checkoutCart.shippingAddress.country.name}` ||
        'N/A',
    };
    const paymentReqConversationId = createId();

    const paymentRequest: NonThreeDSRequest | ThreeDSRequest = {
      locale: 'tr',
      billingAddress,
      buyer,
      conversationId: paymentReqConversationId,
      basketItems: basketItemsFillQuantity,
      paidPrice:
        shippingMethod.price && shippingMethod.price > 0
          ? basketItemsFillQuantity.reduce((acc, item) => acc + item.price, 0) +
            shippingMethod.price
          : basketItemsFillQuantity.reduce((acc, item) => acc + item.price, 0),
      price: basketItemsFillQuantity.reduce((acc, item) => acc + item.price, 0),
      currency: 'TRY',
      shippingAddress,
      basketId: checkoutCart.cartId,
      installment: 1,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: data.creditCardName,
        cardNumber: data.creditCardNumber.replace(/\s+/g, ''),
        expireMonth: data.expiryDate.split('/')[0].padStart(2, '0').trim(),
        expireYear: data.expiryDate.split('/')[1].trim(),
        cvc: data.cvv,
      },
    } as NonThreeDSRequest;

    if (
      installmentReq.data.installmentDetails &&
      installmentReq.data.installmentDetails[0].force3ds === 1
    ) {
      const threeDSRequest: ThreeDSRequest = {
        ...paymentRequest,
        callbackUrl: this.configService.get<string>('IYZICO_CALLBACK_URL'),
      };
    } else if (
      installmentReq.data.installmentDetails &&
      installmentReq.data.installmentDetails[0].force3ds === 0
    ) {
    }
  }
}
