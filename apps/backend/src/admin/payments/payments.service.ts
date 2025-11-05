import { BadRequestException, Injectable } from '@nestjs/common';
import { $Enums, StorePaymentProvider } from '@repo/database';
import {
  GetPaymentMethodResponseType,
  IyzicoPaymentMethodType,
  PaymentMethodType,
  PayTRPaymentMethodType,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prismaService: PrismaService) {}
  async createPaymentMethod(data: PaymentMethodType): Promise<{
    success: boolean;
    message: string;
  }> {
    switch (data.type) {
      case 'IYZICO':
        return this.processIyzicoPaymentMethod(data as IyzicoPaymentMethodType);
      case 'PAYTR':
        return this.processPaytrPaymentMethod(data as PayTRPaymentMethodType);
      default:
        throw new BadRequestException('Geçersiz ödeme yöntemi türü.');
    }
  }

  async getPaymentMethod(
    methodType: $Enums.PaymentProvider,
  ): Promise<GetPaymentMethodResponseType> {
    try {
      const paymentMethod =
        await this.prismaService.storePaymentProvider.findUnique({
          where: {
            provider: methodType,
          },
        });
      if (!paymentMethod) {
        return {
          success: false,
          message: 'Ödeme yöntemi bulunamadı.',
        };
      }
      return {
        success: true,
        message: 'Ödeme yöntemi başarıyla getirildi.',
        data: this.processPaymentProvider(paymentMethod),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Ödeme yöntemi getirilirken bir hata oluştu.',
      };
    }
  }

  private async processPaytrPaymentMethod(data: PayTRPaymentMethodType) {
    try {
      const { type, isActive, isTestMode, ...rest } = data;
      await this.prismaService.storePaymentProvider.upsert({
        where: {
          provider: 'PAYTR',
        },
        create: {
          provider: 'PAYTR',
          active: isActive,
          isTestMode,
          options: JSON.parse(JSON.stringify(rest)),
        },
        update: {
          active: isActive,
          isTestMode,
          options: JSON.parse(JSON.stringify(rest)),
        },
      });
      return {
        success: true,
        message: 'Ödeme yöntemi başarıyla eklendi.',
      };
    } catch (error) {
      console.error('Error processing PayTR payment method:', error);
      return {
        success: false,
        message: 'Ödeme yöntemi eklenirken bir hata oluştu.',
      };
    }
  }

  private async processIyzicoPaymentMethod(data: IyzicoPaymentMethodType) {
    try {
      const { type, isActive, isTestMode, ...rest } = data;
      await this.prismaService.storePaymentProvider.upsert({
        where: {
          provider: 'IYZICO',
        },
        create: {
          provider: 'IYZICO',
          active: isActive,
          isTestMode,
          options: JSON.parse(JSON.stringify(rest)),
        },
        update: {
          active: isActive,
          isTestMode,
          options: JSON.parse(JSON.stringify(rest)),
        },
      });
      return {
        success: true,
        message: 'Ödeme yöntemi başarıyla eklendi.',
      };
    } catch (error) {
      console.error('Error processing Iyzico payment method:', error);
      return {
        success: false,
        message: 'Ödeme yöntemi eklenirken bir hata oluştu.',
      };
    }
  }

  private processPaymentProvider(
    data: StorePaymentProvider,
  ): PaymentMethodType {
    switch (data.provider) {
      case 'IYZICO':
        const options = data.options as Pick<
          IyzicoPaymentMethodType,
          'iyzicoApiKey' | 'iyzicoSecretKey'
        >;
        return {
          type: 'IYZICO',
          isTestMode: data.isTestMode,
          isActive: data.active,
          ...options,
        } as IyzicoPaymentMethodType;
      case 'PAYTR':
        const paytrOptions = data.options as Pick<
          PayTRPaymentMethodType,
          'merchantId' | 'merchantKey' | 'merchantSalt'
        >;
        return {
          type: 'PAYTR',
          isTestMode: data.isTestMode,
          isActive: data.active,
          ...paytrOptions,
        };
    }
  }

  async getPaymentMethods(): Promise<PaymentMethodType[]> {
    const paymentMethods =
      await this.prismaService.storePaymentProvider.findMany();
    return paymentMethods.map((method) => this.processPaymentProvider(method));
  }
}
