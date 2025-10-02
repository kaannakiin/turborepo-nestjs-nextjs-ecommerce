import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/database';
import {
  $Enums,
  AddItemToCartV2,
  AdminCartTableData,
  AdminCartTableSelect,
  CartActionResponse,
  CartContextCartItemType,
  CartContextCartType,
  GetCartByIdReturn,
  GetUserCartInfoForCheckoutReturn,
} from '@repo/types';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShippingService } from 'src/shipping/shipping.service';

@Injectable()
export class CartV2Service {
  constructor(
    private prisma: PrismaService,
    private shippingService: ShippingService,
  ) {}
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

  async getCart(
    cartId: string,
    whereClause: Omit<Prisma.CartWhereUniqueInput, 'id'> = {},
  ): Promise<GetCartByIdReturn | null> {
    if (!cartId) return null;
    let cart: GetCartByIdReturn | null = null;
    if (!cartId && whereClause.userId) {
      cart = await this.prisma.cart.findFirst({
        where: { ...whereClause },
        include: {
          billingAddress: {
            include: {
              city: { select: { id: true, name: true } },
              country: {
                select: {
                  id: true,
                  name: true,
                  emoji: true,
                  translations: true,
                },
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
                select: {
                  id: true,
                  name: true,
                  emoji: true,
                  translations: true,
                },
              },
              state: {
                select: { id: true, name: true },
              },
            },
          },
          items: {
            orderBy: {
              createdAt: 'desc',
            },
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
          user: true,
          cargoRule: true,
        },
      });
    }
    cart = await this.prisma.cart.findUnique({
      where: { id: cartId, ...whereClause },
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
          orderBy: {
            createdAt: 'desc',
          },
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
        user: true,
        cargoRule: true,
      },
    });
    if (!cart) return null;
    return cart as GetCartByIdReturn;
  }

  private async convertCartToContextType(
    cart: GetCartByIdReturn,
    selectedCurrency: $Enums.Currency,
    selectedLocale: $Enums.Locale,
  ): Promise<CartContextCartType['items']> {
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
      await this.updateCartVisibleCause(
        setInVisibleItems,
        setVisibleItems,
      ).catch((error) => {
        console.error('Failed to update cart visibility:', error);
      });
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
    userId: string | null = null,
    selectedCurrency: $Enums.Currency = 'TRY',
    selectedLocale: $Enums.Locale = 'TR',
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId, {
      status: 'ACTIVE',
      ...(userId ? { userId } : {}),
    });

    if (!cart) {
      return { success: false, message: 'Sepet bulunamadı', newCart: null };
    }
    const items = (await this.convertCartToContextType(
      cart,
      selectedCurrency,
      selectedLocale,
    ).then((res) =>
      res.filter((i) => i !== null),
    )) as CartContextCartType['items'];
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
        totalItems: items.length,
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
    userId?: string,
  ): Promise<CartActionResponse> {
    let cart: Prisma.CartGetPayload<{ include: { items: true } }> | null = null;

    if (cartId) {
      cart = await this.prisma.cart.findUnique({
        where: { id: cartId, status: 'ACTIVE' },
        include: {
          user: true,
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
          user: true,
          items: {
            where: {
              productId: item.productId,
              variantId: item.variantId || null,
            },
          },
        },
      });
    }
    if (userId && !cart.userId) {
      cart = await this.prisma.cart.update({
        where: { id: cart.id },
        data: { userId: userId },
        include: {
          user: true,
          items: {
            where: {
              productId: item.productId,
              variantId: item.variantId || null,
            },
          },
        },
      });
    }

    const existingItem = cart.items[0];

    await this.prisma.$transaction(async (tx) => {
      if (existingItem) {
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

    return this.getCartForContext(cartId ? cartId : cart.id);
  }

  async incrementItemQuantity(
    cartId: string,
    itemId: string,
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId, {
      status: 'ACTIVE',
    });
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
    const cart = await this.getCart(cartId, {
      status: 'ACTIVE',
    });
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

  async removeItemFromCart(
    cartId: string,
    itemId: string,
  ): Promise<CartActionResponse> {
    const cart = await this.getCart(cartId, { status: 'ACTIVE' });
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
    const cart = await this.getCart(cartId, {
      status: 'ACTIVE',
    });
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

  async mergeUserCart(
    userId: string,
    cartId: string, // Guest cart ID (localStorage'dan gelen)
  ): Promise<CartActionResponse> {
    if (!userId || !cartId) {
      return {
        success: false,
        message: 'Kullanıcı ID veya Sepet ID eksik',
        newCart: null,
      };
    }

    // Kullanıcının tüm aktif sepetlerini bul (guest cart dahil)
    const userCarts = await this.prisma.cart.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { userId: userId },
          { id: cartId }, // Guest cart'ı da dahil et
        ],
      },
      orderBy: { createdAt: 'desc' },
    });

    // Hiç sepet yoksa
    if (!userCarts || userCarts.length === 0) {
      return {
        success: false,
        message: 'Sepet bulunamadı',
        newCart: null,
      };
    }

    // En yeni sepeti (target cart) belirle
    const targetCart = userCarts[0];

    // Target cart'ın userId'si yoksa ata
    if (!targetCart.userId) {
      await this.prisma.cart.update({
        where: { id: targetCart.id },
        data: { userId: userId },
      });
    }

    // Birleştirilecek diğer sepetler (target cart hariç)
    const cartsToMerge = userCarts.slice(1);

    // Eğer birleştirilecek sepet yoksa, sadece target cart'ı döndür
    if (cartsToMerge.length === 0) {
      return this.getCartForContext(targetCart.id);
    }

    // Tüm sepetleri sırayla target cart'a birleştir
    for (const cart of cartsToMerge) {
      const mergeResult = await this.mergeCarts(targetCart.id, cart.id);

      // Eğer birleştirme başarısız olduysa, hatayı döndür
      if (!mergeResult.success) {
        return mergeResult;
      }
    }

    return this.getCartForContext(targetCart.id);
  }

  /**
   * İki alışveriş sepetini birleştirir. İkinci sepetteki tüm ürünleri birinci sepete ekler ve ikinci merge durumuna günceller .
   *
   * @param firstCartId - Tüm ürünleri alacak sepetin ID'si (bu sepet KALACAK)
   * @param secondCartId - Birleştirilip silinecek sepetin ID'si (bu sepet SİLİNECEK)
   * @param selectedCurrency - Fiyat hesaplamaları için para birimi (varsayılan: 'TRY')
   * @param selectedLocale - Çeviriler için dil (varsayılan: 'TR')
   *
   * @returns Güncellenmiş birinci sepeti içeren CartActionResponse
   *
   * @example
   * // Kullanıcı girişi sonrası guest sepetini user sepetine birleştir
   * const result = await this.mergeCarts(userCartId, guestCartId, 'TRY', 'TR');
   *
   * @remarks
   * **ÖNEMLİ**: Parametre sırası çok önemli!
   * - `firstCartId` → KALACAK ve tüm ürünleri alacak sepet
   * - `secondCartId` → Birleştirildikten sonra SİLİNECEK sepet
   *
   * İşlem Adımları:
   * 1. İkinci sepetteki her ürün için:
   *    - Birinci sepette varsa → miktarı artırır
   *    - Birinci sepette yoksa → yeni ürün olarak ekler
   * 2. İkinci sepetin durumunu 'MERGED' olarak işaretler
   * 3. Güncellenmiş birinci sepeti context formatında döndürür
   *
   * @throws Sepetlerden biri bulunamazsa hata response'u döner
   */
  private async mergeCarts(
    firstCartId: string,
    secondCartId: string,
    selectedCurrency: $Enums.Currency = 'TRY',
    selectedLocale: $Enums.Locale = 'TR',
  ): Promise<CartActionResponse> {
    const firstCart = await this.getCart(firstCartId);
    const secondCart = await this.getCart(secondCartId);

    if (!firstCart) {
      return { success: false, message: 'İlk sepet bulunamadı', newCart: null };
    }
    if (!secondCart) {
      return {
        success: false,
        message: 'İkinci sepet bulunamadı',
        newCart: null,
      };
    }

    await this.prisma.$transaction(
      async (tx) => {
        for (const item of secondCart.items.filter((i) => !i.deletedAt)) {
          const existingItem = firstCart.items.find((i) =>
            item.variantId
              ? i.variantId === item.variantId
              : i.productId === item.productId && i.variantId === null,
          );

          if (existingItem) {
            await tx.cartItem.update({
              where: { id: existingItem.id },
              data: {
                quantity: existingItem.quantity + item.quantity,
                deletedAt: null,
                isVisible: true,
                visibleCause: null,
              },
            });
          } else {
            await tx.cartItem.create({
              data: {
                cartId: firstCart.id,
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                whereAdded: item.whereAdded || 'PRODUCT_PAGE', // Default değer
                isVisible: true,
                visibleCause: null,
                deletedAt: null,
              },
            });
          }
        }

        // İkinci sepeti "MERGED" olarak işaretle ve sil
        await tx.cart.update({
          where: { id: secondCart.id },
          data: { status: 'MERGED' }, // Silinecek sepet merged
        });

        // İlk sepet ACTIVE kalmalı, güncelleme yapma
        // Sadece updatedAt güncellensin (otomatik olacak)
      },
      {
        timeout: 60000 * 10,
      },
    );

    // Güncel sepeti context formatında döndür
    return this.getCartForContext(
      firstCartId,
      null,
      selectedCurrency,
      selectedLocale,
    );
  }

  private convertAdminCartTableData(
    carts: AdminCartTableSelect[],
  ): AdminCartTableData[] {
    return carts.map((cart) => {
      // Önce items'ı filtrele ve hesapla
      const processedItems = cart.items
        .map((item) => {
          if (!item.productId || (item.variantId && !item.variant)) return null;
          const itemTranslation = item.product.translations.find(
            (t) => t.locale === cart.locale,
          );
          if (!itemTranslation) return null;

          if (item.variant && item.variantId) {
            const variantPrice = item.variant.prices.find(
              (p) => p.currency === cart.currency,
            );
            if (!variantPrice) return null;

            return {
              itemId: item.id,
              isDeleted:
                item.deletedAt && item.isVisible === false ? true : false,
              price: variantPrice.price,
              discountedPrice: variantPrice.discountedPrice,
              productId: item.productId,
              quantity: item.quantity,
              variantId: item.variantId,
              whereAdded: item.whereAdded || 'PRODUCT_PAGE',
              visibleCause: item.visibleCause,
              productName: itemTranslation?.name,
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
              productUrl: item.variantId
                ? `/${itemTranslation.slug}?${item.variant.options
                    .map((opt) => {
                      const optTrans =
                        opt.productVariantOption.variantOption.translations.find(
                          (t) => t.locale === cart.locale,
                        ) ||
                        opt.productVariantOption.variantOption.translations[0];
                      const groupTrans =
                        opt.productVariantOption.variantOption.variantGroup.translations.find(
                          (t) => t.locale === cart.locale,
                        ) ||
                        opt.productVariantOption.variantOption.variantGroup
                          .translations[0];
                      return `${groupTrans?.slug}=${optTrans?.slug}`;
                    })
                    .join('&')}`
                : `${itemTranslation.slug}`,
              variantOptions: item.variant.options.map((opt) => {
                const optTrans =
                  opt.productVariantOption.variantOption.translations.find(
                    (t) => t.locale === cart.locale,
                  ) || opt.productVariantOption.variantOption.translations[0];
                const groupTrans =
                  opt.productVariantOption.variantOption.variantGroup.translations.find(
                    (t) => t.locale === cart.locale,
                  ) ||
                  opt.productVariantOption.variantOption.variantGroup
                    .translations[0];
                return {
                  variantGroupName: groupTrans?.name,
                  variantOptionName: optTrans?.name,
                  variantGroupSlug: groupTrans?.slug,
                  variantOptionSlug: optTrans?.slug,
                  variantOptionAsset: opt.productVariantOption.variantOption
                    .asset
                    ? {
                        url: opt.productVariantOption.variantOption.asset.url,
                        type: opt.productVariantOption.variantOption.asset.type,
                      }
                    : null,
                  variantOptionHexValue:
                    opt.productVariantOption.variantOption.hexValue,
                };
              }),
            };
          } else {
            const productPrice = item.product.prices.find(
              (p) => p.currency === cart.currency,
            );
            if (!productPrice) return null;

            return {
              itemId: item.id,
              isDeleted:
                item.deletedAt && item.isVisible === false ? true : false,
              price: productPrice.price,
              productId: item.productId,
              quantity: item.quantity,
              discountedPrice: productPrice.discountedPrice,
              variantId: null,
              whereAdded: item.whereAdded || 'PRODUCT_PAGE',
              visibleCause: item.visibleCause,
              productName: itemTranslation?.name,
              productAsset: item.product.assets[0]?.asset
                ? {
                    url: item.product.assets[0]?.asset.url,
                    type: item.product.assets[0]?.asset.type,
                  }
                : null,
              productUrl: `/${itemTranslation.slug}`,
              variantAsset: null,
              variantOptions: [],
            };
          }
        })
        .filter((item) => item !== null);

      // Hesaplamalar - sadece valid items üzerinden
      const calculatedSubTotal = processedItems.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0);

      const calculatedTotalPrice = processedItems.reduce((sum, item) => {
        const itemPrice = item.discountedPrice ?? item.price;
        return sum + itemPrice * item.quantity;
      }, 0);

      const calculatedTotalDiscount = calculatedSubTotal - calculatedTotalPrice;

      return {
        cartId: cart.id,
        createdAt: cart.createdAt,
        currency: cart.currency,
        locale: cart.locale,
        status: cart.status as $Enums.CartStatus,
        totalItems: processedItems.length,
        updatedAt: cart.updatedAt,
        user: cart.user
          ? {
              email: cart.user.email,
              name: cart.user.name,
              surname: cart.user.surname,
            }
          : null,
        taxTotal: 0, // Tax hesaplaması şimdilik boş
        subTotalPrice: calculatedSubTotal,
        totalDiscount: calculatedTotalDiscount,
        totalPrice: calculatedTotalPrice,
        orderNote: null,
        items: processedItems,
      };
    });
  }

  async getAdminCartList({
    status,
    endDate,
    search,
    startDate,
    page,
  }: {
    status: $Enums.CartStatus | null;
    search: string | null;
    startDate: Date | null;
    endDate: Date | null;
    page: number;
  }): Promise<{
    carts: AdminCartTableData[];
    success: boolean;
    message: string;
    pagination?: {
      totalItems: number;
      totalPages: number;
      currentPage: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const take = 10;
    const skip = (page - 1) * take;

    const cartWhere: Prisma.CartWhereInput = {
      ...(status && { status }),
      ...(search && {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && {
            lte: (() => {
              const endOfDay = new Date(endDate);
              endOfDay.setHours(23, 59, 59, 999);
              return endOfDay;
            })(),
          }),
        },
      }),
    };
    const carts = await this.prisma.cart.findMany({
      where: cartWhere,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: true,
        items: {
          orderBy: {
            createdAt: 'desc',
          },
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
      },
    });
    const cartCount = await this.prisma.cart.count({
      where: cartWhere,
    });
    if (carts.length === 0) {
      return {
        carts: [],
        message: 'Sepet bulunamadı',
        success: true,
      };
    }
    return {
      carts: this.convertAdminCartTableData(carts),
      message: 'Sepetler başarıyla getirildi',
      success: true,
      pagination: {
        totalItems: cartCount,
        totalPages: Math.ceil(cartCount / take),
        currentPage: page,
        itemsPerPage: take,
        hasNextPage: page * take < cartCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateCartAddress(cartId: string, addressId: string) {
    if (!cartId || !addressId) {
      throw new BadRequestException('Sepet ID veya Adres ID eksik');
    }

    const cart = await this.prisma.cart.findUnique({
      where: {
        id: cartId,
        status: 'ACTIVE',
      },
      include: {
        billingAddress: true,
        shippingAddress: true,
      },
    });

    if (!cart) {
      throw new NotFoundException('Sepet bulunamadı');
    }

    const address = await this.prisma.addressSchema.findUnique({
      where: {
        id: addressId,
      },
    });
    if (!address) {
      throw new NotFoundException('Adres bulunamadı');
    }

    if (cart.userId !== address.userId || !cart.userId) {
      throw new BadRequestException(
        'Bilinmeyen bir hata oluştu. Lütfen tekrar deneyiniz.',
      );
    }

    if (
      cart.shippingAddressId === addressId &&
      cart.billingAddressId === addressId
    ) {
      return {
        success: true,
        message: 'Adres başarıyla güncellendi',
      };
    }
    if (cart.shippingAddressId !== addressId) {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          shippingAddress: { connect: { id: addressId } },
          billingAddress: { connect: { id: addressId } },
          user: {
            update: {
              defaultAddressId: addressId,
            },
          },
        },
      });
      return {
        success: true,
        message: 'Adres başarıyla güncellendi',
      };
    }
  }

  async getUserCartInfoForCheckout(
    cartId: string,
    userId: string,
  ): Promise<GetUserCartInfoForCheckoutReturn> {
    const cart = await this.getCart(cartId, { status: 'ACTIVE', userId });
    if (!cart) {
      throw new NotFoundException('Sepet bulunamadı');
    }

    if (!cart.userId || cart.userId !== userId) {
      throw new BadRequestException('Sepet bir kullanıcıya ait değil');
    }

    const items = await this.convertCartToContextType(cart, 'TRY', 'TR');

    return {
      ...cart,
      items: items.filter((i) => i !== null) as CartContextCartType['items'],
    };
  }
  async setCartCargoRule(cartId: string, cargoRuleId: string) {
    const cargoRule = await this.prisma.cargoRule.findUnique({
      where: { id: cargoRuleId },
    });
    if (!cargoRule) {
      throw new NotFoundException('Kargo kuralı bulunamadı');
    }
    const getAvailableCargoRules =
      await this.shippingService.getAvailableShippingMethods(cartId);

    if (!getAvailableCargoRules.success) {
      throw new BadRequestException(getAvailableCargoRules.message);
    }
    if (
      !getAvailableCargoRules.shippingMethods.rules.find(
        (c) => c.id === cargoRuleId,
      )
    ) {
      throw new BadRequestException('Kargo kuralı sepete uygulanamaz');
    }
    await this.prisma.cart.update({
      where: { id: cartId },
      data: { cargoRuleId },
    });
    return {
      success: true,
      message: 'Kargo kuralı başarıyla güncellendi',
    };
  }
}
