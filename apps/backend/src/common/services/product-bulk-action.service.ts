import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '@repo/database';
import { BulkActionResult, BulkActionZodType } from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductBulkActionService {
  constructor(private readonly prismaService: PrismaService) {}

  async performBulkAction(
    data: BulkActionZodType,
    user: User,
  ): Promise<BulkActionResult> {
    const { action, otherDetails, productIds } = data;
    if (!productIds.length) {
      throw new BadRequestException('No products selected');
    }

    switch (action) {
      case 'activate':
        return this.activateProducts(productIds);
      case 'deactivate':
        return this.deactivateProducts(productIds);
      case 'delete':
        return this.deleteProducts(productIds, user.id, otherDetails?.reason);
      default:
        throw new BadRequestException('Invalid bulk action');
    }
  }

  private async activateProducts(
    productIds: string[],
  ): Promise<BulkActionResult> {
    try {
      const result = await this.prismaService.product.updateMany({
        where: { id: { in: productIds } },
        data: { active: true },
      });

      return { success: true, affectedCount: result.count };
    } catch (error) {
      throw new InternalServerErrorException('Failed to activate products');
    }
  }

  private async deactivateProducts(
    productIds: string[],
  ): Promise<BulkActionResult> {
    try {
      const result = await this.prismaService.product.updateMany({
        where: { id: { in: productIds } },
        data: { active: false },
      });

      return { success: true, affectedCount: result.count };
    } catch (error) {
      throw new InternalServerErrorException('Failed to deactivate products');
    }
  }

  private async deleteProducts(
    productIds: string[],
    userId: string,
    reason?: string,
  ) {
    try {
      const result = await this.prismaService.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          deletedAt: new Date(),
          deleteReason: reason || null,
          deletedBy: userId,
          active: false,
        },
      });
      return { success: true, affectedCount: result.count };
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete products');
    }
  }
}
