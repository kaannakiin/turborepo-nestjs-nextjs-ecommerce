import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PaymentRuleDetailResponse,
  PaymentRuleListResponse,
  PaymentRuleMutationResponse,
  toFlowDataJson,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaymentRuleDto } from './payment-rules-dto';

@Injectable()
export class PaymentRulesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(dto: PaymentRuleDto): Promise<PaymentRuleMutationResponse> {
    try {
      if (dto.isDefault) {
        await this.prismaService.paymentRule.updateMany({
          where: { isDefault: true },
          data: { isDefault: false },
        });
      }

      const rule = await this.prismaService.paymentRule.create({
        data: {
          name: dto.name,
          priority: dto.priority ?? 0,
          isActive: dto.isActive ?? true,
          isDefault: dto.isDefault ?? false,
          flowData: toFlowDataJson(dto.flowData),
        },
      });

      return {
        success: true,
        message: 'Ödeme kuralı başarıyla oluşturuldu',
        id: rule.id,
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Ödeme kuralı oluşturulurken hata oluştu',
      };
    }
  }

  async update(
    id: string,
    dto: PaymentRuleDto,
  ): Promise<PaymentRuleMutationResponse> {
    try {
      const existingRule = await this.prismaService.paymentRule.findUnique({
        where: { id },
      });

      if (!existingRule) {
        throw new NotFoundException('Ödeme kuralı bulunamadı');
      }

      if (dto.isDefault) {
        await this.prismaService.paymentRule.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }

      await this.prismaService.paymentRule.update({
        where: { id },
        data: {
          name: dto.name,
          priority: dto.priority,
          isActive: dto.isActive,
          isDefault: dto.isDefault,
          flowData: dto.flowData ? toFlowDataJson(dto.flowData) : undefined,
        },
      });

      return {
        success: true,
        message: 'Ödeme kuralı başarıyla güncellendi',
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Ödeme kuralı güncellenirken hata oluştu',
      };
    }
  }

  async delete(id: string): Promise<PaymentRuleMutationResponse> {
    try {
      const existingRule = await this.prismaService.paymentRule.findUnique({
        where: { id },
      });

      if (!existingRule) {
        throw new NotFoundException('Ödeme kuralı bulunamadı');
      }

      await this.prismaService.paymentRule.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Ödeme kuralı başarıyla silindi',
      };
    } catch (error) {
      return {
        success: false,
        message: error?.message || 'Ödeme kuralı silinirken hata oluştu',
      };
    }
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<PaymentRuleListResponse> {
    const [rules, total] = await Promise.all([
      this.prismaService.paymentRule.findMany({
        orderBy: { priority: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prismaService.paymentRule.count(),
    ]);

    return {
      success: true,
      data: rules,
      pagination: {
        currentPage: page,
        perPage: limit,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string): Promise<PaymentRuleDetailResponse> {
    const rule = await this.prismaService.paymentRule.findUnique({
      where: { id },
    });

    if (!rule) {
      return {
        success: false,
        message: 'Ödeme kuralı bulunamadı',
      };
    }

    return {
      success: true,
      data: rule,
    };
  }
}
