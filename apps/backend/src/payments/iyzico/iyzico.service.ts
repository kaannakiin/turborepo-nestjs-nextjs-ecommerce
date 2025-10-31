import { BadRequestException, Global, Injectable } from '@nestjs/common';
import { SignatureValidationData } from '@repo/types';
import { createHmac } from 'crypto';

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

@Global()
@Injectable()
export class IyzicoService {
  private readonly separator = ':';

  private async createIyzicoHeaders(
    data: string,
    uri_path: string,
    apiKey: string,
    secretKey: string,
  ): Promise<Record<string, string>> {
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

  private async iyzicoGenerateSignature(
    dataArray: string[],
    secretKey: string,
  ): Promise<string> {
    const dataToEncrypt = dataArray.join(this.separator);
    const encryptedData = createHmac('sha256', secretKey)
      .update(dataToEncrypt)
      .digest('hex');
    return encryptedData;
  }

  private formatPrice(price: number | string): string {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toString();
  }

  async iyzicoValidateSignature(
    type: ValidateSignature,
    data: SignatureValidationData,
    secretKey: string,
  ): Promise<boolean> {
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

    const generatedSignature = await this.iyzicoGenerateSignature(
      parametersArray,
      secretKey,
    );

    return generatedSignature === data.signature;
  }

  async iyzicoFetch<TRequest, TResponse>(
    apiKey: string,
    secretKey: string,
    uri_path: string,
    isTestMode: boolean,
    requestData: TRequest,
  ): Promise<TResponse> {
    const jsonData = JSON.stringify(requestData);
    const headers = await this.createIyzicoHeaders(
      jsonData,
      uri_path,
      apiKey,
      secretKey,
    );

    try {
      const response = await fetch(
        `${isTestMode ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com'}${uri_path}`,
        {
          method: 'POST',
          headers,
          body: jsonData,
        },
      );

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
}
