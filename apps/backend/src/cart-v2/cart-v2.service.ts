import { Injectable } from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  $Enums,
  AddItemToCartV2,
  CartActionResponse,
  CartContextCartItemType,
  CartContextCartType,
  GetCartByIdReturn,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CartV2Service {
  constructor(private prisma: PrismaService) {}
  private async updateCartVisibleCause(
    setInVisibleItems: Array<{
      cause: $Enums.inVisibleCause;
      itemId: string;
    }>,
    setVisibleItems: Array<{ itemId: string }>,
  ) {
    if (setInVisibleItems.length === 0 && setVisibleItems.length === 0) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      // Invisible yapılacaklar - cause'a göre grupla
      if (setInVisibleItems.length > 0) {
        // CURRENCY_MISMATCH olanlar
        const currencyMismatchIds = setInVisibleItems
          .filter((i) => i.cause === $Enums.inVisibleCause.CURRENCY_MISMATCH)
          .map((i) => i.itemId);

        if (currencyMismatchIds.length > 0) {
          await tx.cartItem.updateMany({
            where: { id: { in: currencyMismatchIds } },
            data: {
              isVisible: false,
              visibleCause: $Enums.inVisibleCause.CURRENCY_MISMATCH,
            },
          });
        }

        // LOCALE_MISMATCH olanlar
        const localeMismatchIds = setInVisibleItems
          .filter((i) => i.cause === $Enums.inVisibleCause.LOCALE_MISMATCH)
          .map((i) => i.itemId);

        if (localeMismatchIds.length > 0) {
          await tx.cartItem.updateMany({
            where: { id: { in: localeMismatchIds } },
            data: {
              isVisible: false,
              visibleCause: $Enums.inVisibleCause.LOCALE_MISMATCH,
            },
          });
        }

        // OUT_OF_STOCK olanlar
        const outOfStockIds = setInVisibleItems
          .filter((i) => i.cause === $Enums.inVisibleCause.OUT_OF_STOCK)
          .map((i) => i.itemId);

        if (outOfStockIds.length > 0) {
          await tx.cartItem.updateMany({
            where: { id: { in: outOfStockIds } },
            data: {
              isVisible: false,
              visibleCause: $Enums.inVisibleCause.OUT_OF_STOCK,
            },
          });
        }
      }

      // Visible yapılacaklar
      if (setVisibleItems.length > 0) {
        await tx.cartItem.updateMany({
          where: { id: { in: setVisibleItems.map((i) => i.itemId) } },
          data: {
            isVisible: true,
            visibleCause: null,
          },
        });
      }
    });
  }

  private async getCart(cartId: string): Promise<GetCartByIdReturn | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        billingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            country: {
              select: { id: true, name: true, emoji: true, translations: true },
            },
            state: {
              select: { id: true, name: true },
            },
          },
        },
        shippingAddress: {
          include: {
            city: { select: { id: true, name: true } },
            country: {
              select: { id: true, name: true, emoji: true, translations: true },
            },
            state: {
              select: { id: true, name: true },
            },
          },
        },
        items: {
          include: {
            product: {
              include: {
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
                translations: true,
                brand: {
                  select: {
                    id: true,
                    translations: true,
                  },
                },
                categories: {
                  select: {
                    category: {
                      select: {
                        id: true,
                        translations: true,
                      },
                    },
                  },
                },
                prices: true,
              },
            },
            variant: {
              include: {
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
                prices: true,
                translations: true,
                options: {
                  orderBy: {
                    productVariantOption: {
                      productVariantGroup: {
                        order: 'asc',
                      },
                    },
                  },
                  select: {
                    productVariantOption: {
                      select: {
                        variantOption: {
                          select: {
                            id: true,
                            translations: true,
                            hexValue: true,
                            asset: { select: { url: true, type: true } },
                            variantGroup: {
                              select: {
                                translations: true,
                                type: true,
                                id: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: { select: { id: true, email: true } },
        cargoRule: true,
      },
    });
    if (!cart) return null;
    return cart as GetCartByIdReturn;
  }

  private convertCartToContextType(
    cart: GetCartByIdReturn,
    selectedCurrency: $Enums.Currency,
    selectedLocale: $Enums.Locale,
  ): CartContextCartType['items'] {
    const setInVisibleItems: Array<{
      cause: $Enums.inVisibleCause;
      itemId: string;
    }> = [];
    const setVisibleItems: Array<{ itemId: string }> = [];

    const visibleItems = cart.items.filter((item) => {
      if (!item.productId) return false;
      if (item.deletedAt) {
        return false;
      }
      // Variant varsa variant'ın price'ını kontrol et
      if (item.variant && item.variantId) {
        const variantPrice = item.variant.prices.find(
          (p) => p.currency === selectedCurrency,
        );

        const variantTranslation = item.product.translations.find(
          (t) => t.locale === selectedLocale,
        );

        // Eğer price veya translation yoksa invisible yap
        if (!variantPrice) {
          setInVisibleItems.push({
            cause: $Enums.inVisibleCause.CURRENCY_MISMATCH,
            itemId: item.id,
          });
          return false;
        }
        if (item.variant.stock <= 0) {
          setInVisibleItems.push({
            cause: $Enums.inVisibleCause.OUT_OF_STOCK,
            itemId: item.id,
          });
          return false;
        }
        if (!variantTranslation) {
          setInVisibleItems.push({
            cause: $Enums.inVisibleCause.LOCALE_MISMATCH,
            itemId: item.id,
          });
          return false;
        }

        // Eğer item daha önce invisible idi ama şimdi uygunsa visible yap
        if (
          !item.isVisible &&
          (item.visibleCause === $Enums.inVisibleCause.CURRENCY_MISMATCH ||
            item.visibleCause === $Enums.inVisibleCause.LOCALE_MISMATCH ||
            item.visibleCause === $Enums.inVisibleCause.OUT_OF_STOCK)
        ) {
          setVisibleItems.push({ itemId: item.id });
        }

        return true;
      }

      // Product için aynı kontroller
      if (item.product) {
        const productPrice = item.product.prices.find(
          (p) => p.currency === selectedCurrency,
        );
        const productTranslation = item.product.translations.find(
          (t) => t.locale === selectedLocale,
        );

        if (!productPrice) {
          setInVisibleItems.push({
            cause: $Enums.inVisibleCause.CURRENCY_MISMATCH,
            itemId: item.id,
          });
          return false;
        }
        if (item.product.stock <= 0) {
          setInVisibleItems.push({
            cause: $Enums.inVisibleCause.OUT_OF_STOCK,
            itemId: item.id,
          });
          return false;
        }

        if (!productTranslation) {
          setInVisibleItems.push({
            cause: $Enums.inVisibleCause.LOCALE_MISMATCH,
            itemId: item.id,
          });
          return false;
        }

        // Eğer item daha önce invisible idi ama şimdi uygunsa visible yap
        if (
          !item.isVisible &&
          (item.visibleCause === $Enums.inVisibleCause.CURRENCY_MISMATCH ||
            item.visibleCause === $Enums.inVisibleCause.LOCALE_MISMATCH ||
            item.visibleCause === $Enums.inVisibleCause.OUT_OF_STOCK)
        ) {
          setVisibleItems.push({ itemId: item.id });
        }

        return true;
      }

      return false;
    });
    if (setInVisibleItems.length > 0 || setVisibleItems.length > 0) {
      this.updateCartVisibleCause(setInVisibleItems, setVisibleItems).catch(
        (error) => {
          console.error('Failed to update cart visibility:', error);
        },
      );
    }
    return visibleItems.map((item) => {
      if (item.variant && item.variantId) {
        const translation = item.product.translations.find(
          (t) => t.locale === selectedLocale,
        );
        const prices = item.variant.prices.find(
          (p) => p.currency === selectedCurrency,
        );

        if (!translation || !prices) {
          return null;
        }
        const variantOptions = item.variant.options.map((opt) => {
          const optTrans =
            opt.productVariantOption.variantOption.translations.find(
              (t) => t.locale === selectedLocale,
            ) || opt.productVariantOption.variantOption.translations[0];
          const groupTrans =
            opt.productVariantOption.variantOption.variantGroup.translations.find(
              (t) => t.locale === selectedLocale,
            ) ||
            opt.productVariantOption.variantOption.variantGroup.translations[0];
          return {
            variantGroupName: groupTrans?.name,
            variantOptionName: optTrans?.name,
            variantGroupSlug: groupTrans?.slug,
            variantOptionSlug: optTrans?.slug,
            variantOptionAsset: opt.productVariantOption.variantOption.asset
              ? {
                  url: opt.productVariantOption.variantOption.asset.url,
                  type: opt.productVariantOption.variantOption.asset.type,
                }
              : null,
            variantOptionHexValue:
              opt.productVariantOption.variantOption.hexValue,
          } as CartContextCartItemType['variantOptions'][number];
        });
        return {
          whereAdded: item.whereAdded || 'PRODUCT_PAGE',
          itemId: item.id,
          productId: item.productId,
          price: prices?.price,
          productName: translation?.name,
          quantity: item.quantity,
          discountedPrice: prices?.discountedPrice,
          variantId: item.variantId,
          productAsset: item.product.assets[0]?.asset
            ? {
                url: item.product.assets[0]?.asset.url,
                type: item.product.assets[0]?.asset.type,
              }
            : null,
          variantAsset: item.variant.assets[0]?.asset
            ? {
                url: item.variant.assets[0]?.asset.url,
                type: item.variant.assets[0]?.asset.type,
              }
            : null,
          variantOptions,
          productUrl: variantOptions
            ? `${translation.slug}?${variantOptions.map((vo) => `${vo.variantGroupSlug}=${vo.variantOptionSlug}`).join('&')}`
            : `${translation.slug}`,
        };
      } else {
        const translation = item.product.translations.find(
          (t) => t.locale === selectedLocale,
        );
        const prices = item.product.prices.find(
          (p) => p.currency === selectedCurrency,
        );
        if (!translation || !prices) {
          return null;
        }
        return {
          whereAdded: item.whereAdded || 'PRODUCT_PAGE',
          itemId: item.id,
          discountedPrice: prices?.discountedPrice,
          price: prices?.price,
          productAsset: item.product.assets[0]?.asset
            ? {
                url: item.product.assets[0]?.asset.url,
                type: item.product.assets[0]?.asset.type,
              }
            : null,
          productId: item.productId,
          productName: translation?.name,
          productUrl: translation?.slug,
          quantity: item.quantity,
          variantAsset: null,
          variantId: null,
          variantOptions: [],
        };
      }
    });
  }

  async getCartForContext(
    cartId: string,
    selectedCurrency: $Enums.Currency = 'TRY',
    selectedLocale: $Enums.Locale = 'TR',
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }
    const items = this.convertCartToContextType(
      cart,
      selectedCurrency,
      selectedLocale,
    ).filter((i): i is CartContextCartItemType => i !== null);
    return {
      success: true,
      message: 'Sepet başarıyla getirildi',
      newCart: {
        items,
        cartId: cart.id,
        currency: cart.currency,
        createdAt: cart.createdAt,
        lastActivityAt: cart.updatedAt,
        locale: cart.locale,
        status: cart.status as $Enums.CartStatus,
        totalItems: items.reduce((sum, i) => sum, 0),
        totalPrice: items.reduce(
          (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
          0,
        ),
        subTotalPrice: items.reduce(
          (sum, i) => sum + (i.discountedPrice || i.price) * i.quantity,
          0,
        ),
        totalDiscount: items.reduce(
          (sum, i) =>
            sum + (i.price - (i.discountedPrice || i.price)) * i.quantity,
          0,
        ),
        orderNote: null,
        taxTotal: 0,
        updatedAt: cart.updatedAt,
        userId: cart.userId || undefined,
      } as CartActionResponse['newCart'],
    };
  }

  async addItemToCart(
    cartId: string | null,
    item: AddItemToCartV2,
  ): Promise<CartActionResponse> {
    // Hem aktif hem silinmiş item'ları kontrol et

    let cart: Prisma.CartGetPayload<{ include: { items: true } }> | null = null;

    // cartId varsa, o cart'ı bul
    if (cartId) {
      cart = await this.prisma.cart.findUnique({
        where: { id: cartId },
        include: {
          items: {
            where: {
              productId: item.productId,
              variantId: item.variantId || null,
            },
          },
        },
      });

      // cartId göndermiş ama cart bulunamadı → HATA
      if (!cart) {
        return {
          success: false,
          message: 'Sepet bulunamadı',
          newCart: null,
        };
      }
    } else {
      // cartId yok → yeni cart oluştur
      cart = await this.prisma.cart.create({
        data: {},
        include: {
          items: {
            where: {
              productId: item.productId,
              variantId: item.variantId || null,
            },
          },
        },
      });
    }

    const existingItem = cart.items[0]; // Unique constraint sayesinde max 1 tane olabilir

    await this.prisma.$transaction(async (tx) => {
      if (existingItem) {
        // Silinmiş veya aktif fark etmez, restore et ve quantity artır
        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity:
              (existingItem.deletedAt ? 0 : existingItem.quantity) +
              item.quantity,
            deletedAt: null, // Restore
            isVisible: true,
            visibleCause: null,
            whereAdded: item.whereAdded,
          },
        });
      } else {
        // Hiç yoksa yeni oluştur
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            variantId: item.variantId || null,
            quantity: item.quantity,
            whereAdded: item.whereAdded,
          },
        });
      }
    });

    return this.getCartForContext(cartId);
  }

  async incrementItemQuantity(
    cartId: string,
    itemId: string,
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Ürün bulunamadı', newCart: null };
    }
    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: item.quantity + 1 },
    });
    return this.getCartForContext(cartId);
  }

  async decrementItemQuantity(
    cartId: string,
    itemId: string,
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Ürün bulunamadı', newCart: null };
    }
    if (item.quantity <= 1) {
      await this.prisma.cartItem.update({
        where: {
          id: item.id,
        },
        data: {
          quantity: 0,
          isVisible: false,
          visibleCause: 'DELETED',
          deletedAt: new Date(),
        },
      });
    } else {
      await this.prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: item.quantity - 1 },
      });
    }
    return this.getCartForContext(cartId);
  }
  // CartV2Service içine ekle:

  async removeItemFromCart(
    cartId: string,
    itemId: string,
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }

    const item = cart.items.find((i) => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Ürün bulunamadı', newCart: null };
    }

    await this.prisma.cartItem.update({
      where: { id: item.id },
      data: {
        quantity: 0,
        isVisible: false,
        visibleCause: 'DELETED',
        deletedAt: new Date(),
      },
    });

    return this.getCartForContext(cartId);
  }

  async clearCart(cartId: string): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }

    await this.prisma.cartItem.updateMany({
      where: { cartId: cart.id },
      data: {
        quantity: 0,
        isVisible: false,
        visibleCause: 'DELETED',
        deletedAt: new Date(),
      },
    });

    return this.getCartForContext(cartId);
  }

  async updateOrderNote(
    cartId: string,
    note: string,
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }

    // await this.prisma.cart.update({
    //   where: { id: cart.id },
    //   data: { orderNote: note },
    // });

    return this.getCartForContext(cartId);
  }
}
