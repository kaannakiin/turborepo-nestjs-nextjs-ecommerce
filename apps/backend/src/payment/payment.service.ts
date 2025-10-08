import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@repo/database';
import { createId } from '@repo/shared';
import {
  BasketItem,
  BinCheckRequest,
  BinCheckResponse,
  BinCheckSuccessResponse,
  Buyer,
  CartV3,
  CompleteThreeDSRequest,
  CompleteThreeDSResponse,
  InstallmentRequest,
  InstallmentResponse,
  InstallmentSuccessResponse,
  NonThreeDSRequest,
  PaymentZodType,
  SignatureValidationData,
  ThreeDCallback,
  ThreeDSRequest,
  ThreeDSResponse,
} from '@repo/types';
import { createHmac } from 'crypto';
import { Request, Response } from 'express';
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
  private webUrl = this.configService.get<string>(
    'WEB_UI_REDIRECT',
    'http://localhost:3000',
  );
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

  async createPaymentIntent({
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
    initThreeD?: boolean;
    threeDHtmlContent?: string;
    orderNumber?: string;
  }> {
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
      (shipping) => shipping.id === checkoutCart.cargoRule?.id,
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
    ).flatMap((item) => {
      const { quantity, ...itemWithoutQuantity } = item;
      return Array.from({ length: item.quantity }, () => ({
        ...itemWithoutQuantity,
        price: Math.round(itemWithoutQuantity.price), // ✅ Fiyatı tam sayıya yuvarla
      }));
    }) as BasketItem[];

    const cleanCardNumber = data.creditCardNumber.replace(/\s+/g, '');

    const subtotal = Math.round(
      basketItemsFillQuantity.reduce((acc, item) => acc + item.price, 0),
    );

    const paidPrice =
      shippingMethod.price && shippingMethod.price > 0
        ? subtotal + Math.round(shippingMethod.price)
        : subtotal;

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
    let createdBillingAddress: Prisma.AddressSchemaGetPayload<{
      include: {
        city: {
          select: {
            name: true;
          };
        };
        country: {
          select: {
            name: true;
            emoji: true;
          };
        };
        state: {
          select: {
            name: true;
          };
        };
      };
    }> | null = null;
    if (!data.isBillingAddressSame && data.billingAddress) {
      createdBillingAddress = await this.prisma.addressSchema.upsert({
        where: {
          id: data.billingAddress.id,
        },
        create: {
          isBillingAddress: true,
          addressLine1: data.billingAddress.addressLine1,
          addressLine2: data.billingAddress.addressLine2,
          ...(data.billingAddress.addressType === 'CITY'
            ? {
                stateId: null,
                cityId: data.billingAddress.cityId,
              }
            : data.billingAddress.addressType === 'STATE'
              ? {
                  stateId: data.billingAddress.stateId,
                  cityId: null,
                }
              : {
                  stateId: null,
                  cityId: null,
                }),
          addressLocationType: data.billingAddress.addressType,
          countryId: data.billingAddress.countryId,
          name: data.billingAddress.name,
          tcKimlikNo: data.billingAddress.tcKimlikNo,
          phone: data.billingAddress.phone,
          surname: data.billingAddress.surname,
          ...(data.billingAddress.isCorporateInvoice
            ? {
                companyName: data.billingAddress.companyName,
                taxNumber: data.billingAddress.taxNumber,
                taxOffice: data.billingAddress.companyRegistrationAddress,
              }
            : {}),
        },
        update: {
          isBillingAddress: true,
          addressLine1: data.billingAddress.addressLine1,
          addressLine2: data.billingAddress.addressLine2,
          tcKimlikNo: data.billingAddress.tcKimlikNo,
          ...(data.billingAddress.addressType === 'CITY'
            ? {
                stateId: null,
                cityId: data.billingAddress.cityId,
              }
            : data.billingAddress.addressType === 'STATE'
              ? {
                  stateId: data.billingAddress.stateId,
                  cityId: null,
                }
              : {
                  stateId: null,
                  cityId: null,
                }),
          addressLocationType: data.billingAddress.addressType,
          countryId: data.billingAddress.countryId,
          name: data.billingAddress.name,
          phone: data.billingAddress.phone,
          surname: data.billingAddress.surname,
          ...(data.billingAddress.isCorporateInvoice
            ? {
                companyName: data.billingAddress.companyName,
                taxNumber: data.billingAddress.taxNumber,
                taxOffice: data.billingAddress.companyRegistrationAddress,
              }
            : {}),
        },
        include: {
          city: {
            select: {
              name: true,
            },
          },
          country: {
            select: {
              name: true,
              emoji: true,
            },
          },
          state: {
            select: {
              name: true,
            },
          },
        },
      });
      await this.prisma.cart.update({
        where: { id: checkoutCart.cartId },
        data: {
          billingAddressId: createdBillingAddress.id,
        },
      });
    }

    const shippingAddress: NonThreeDSRequest['shippingAddress'] = {
      address: `${checkoutCart.shippingAddress.addressLine1}, ${checkoutCart.shippingAddress.addressLine2 || ' '}  ${checkoutCart.shippingAddress.city.name}, ${checkoutCart.shippingAddress.country.name}`,
      city:
        checkoutCart.shippingAddress.city?.name ||
        checkoutCart.shippingAddress.state?.name ||
        'N/A',
      contactName:
        `${checkoutCart.shippingAddress.name || 'N/A'} ${
          checkoutCart.shippingAddress.surname || 'N/A'
        }` || 'N/A',
      country: checkoutCart.shippingAddress.country.name || 'N/A',
      zipCode: checkoutCart.shippingAddress.zipCode || '00000',
    };

    const billingAddress: NonThreeDSRequest['billingAddress'] =
      !data.isBillingAddressSame && createdBillingAddress
        ? {
            address: `${createdBillingAddress.addressLine1}, ${createdBillingAddress.addressLine2 || ' '}  ${createdBillingAddress.city.name}, ${createdBillingAddress.country.name}`,
            city:
              createdBillingAddress.city?.name ||
              createdBillingAddress.state?.name ||
              'N/A',
            contactName:
              `${createdBillingAddress.name || 'N/A'} ${
                createdBillingAddress.surname || 'N/A'
              }` || 'N/A',
            country:
              `${createdBillingAddress.country.name} ${createdBillingAddress.country.emoji || ''}` ||
              'N/A',
            zipCode: createdBillingAddress.zipCode || '00000',
          }
        : shippingAddress;

    const buyerSourceAddress =
      !data.isBillingAddressSame && createdBillingAddress
        ? createdBillingAddress
        : checkoutCart.shippingAddress;

    const buyer: Buyer = {
      city:
        buyerSourceAddress.city?.name ||
        buyerSourceAddress.state?.name ||
        'N/A',
      country: buyerSourceAddress.country?.name || 'N/A',
      email:
        user?.email ||
        checkoutCart.user?.email ||
        checkoutCart?.shippingAddress?.email ||
        'N/A',
      gsmNumber: buyerSourceAddress.phone || checkoutCart.user?.phone || 'N/A',
      id: user?.id || checkoutCart.userId || createId(),
      identityNumber: buyerSourceAddress.tcKimlikNo || '00000000000',
      name: user?.name.trim() || checkoutCart.user?.name.trim() || 'N/A',
      surname:
        user?.surname.trim() || checkoutCart.user?.surname?.trim() || 'N/A',
      registrationAddress: `${buyerSourceAddress.addressLine1}, ${
        buyerSourceAddress.city?.name || buyerSourceAddress.state?.name || 'N/A'
      }, ${buyerSourceAddress.country?.name || 'N/A'}`,
      ip: req.socket.remoteAddress || req.ip || 'N/A',
    };

    const paymentReqConversationId = createId();

    const paymentRequest: NonThreeDSRequest | ThreeDSRequest = {
      locale: 'tr',
      billingAddress,
      buyer,
      conversationId: paymentReqConversationId,
      basketItems: basketItemsFillQuantity,
      paidPrice: paidPrice,
      price: subtotal,
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
    const cretedReq = await this.prisma.paymentRequestSchema.create({
      data: {
        amount: paidPrice,
        cartId: checkoutCart.cartId,
        currency: checkoutCart.currency,
        paymentProvider: 'IYZICO',
        paymentStatus: 'WAITING_THREE_D_SECURE',
        cargoRuleId: checkoutCart.cargoRule.id,
        ...(createdBillingAddress && !data.isBillingAddressSame
          ? {
              billingAddress: JSON.parse(
                JSON.stringify(paymentRequest.billingAddress),
              ),
            }
          : {}),
        userId: user?.id || null,
        shippingAddress: JSON.parse(
          JSON.stringify(paymentRequest.shippingAddress),
        ),
        shippingCost: shippingMethod.price || null,
        cardType: installmentReq.data.installmentDetails[0].cardType,
        cardAssociation:
          installmentReq.data.installmentDetails[0].cardAssociation,
        binNumber: data.creditCardNumber.replace(/\s+/g, '').substring(0, 6),
        lastFourDigits: cleanCardNumber.slice(-4),
        installment: 1,
      },
    });
    if (
      installmentReq.data.installmentDetails &&
      installmentReq.data.installmentDetails[0].force3ds === 1
    ) {
      const threeDSRequest: ThreeDSRequest = {
        ...paymentRequest,
        callbackUrl: `${this.configService.get<string>('IYZICO_CALLBACK_URL')}?uu=${cretedReq.id}`,
      };

      const threeDsReq = await this.iyzicoFetch<
        ThreeDSRequest,
        ThreeDSResponse
      >('/payment/3dsecure/initialize', threeDSRequest);

      if (threeDsReq.status === 'failure') {
        await this.prisma.paymentRequestSchema.update({
          where: {
            id: cretedReq.id,
          },
          data: {
            errorCode: threeDsReq.errorCode,
            errorMessage: threeDsReq.errorMessage,
            paymentStatus: 'FAILED',
          },
        });
        return {
          success: false,
          message:
            'Ödeme işlemi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyiniz.',
        };
      }
      if (threeDsReq.conversationId === paymentReqConversationId) {
        const isValidSignature = this.iyzicoValidateSignature(
          '3ds-initialize',
          {
            conversationId: threeDsReq.conversationId,
            signature: threeDsReq.signature,
            paymentId: threeDsReq.paymentId,
          },
        );

        if (!isValidSignature) {
          return {
            success: false,
            message:
              'Ödeme işlemi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyiniz.',
          };
        }

        return {
          success: true,
          message: '3D Secure doğrulaması gerekiyor.',
          initThreeD: true,
          threeDHtmlContent: threeDsReq.threeDSHtmlContent,
        };
      }
    } else if (
      installmentReq.data.installmentDetails &&
      installmentReq.data.installmentDetails[0].force3ds === 0
    ) {
    }
  }

  async iyzicoThreeDCallback({
    paymentReqId,
    body,
    res,
  }: {
    paymentReqId: string;
    body: ThreeDCallback;
    res: Response;
  }) {
    if (!paymentReqId) {
      return res.redirect(`${this.webUrl}/checkout`);
    }
    const paymentReq = await this.prisma.paymentRequestSchema.findUnique({
      where: {
        id: paymentReqId,
      },
      include: {
        cart: {
          select: { locale: true },
        },
        cargoRule: {
          select: {
            price: true,
          },
        },
      },
    });
    if (!paymentReq) {
      return res.redirect(`${this.webUrl}/checkout`);
    }
    const cartId = paymentReq.cartId;
    const isSignatureValid = this.iyzicoValidateSignature('callback-url', {
      conversationData: body.conversationData,
      conversationId: body.conversationId,
      mdStatus: body.mdStatus,
      paymentId: body.paymentId,
      status: body.status,
      signature: body.signature,
    });

    if (!isSignatureValid) {
      return res.redirect(
        `${this.webUrl}/checkout/${cartId}?step=payment&error=${encodeURIComponent('Geçersiz imza')}`,
      );
    }

    if (body.status === 'failure' || body.mdStatus !== '1') {
      const errorMessages: Record<string, string> = {
        '0': '3D Secure doğrulaması başarısız. Lütfen kart bilgilerinizi kontrol edip tekrar deneyiniz.',
        '-1': '3D Secure doğrulaması başarısız. Lütfen kart bilgilerinizi kontrol edip tekrar deneyiniz.',
        '2': 'Kartınız 3D Secure sistemine kayıtlı değil. Lütfen bankanızla iletişime geçiniz.',
        '3': 'Kartınızın bankası 3D Secure sistemine kayıtlı değil. Lütfen farklı bir kart deneyiniz.',
        '4': '3D Secure doğrulaması tamamlanamadı. Lütfen tekrar deneyiniz veya farklı bir kart kullanınız.',
        '5': '3D Secure doğrulaması yapılamıyor. Lütfen bankanızla iletişime geçiniz veya farklı bir kart deneyiniz.',
        '6': '3D Secure doğrulama hatası. Lütfen tekrar deneyiniz.',
        '7': 'Sistem hatası oluştu. Lütfen daha sonra tekrar deneyiniz.',
        '8': 'Kart numarası tanımlanamadı. Lütfen kart bilgilerinizi kontrol ediniz.',
      };

      const errorMessage =
        errorMessages[body.mdStatus] ||
        'Ödeme işlemi başarısız. Lütfen tekrar deneyiniz.';

      return res.redirect(
        `${this.webUrl}/checkout/${cartId}?step=payment&error=${encodeURIComponent(errorMessage)}`,
      );
    }

    const conversationId = createId();

    const completeThreeDReq = await this.iyzicoFetch<
      CompleteThreeDSRequest,
      CompleteThreeDSResponse
    >('/payment/3dsecure/auth', {
      conversationId,
      locale: 'tr',
      paymentId: body.paymentId,
      conversationData: body.conversationData,
    });
    if (completeThreeDReq.status === 'failure') {
      return res.redirect(
        `${this.webUrl}/checkout/${cartId}?step=payment&error=${encodeURIComponent('Ödeme işlemi gerçekleştirilemedi. Lütfen daha sonra tekrar deneyiniz.')}`,
      );
    }

    if (completeThreeDReq.conversationId === conversationId) {
      const isValidSignature = this.iyzicoValidateSignature('3ds-auth', {
        paymentId: completeThreeDReq.paymentId,
        currency: completeThreeDReq.currency,
        basketId: completeThreeDReq.basketId,
        conversationId: completeThreeDReq.conversationId,
        paidPrice: completeThreeDReq.paidPrice,
        price: completeThreeDReq.price,
        signature: completeThreeDReq.signature,
      });
      if (!isValidSignature) {
        return res.redirect(
          `${this.webUrl}/checkout/${cartId}?step=payment&error=${encodeURIComponent('Geçersiz imza')}`,
        );
      }
    }
    if (completeThreeDReq.status === 'success') {
      let orderNumber = this.generateUniqueOrderNumber();
      const orderNumberisUnique = async (orderNumber: string) => {
        const existingOrder = await this.prisma.order.findUnique({
          where: { orderNumber },
        });
        return !existingOrder;
      };
      while (!(await orderNumberisUnique(orderNumber))) {
        orderNumber = this.generateUniqueOrderNumber();
      }

      await this.prisma.$transaction(
        async (prisma) => {
          const order = await prisma.order.create({
            data: {
              orderNumber,
              paymentId: completeThreeDReq.paymentId,
              subtotal: parseFloat(completeThreeDReq.price.toFixed(2)),
              totalAmount: parseFloat(completeThreeDReq.paidPrice.toFixed(2)),
              ...(paymentReq.billingAddress
                ? {
                    billingAddress: JSON.parse(
                      JSON.stringify(paymentReq.billingAddress),
                    ),
                  }
                : {}),
              shippingAddress: JSON.parse(
                JSON.stringify(paymentReq.shippingAddress),
              ),
              currency: paymentReq.currency,
              binNumber: paymentReq.binNumber,
              lastFourDigits: paymentReq.lastFourDigits,
              cardType: paymentReq.cardType,
              cardAssociation: paymentReq.cardAssociation,
              cardFamily: paymentReq.cardFamily,
              paymentType: 'THREE_D_SECURE',
              shippingCost: paymentReq.cargoRule?.price || 0,
              paymentStatus: 'PAID',
              userId: paymentReq.userId,
              cartId: paymentReq.cartId,
              locale: paymentReq.cart.locale,
            },
          });
          const groupedItems = completeThreeDReq.itemTransactions.reduce(
            (acc, item) => {
              if (!acc[item.itemId]) {
                acc[item.itemId] = {
                  items: [],
                  totalQuantity: 0,
                  totalPaidPrice: 0,
                  firstItem: item,
                };
              }

              acc[item.itemId].items.push(item);
              acc[item.itemId].totalQuantity += 1;
              acc[item.itemId].totalPaidPrice += item.paidPrice;

              return acc;
            },
            {} as Record<
              string,
              {
                items: typeof completeThreeDReq.itemTransactions;
                totalQuantity: number;
                totalPaidPrice: number;
                firstItem: (typeof completeThreeDReq.itemTransactions)[0];
              }
            >,
          );

          // Tüm ürünleri paralel olarak işle
          await Promise.all(
            Object.entries(groupedItems).map(async ([itemId, groupedData]) => {
              const [productId, variantId] = itemId.split('-');
              const { totalQuantity, totalPaidPrice, firstItem } = groupedData;

              // VARIANT İÇİN
              if (variantId) {
                const productVariant =
                  await prisma.productVariantCombination.findUnique({
                    where: {
                      id: variantId,
                      productId,
                    },
                    include: {
                      assets: {
                        take: 1,
                        orderBy: {
                          order: 'asc',
                        },
                        select: {
                          asset: {
                            select: {
                              url: true,
                              type: true,
                            },
                          },
                        },
                      },
                      prices: true,
                      translations: true,
                      options: {
                        orderBy: [
                          {
                            productVariantOption: {
                              productVariantGroup: {
                                order: 'asc',
                              },
                            },
                          },
                          {
                            productVariantOption: { order: 'asc' },
                          },
                        ],
                        select: {
                          productVariantOption: {
                            select: {
                              variantOption: {
                                select: {
                                  id: true,
                                  hexValue: true,
                                  translations: true,
                                  asset: {
                                    select: {
                                      url: true,
                                      type: true,
                                    },
                                  },
                                  variantGroup: {
                                    select: {
                                      id: true,
                                      translations: true,
                                      type: true,
                                    },
                                  },
                                },
                              },
                            },
                          },
                        },
                      },
                      product: {
                        include: {
                          translations: true,
                          assets: {
                            take: 1,
                            select: {
                              asset: {
                                select: {
                                  url: true,
                                  type: true,
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  });

                if (!productVariant) {
                  return;
                }

                const { options, ...rest } = productVariant;

                // Birim fiyat hesapla (ortalama)
                const avgPaidPrice = this.toFixedPrice(
                  totalPaidPrice / totalQuantity,
                );

                await prisma.orderItem.upsert({
                  where: {
                    orderId_productId_variantId: {
                      orderId: order.id,
                      productId,
                      variantId,
                    },
                  },
                  update: {
                    quantity: { increment: totalQuantity },
                    totalPrice: {
                      increment: this.toFixedPrice(totalPaidPrice),
                    },
                    // Ortalama fiyatı güncelle
                    buyedPrice: avgPaidPrice,
                  },
                  create: {
                    buyedPrice: avgPaidPrice,
                    productId,
                    variantId,
                    quantity: totalQuantity,
                    orderId: order.id,
                    totalPrice: this.toFixedPrice(totalPaidPrice),
                    originalPrice: this.toFixedPrice(firstItem.price),
                    buyedVariants: JSON.parse(
                      JSON.stringify(
                        options.map(
                          (o) => o.productVariantOption.variantOption,
                        ),
                      ),
                    ),
                    productSnapshot: JSON.parse(JSON.stringify(rest)),
                    transactionId: firstItem.paymentTransactionId, // İlk transaction ID
                  },
                });
              }

              // NORMAL ÜRÜN İÇİN (Variant olmayan)
              if (!variantId && productId) {
                const product = await prisma.product.findUnique({
                  where: { id: productId },
                  include: {
                    assets: {
                      take: 1,
                      orderBy: {
                        order: 'asc',
                      },
                      select: {
                        asset: {
                          select: {
                            url: true,
                            type: true,
                          },
                        },
                      },
                    },
                    prices: true,
                    translations: true,
                  },
                });

                if (!product) {
                  return;
                }

                // Birim fiyat hesapla (ortalama)
                const avgPaidPrice = this.toFixedPrice(
                  totalPaidPrice / totalQuantity,
                );

                await prisma.orderItem.upsert({
                  where: {
                    orderId_productId_variantId: {
                      orderId: order.id,
                      productId,
                      variantId: null,
                    },
                  },
                  update: {
                    quantity: { increment: totalQuantity },
                    totalPrice: {
                      increment: this.toFixedPrice(totalPaidPrice),
                    },
                    // Ortalama fiyatı güncelle
                    buyedPrice: avgPaidPrice,
                  },
                  create: {
                    buyedPrice: avgPaidPrice,
                    productId,
                    quantity: totalQuantity,
                    orderId: order.id,
                    totalPrice: this.toFixedPrice(totalPaidPrice),
                    originalPrice: this.toFixedPrice(firstItem.price),
                    productSnapshot: JSON.parse(JSON.stringify(product)),
                    transactionId: firstItem.paymentTransactionId,
                  },
                });
              }
            }),
          );
        },
        { timeout: 10 * 60 * 1000 }, // 10 dakika
      );
      await this.prisma.cart.update({
        where: { id: paymentReq.cartId },
        data: {
          status: 'CONVERTED',
        },
      });

      return res.redirect(`${this.webUrl}/order/${orderNumber}`);
    }
  }
  private toFixedPrice(price: number): number {
    return parseFloat(price.toFixed(2));
  }
  private generateUniqueOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const daySeconds = Math.floor(
      (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 10,
    );
    return `ORD-${year}${String(daySeconds).padStart(5, '0')}-${createId().slice(0, 4).toUpperCase()}`;
  }
}
