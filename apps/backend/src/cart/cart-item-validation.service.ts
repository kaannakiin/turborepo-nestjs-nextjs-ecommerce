import { Injectable } from '@nestjs/common';
import { Currency, inVisibleCause, Locale } from '@repo/database';
import {
  CartValidationResult,
  InvalidItemDetail,
  RestoreResult,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartItemValidationService {
  constructor(private readonly prismaService: PrismaService) {}

  async validateCartItems(
    cartId: string,
    locale: Locale,
    currency: Currency,
  ): Promise<CartValidationResult> {
    const items = await this.prismaService.cartItem.findMany({
      where: {
        cartId,
        isVisible: true,
        deletedAt: null,
      },
      include: {
        variant: {
          include: {
            prices: {
              where: { currency },
            },
            product: {
              include: {
                translations: {
                  where: { locale },
                },
              },
            },
          },
        },
      },
    });

    const itemsToHide: Array<{ id: string; cause: inVisibleCause }> = [];

    for (const item of items) {
      const hasPrice = item.variant.prices.length > 0;
      const hasTranslation = item.variant.product.translations.length > 0;

      if (!hasPrice) {
        itemsToHide.push({
          id: item.id,
          cause: inVisibleCause.CURRENCY_MISMATCH,
        });
      } else if (!hasTranslation) {
        itemsToHide.push({
          id: item.id,
          cause: inVisibleCause.LOCALE_MISMATCH,
        });
      }
    }

    return {
      itemsToHide,
      validCount: items.length - itemsToHide.length,
    };
  }

  async restoreEligibleItems(
    cartId: string,
    locale: Locale,
    currency: Currency,
  ): Promise<RestoreResult> {
    const hiddenItems = await this.prismaService.cartItem.findMany({
      where: {
        cartId,
        isVisible: false,
        visibleCause: {
          in: [
            inVisibleCause.LOCALE_MISMATCH,
            inVisibleCause.CURRENCY_MISMATCH,
          ],
        },
      },
      include: {
        variant: {
          include: {
            prices: {
              where: { currency },
            },
            product: {
              include: {
                translations: {
                  where: { locale },
                },
              },
            },
          },
        },
      },
    });

    const itemsToRestore = hiddenItems.filter((item) => {
      const hasPrice = item.variant.prices.length > 0;
      const hasTranslation = item.variant.product.translations.length > 0;
      return hasPrice && hasTranslation;
    });

    if (itemsToRestore.length > 0) {
      await this.prismaService.cartItem.updateMany({
        where: {
          id: { in: itemsToRestore.map((i) => i.id) },
        },
        data: {
          isVisible: true,
          visibleCause: null,
          deletedAt: null,
        },
      });
    }

    return {
      restoredCount: itemsToRestore.length,
      restoredItemIds: itemsToRestore.map((i) => i.id),
    };
  }

  async hideInvalidItems(
    itemsToHide: Array<{ id: string; cause: inVisibleCause }>,
  ): Promise<void> {
    if (itemsToHide.length === 0) return;

    const currencyMismatchIds = itemsToHide
      .filter((i) => i.cause === inVisibleCause.CURRENCY_MISMATCH)
      .map((i) => i.id);

    const localeMismatchIds = itemsToHide
      .filter((i) => i.cause === inVisibleCause.LOCALE_MISMATCH)
      .map((i) => i.id);

    const now = new Date();

    await this.prismaService.$transaction(async (tx) => {
      if (currencyMismatchIds.length > 0) {
        await tx.cartItem.updateMany({
          where: { id: { in: currencyMismatchIds } },
          data: {
            isVisible: false,
            visibleCause: inVisibleCause.CURRENCY_MISMATCH,
            deletedAt: now,
          },
        });
      }

      if (localeMismatchIds.length > 0) {
        await tx.cartItem.updateMany({
          where: { id: { in: localeMismatchIds } },
          data: {
            isVisible: false,
            visibleCause: inVisibleCause.LOCALE_MISMATCH,
            deletedAt: now,
          },
        });
      }
    });
  }

  async getInvalidItemsDetails(
    itemIds: string[],
  ): Promise<InvalidItemDetail[]> {
    if (itemIds.length === 0) return [];

    const items = await this.prismaService.cartItem.findMany({
      where: { id: { in: itemIds } },
      include: {
        variant: {
          include: {
            product: {
              include: {
                translations: {
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    return items.map((item) => ({
      cartItemId: item.id,
      variantId: item.variantId,
      productName:
        item.variant.product.translations[0]?.name || 'Bilinmeyen Ürün',
      cause: item.visibleCause!,
    }));
  }
}
