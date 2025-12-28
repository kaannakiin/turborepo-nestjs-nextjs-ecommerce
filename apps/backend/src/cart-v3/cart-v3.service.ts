import { Injectable, Logger } from '@nestjs/common';
import { $Enums, User } from '@repo/database';
import {
  getActorTypeLabel,
  getCartActivityLabel,
  getCartStatusLogLabel,
  getDefaultCurrencyForLocale,
  getWhereAddedMessageLabel,
} from '@repo/shared';
import {
  AddCartReqBodyV3Type,
  addressSelectForCart,
  cargoRuleSelectForCart,
  CartActionResponse,
  CartForPayment,
  CartItemForPayment,
  cartItemIncludeForCart,
  CartItemV3,
  CartItemWithPrices,
  CartV3,
  CartWithRelationForCheckoutPage,
  CartWithRelations,
  DecraseOrIncreaseCartItemReqBodyV3Type,
  GetCartClientCheckoutReturnType,
  GetCartForPaymentIncludeCartType,
  GetCartForPaymentReturnType,
  NonAuthUserAddressZodType,
  productAssetSelect,
  productPriceSelect,
  productVariantOptionsSelect,
  TURKEY_DB_ID,
} from '@repo/types';
import { LocaleService } from 'src/common/services/locale/locale.service';
import { PrismaLoggerService } from 'src/prisma-logger/prisma-logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ShippingService } from 'src/shipping/shipping.service';

@Injectable()
export class CartV3Service {
  private readonly logger = new Logger(CartV3Service.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly shippingService: ShippingService,
    private readonly localeService: LocaleService,
    private readonly prismaLoggerService: PrismaLoggerService,
  ) {}

  // async updateCartAddress(
  //   cartId: string,
  //   addressId: string,
  //   userId: string | null,
  // ): Promise<{
  //   success: boolean;
  //   message: string;
  // }> {
  //   const cart = await this.prismaService.cart.findUnique({
  //     where: {
  //       id: cartId,
  //     },
  //   });

  //   if (!cart) {
  //     return { success: false, message: 'Sepet bulunamadı' };
  //   }

  //   const address = await this.prismaService.addressSchema.findUnique({
  //     where: {
  //       id: addressId,
  //     },
  //   });

  //   if (!address) {
  //     return { success: false, message: 'Adres bulunamadı' };
  //   }

  //   if (userId && address.userId !== userId) {
  //     return {
  //       success: false,
  //       message: 'Bu adres size ait değil',
  //     };
  //   }

  //   if (!userId && address.userId) {
  //     return {
  //       success: false,
  //       message: 'Bu adres kullanılamaz',
  //     };
  //   }

  //   await this.prismaService.$transaction(async (prisma) => {
  //     await prisma.cart.update({
  //       where: { id: cart.id },
  //       data: {
  //         shippingAddressId: address.id,
  //       },
  //     });

  //     if (userId) {
  //       await prisma.user.update({
  //         where: { id: userId },
  //         data: {
  //           defaultAddressId: address.id,
  //         },
  //       });
  //     }
  //   });

  //   return {
  //     success: true,
  //     message: 'Adres başarıyla güncellendi',
  //   };
  // }

  // async setNonAuthUserAddressToCart(
  //   cartId: string,
  //   data: NonAuthUserAddressZodType,
  // ): Promise<{
  //   success: boolean;
  //   message: string;
  // }> {
  //   try {
  //     await this.prismaService.$transaction(async (prisma) => {
  //       const cart = await prisma.cart.findUnique({
  //         where: { id: cartId },
  //       });

  //       if (!cart) {
  //         throw new Error('Sepet bulunamadı.');
  //       }

  //       const addressData = {
  //         name: data.name,
  //         surname: data.surname,
  //         phone: data.phone,
  //         email: data.email,
  //         addressLine1: data.addressLine1,
  //         addressLine2: data.addressLine2 || null,
  //         zipCode: data.postalCode,
  //         addressLocationType: data.addressType,
  //         tcKimlikNo: data.tcKimlikNo || null,
  //         ...(data.addressType === 'CITY' &&
  //         data.countryId === TURKEY_DB_ID &&
  //         data.districtId
  //           ? {
  //               cityId: data.cityId,
  //               stateId: null,
  //               districtId: data.districtId,
  //             }
  //           : data.addressType === 'CITY'
  //             ? {
  //                 cityId: data.cityId,
  //                 stateId: null,
  //                 districtId: null,
  //               }
  //             : data.addressType === 'STATE'
  //               ? {
  //                   stateId: data.stateId,
  //                   cityId: null,
  //                   districtId: null,
  //                 }
  //               : {}),
  //         countryId: data.countryId,
  //       };

  //       if (cart.shippingAddressId) {
  //         await prisma.addressSchema.update({
  //           where: { id: cart.shippingAddressId },
  //           data: addressData,
  //         });
  //       } else {
  //         const newAddress = await prisma.addressSchema.create({
  //           data: addressData,
  //         });

  //         await prisma.cart.update({
  //           where: { id: cartId },
  //           data: { shippingAddressId: newAddress.id },
  //         });
  //       }
  //     });

  //     return {
  //       success: true,
  //       message: 'Adres başarıyla kaydedildi.',
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message || 'Bir hata oluştu.',
  //     };
  //   }
  // }

  // async setCartCargoRule(
  //   cartId: string,
  //   cargoRuleId: string,
  // ): Promise<{
  //   success: boolean;
  //   message: string;
  // }> {
  //   const availableMethos =
  //     await this.shippingService.getAvailableShippingMethods(cartId);

  //   if (!availableMethos.success) {
  //     return {
  //       success: false,
  //       message: 'Gönderim yöntemleri alınamadı',
  //     };
  //   }
  //   const isCargoRuleValid = availableMethos.shippingMethods.rules.find(
  //     (method) => method.id === cargoRuleId,
  //   );
  //   if (!isCargoRuleValid) {
  //     return {
  //       success: false,
  //       message: 'Geçersiz kargo kuralı',
  //     };
  //   }
  //   await this.prismaService.cart.update({
  //     where: { id: cartId },
  //     data: { cargoRuleId },
  //   });
  //   return {
  //     success: true,
  //     message: 'Kargo kuralı başarıyla güncellendi',
  //   };
  // }

  // calculateCartItemDiscountAndPrice(
  //   cartItems: CartItemWithPrices[],
  //   currency: $Enums.Currency = 'TRY',
  // ): { subtotal: number; totalDiscount: number } {
  //   let subtotal = 0;
  //   let totalDiscount = 0;

  //   for (const item of cartItems) {
  //     const prices = item.variant?.prices || item.product?.prices;

  //     if (!prices || prices.length === 0) {
  //       continue;
  //     }

  //     const priceObj = prices.find((p) => p.currency === currency);

  //     if (priceObj) {
  //       subtotal += priceObj.price * item.quantity;

  //       if (priceObj.discountedPrice && priceObj.discountedPrice > 0) {
  //         const discountPerItem = priceObj.price - priceObj.discountedPrice;

  //         if (discountPerItem > 0) {
  //           totalDiscount += discountPerItem * item.quantity;
  //         }
  //       }
  //     }
  //   }

  //   return { subtotal, totalDiscount };
  // }

  // async createCartPaymentAttempt(
  //   cartId: string,
  //   result: boolean,
  //   message: string,
  // ) {
  //   return this.prismaService.cartPaymentCheckAttempts.create({
  //     data: {
  //       cartId,
  //       isSuccess: result,
  //       message,
  //     },
  //   });
  // }

  // async getCartForPayment(
  //   cartId: string,
  // ): Promise<GetCartForPaymentReturnType> {
  //   try {
  //     const cart = (await this.prismaService.cart.findUnique({
  //       where: { id: cartId },
  //       include: GetCartForPaymentIncludeCartType as any,
  //     })) as unknown as CartForPayment;

  //     if (!cart) {
  //       await this.createCartPaymentAttempt(cartId, false, 'Sepet bulunamadı');
  //       return { success: false, message: 'Sepet bulunamadı' };
  //     }
  //     if (!cart.items || cart.items.length === 0) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Sepette ödeme için uygun ürün bulunamadı',
  //       );
  //       return {
  //         success: false,
  //         message: 'Sepette ödeme için uygun ürün bulunamadı',
  //       };
  //     }
  //     if (cart.orderAttempts && cart.orderAttempts.length > 0) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Bu sepet için zaten ödeme yapılmış veya kısmi ödeme yapılmış bir sipariş bulunmaktadır.',
  //       );
  //       return {
  //         success: false,
  //         message:
  //           'Bu sepet için zaten ödeme yapılmış veya kısmi ödeme yapılmış bir sipariş bulunmaktadır.',
  //       };
  //     }
  //     if (!cart.shippingAddress || !cart.shippingAddressId) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Kullanıcı gönderim adresi eklememiş',
  //       );
  //       return {
  //         success: false,
  //         message: 'Lütfen gönderim adresi ekleyin',
  //       };
  //     }
  //     if (!cart.cargoRuleId || !cart.cargoRule) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Kullanıcı gönderim yöntemi seçmemiş',
  //       );
  //       return {
  //         success: false,
  //         message: 'Lütfen gönderim yöntemi seçin',
  //       };
  //     }

  //     for (const item of cart.items as CartItemForPayment[]) {
  //       const stock = item.variant ? item.variant.stock : item.product.stock;
  //       if (stock < item.quantity) {
  //         const productName =
  //           item.product.translations.find((t) => t.locale === cart.locale)
  //             ?.name || 'İlgili Ürün';
  //         const errorMessage = `Stokta yeterli ürün yok: "${productName}". (Sepetinizde ${item.quantity} adet var, stokta ${stock} adet kaldı.)`;
  //         await this.createCartPaymentAttempt(cartId, false, errorMessage);
  //         return {
  //           success: false,
  //           message:
  //             'Bu işlemi şu anda gerçekleştiremiyoruz. Lütfen daha sonra tekrar deneyin.',
  //         };
  //       }
  //     }

  //     const { subtotal: itemsTotalPrice, totalDiscount: itemsTotalDiscount } =
  //       this.calculateCartItemDiscountAndPrice(
  //         cart.items.map((item: CartItemForPayment) => ({
  //           product: item.product,
  //           quantity: item.quantity,
  //           variant: item.variant || undefined,
  //         })),
  //         cart.currency,
  //       );

  //     const cartLevelDiscount = 0;

  //     const itemsTotalAfterAllDiscounts =
  //       itemsTotalPrice - itemsTotalDiscount - cartLevelDiscount;

  //     const matchingZone = await this.shippingService.findMatchingCargoZone(
  //       cart.shippingAddress.countryId,
  //       cart.shippingAddress.addressLocationType === 'STATE'
  //         ? cart.shippingAddress.stateId
  //         : null,
  //       cart.shippingAddress.addressLocationType === 'CITY'
  //         ? cart.shippingAddress.cityId
  //         : null,
  //       cart.currency,
  //       itemsTotalAfterAllDiscounts,
  //     );

  //     if (!matchingZone) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Bu adres için kargo hizmeti bulunmuyor.',
  //       );
  //       return {
  //         success: false,
  //         message: 'Bu adres için kargo hizmeti bulunmuyor.',
  //       };
  //     }

  //     if (matchingZone.rules.length === 0) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Bu sepet tutarı için uygun kargo seçeneği bulunmuyor.',
  //       );
  //       return {
  //         success: false,
  //         message: 'Bu sepet tutarı için uygun kargo seçeneği bulunmuyor.',
  //       };
  //     }

  //     const isSelectedRuleStillValid = matchingZone.rules.some(
  //       (rule) => rule.id === cart.cargoRuleId,
  //     );

  //     if (!isSelectedRuleStillValid) {
  //       await this.createCartPaymentAttempt(
  //         cartId,
  //         false,
  //         'Seçilen kargo yöntemi, adres veya sepet tutarındaki değişiklik nedeniyle artık geçerli değil. Lütfen kargo seçeneklerini güncelleyin.',
  //       );
  //       return {
  //         success: false,
  //         message:
  //           'Seçilen kargo yöntemi, adres veya sepet tutarındaki değişiklik nedeniyle artık geçerli değil. Lütfen kargo seçeneklerini güncelleyin.',
  //       };
  //     }

  //     const finalShippingCost = cart.cargoRule.price;

  //     const finalTotalPrice = itemsTotalPrice;

  //     const finalDiscountAmount = itemsTotalDiscount + cartLevelDiscount;

  //     const finalGrandTotal = itemsTotalAfterAllDiscounts + finalShippingCost;

  //     return {
  //       success: true,
  //       message: 'Sepet başarıyla alındı',
  //       data: {
  //         cart,

  //         totalPrice: finalTotalPrice,
  //         discountAmount: finalDiscountAmount,
  //         shippingCost: finalShippingCost,
  //         totalFinalPrice: finalGrandTotal,
  //       },
  //     };
  //   } catch (error) {
  //     console.error('Error fetching cart for payment:', error);
  //     const errorMessage =
  //       error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
  //     await this.createCartPaymentAttempt(cartId, false, errorMessage);
  //     return {
  //       success: false,
  //       message: 'Sepet alınırken bir hata oluştu',
  //     };
  //   }
  // }

  // async getCartForClientCheckout(
  //   cartId: string,
  // ): Promise<GetCartClientCheckoutReturnType> {
  //   const cart = await this.prismaService.cart.findUnique({
  //     where: {
  //       id: cartId,
  //     },
  //     include: {
  //       items: cartItemIncludeForCart,
  //       billingAddress: addressSelectForCart,
  //       shippingAddress: addressSelectForCart,
  //       cargoRule: cargoRuleSelectForCart,
  //       user: true,
  //     },
  //   });

  //   if (!cart) {
  //     return {
  //       success: false,
  //     };
  //   }
  //   const mapCartResult = this.convertDbCartToCheckoutClientCart(cart);
  //   if (!mapCartResult.success) {
  //     return {
  //       success: false,
  //       message: mapCartResult.message,
  //     };
  //   }
  //   return { success: true, cart: mapCartResult.newCart! };
  // }

  // private mapDbItemsToClientCartItems(
  //   dbCartItems: CartWithRelations['items'],
  //   locale: $Enums.Locale,
  //   currency: $Enums.Currency,
  // ): {
  //   items: CartItemV3[];
  //   totalDiscount: number;
  //   totalPrice: number;
  // } {
  //   const initialState = {
  //     items: [] as CartItemV3[],
  //     totalDiscount: 0,
  //     totalPrice: 0,
  //   };

  //   if (!dbCartItems || dbCartItems.length === 0) {
  //     return initialState;
  //   }

  //   return dbCartItems.reduce((acc, dbCartItem) => {
  //     const source = dbCartItem.variant ?? dbCartItem.product;
  //     const prices = source.prices.find((p) => p.currency === currency);
  //     const productTranslation = dbCartItem.product.translations.find(
  //       (t) => t.locale === locale,
  //     );

  //     if (!prices || !productTranslation) {
  //       console.warn(
  //         `Sepet item'ı atlandı: Fiyat veya çeviri bulunamadı. ProductId: ${dbCartItem.productId}`,
  //       );
  //       return acc;
  //     }

  //     const quantity = dbCartItem.quantity;
  //     const originalPrice = prices.price;
  //     const finalPrice = prices.discountedPrice ?? originalPrice;

  //     const itemNetTotal = finalPrice * quantity;
  //     const itemGrossTotal = originalPrice * quantity;
  //     const itemDiscountTotal = itemGrossTotal - itemNetTotal;

  //     acc.totalPrice += itemNetTotal;
  //     acc.totalDiscount += itemDiscountTotal;

  //     const assetObj =
  //       dbCartItem.variant?.assets[0]?.asset ??
  //       dbCartItem.product.assets[0]?.asset;

  //     const asset: CartItemV3['productAsset'] = assetObj
  //       ? { type: assetObj.type, url: assetObj.url }
  //       : undefined;

  //     let productSlug = productTranslation.slug;
  //     const searchParams = new URLSearchParams();
  //     const variantOptions: CartItemV3['variantOptions'] = [];

  //     if (dbCartItem.variant && dbCartItem.variantId) {
  //       dbCartItem.variant.options.forEach((opt) => {
  //         const optionTranslation =
  //           opt.productVariantOption.variantOption.translations.find(
  //             (t) => t.locale === locale,
  //           );
  //         const variantGroupTranslation =
  //           opt.productVariantOption.variantOption.variantGroup.translations.find(
  //             (t) => t.locale === locale,
  //           );

  //         if (!variantGroupTranslation || !optionTranslation) return;

  //         variantOptions.push({
  //           variantGroupName: variantGroupTranslation.name,
  //           variantGroupSlug: variantGroupTranslation.slug,
  //           variantOptionName: optionTranslation.name,
  //           variantOptionSlug: optionTranslation.slug,
  //           variantOptionAsset:
  //             opt.productVariantOption.variantOption.asset ?? undefined,
  //           variantOptionHexValue:
  //             opt.productVariantOption.variantOption.hexValue ?? undefined,
  //         });

  //         searchParams.append(
  //           variantGroupTranslation.slug,
  //           optionTranslation.slug,
  //         );
  //       });
  //     }

  //     if (searchParams.toString()) {
  //       productSlug += `?${searchParams.toString()}`;
  //     }

  //     const clientItem: CartItemV3 = {
  //       price: prices.price,
  //       discountedPrice: prices.discountedPrice ?? undefined,
  //       productId: dbCartItem.productId!,
  //       variantId: dbCartItem.variantId ?? undefined,
  //       quantity: dbCartItem.quantity,
  //       productName: productTranslation.name,
  //       whereAdded: dbCartItem.whereAdded,
  //       productAsset: asset,
  //       productSlug,
  //       variantOptions,
  //     };

  //     acc.items.push(clientItem);

  //     return acc;
  //   }, initialState);
  // }

  // private convertDbCartToCheckoutClientCart(
  //   cart: CartWithRelationForCheckoutPage,
  // ): {
  //   success: boolean;
  //   message: string;
  //   newCart?: GetCartClientCheckoutReturnType['cart'];
  // } {
  //   try {
  //     const baseCart = this.convertDbCartToClientCart(cart);

  //     const cartForClientCheckout: GetCartClientCheckoutReturnType['cart'] = {
  //       ...baseCart,
  //       billingAddress: cart.billingAddress || null,
  //       shippingAddress: cart.shippingAddress || null,
  //       cargoRule: cart.cargoRule || null,
  //       user: cart.user || null,
  //     };
  //     return {
  //       success: true,
  //       message: 'Cart mapped successfully',
  //       newCart: cartForClientCheckout,
  //     };
  //   } catch (error) {
  //     console.error('Error mapping DB cart to client cart:', error);
  //     return {
  //       success: false,
  //       message: 'Error mapping DB cart to client cart',
  //     };
  //   }
  // }

  // private convertDbCartToClientCart(cart: CartWithRelations): CartV3 {
  //   const { items, totalDiscount, totalPrice } =
  //     this.mapDbItemsToClientCartItems(cart.items, cart.locale, cart.currency);
  //   const totalItems = items.length;

  //   return {
  //     items,
  //     totalItems,
  //     cartId: cart.id,
  //     totalPrice,
  //     createdAt: cart.createdAt,
  //     currency: cart.currency,
  //     lastActivityAt: cart.updatedAt,
  //     locale: cart.locale,
  //     totalDiscount,
  //     updatedAt: cart.updatedAt,
  //     orderNote: undefined,
  //     userId: cart.userId || undefined,
  //   };
  // }

  // private getProduct({
  //   productId,
  //   variantId,
  // }: {
  //   productId: string;
  //   variantId?: string;
  // }) {
  //   return this.prismaService.product.findUnique({
  //     where: {
  //       id: productId,
  //     },
  //     include: {
  //       assets: productAssetSelect,
  //       prices: productPriceSelect,
  //       translations: true,
  //       ...(variantId
  //         ? {
  //             variantCombinations: {
  //               where: {
  //                 id: variantId,
  //               },
  //               include: {
  //                 assets: productAssetSelect,
  //                 prices: productPriceSelect,
  //                 translations: true,
  //                 options: productVariantOptionsSelect,
  //               },
  //             },
  //           }
  //         : {}),
  //     },
  //   });
  // }

  // async getCartForMainClient(
  //   cartId: string,
  //   user: User | null,
  // ): Promise<{ success: boolean; cart?: CartV3 }> {
  //   const cart = await this.prismaService.cart.findFirst({
  //     where: {
  //       status: 'ACTIVE',
  //       id: cartId,
  //       ...(user ? { userId: user.id } : {}),
  //     },
  //     orderBy: {
  //       createdAt: 'desc',
  //     },
  //     include: {
  //       items: cartItemIncludeForCart,
  //     },
  //   });
  //   if (!cart) {
  //     return {
  //       success: false,
  //     };
  //   }

  //   return {
  //     success: true,
  //     cart: this.convertDbCartToClientCart(cart),
  //   };
  // }

  // async addItemToCart(
  //   data: AddCartReqBodyV3Type,
  //   user: User | null,
  // ): Promise<CartActionResponse> {
  //   try {
  //     const { productId, whereAdded, cartId, variantId } = data;

  //     const locale = this.localeService.getLocale();

  //     const product = await this.getProduct({ productId, variantId });

  //     if (!product || (variantId && product.variantCombinations.length === 0)) {
  //       return {
  //         success: false,
  //         message: 'Sepete eklemek istediğiniz ürün bulunamadı.',
  //       };
  //     }

  //     if (!cartId) {
  //       const newCart = await this.prismaService.cart.create({
  //         data: {
  //           userId: user ? user.id : null,
  //           locale,
  //           currency: 'TRY',
  //           status: 'ACTIVE',
  //           items: {
  //             create: {
  //               variantId: variantId || null,
  //               productId: productId,
  //               quantity: 1,
  //               whereAdded,
  //               isVisible: true,
  //             },
  //           },
  //         },
  //         include: {
  //           items: cartItemIncludeForCart,
  //         },
  //       });

  //       this.createLog({
  //         cartId: newCart.id,
  //         locale: newCart.locale,
  //         activityType: 'CART_CREATED',
  //         actorType: 'USER',
  //         actorId: user ? user.id : null,
  //       });

  //       const newItem = newCart.items[0];
  //       this.createLog({
  //         cartId: newCart.id,
  //         locale: newCart.locale,
  //         activityType: 'ITEM_ADDED',
  //         actorType: 'USER',
  //         actorId: user ? user.id : null,
  //         item: newItem,
  //         newQty: newItem.quantity,
  //         whereAdded: whereAdded,
  //       });

  //       return {
  //         success: true,
  //         message: 'Ürün başarıyla sepete eklendi.',
  //         newCart: this.convertDbCartToClientCart(newCart),
  //       };
  //     }

  //     const cart = await this.prismaService.cart.findUnique({
  //       where: { id: cartId, ...(user && { userId: user.id }) },
  //     });

  //     const existingCartItem = await this.prismaService.cartItem.findUnique({
  //       where: {
  //         cartId_productId_variantId: {
  //           cartId: cart.id,
  //           productId: productId,
  //           variantId: variantId || '',
  //         },
  //       },
  //     });

  //     const newCart = await this.prismaService.cart.update({
  //       where: {
  //         id: cart.id,
  //         ...(user ? { userId: user.id } : {}),
  //       },
  //       data: {
  //         items: {
  //           upsert: {
  //             where: {
  //               cartId_productId_variantId: {
  //                 cartId: cart.id,
  //                 productId: productId,
  //                 variantId: variantId || '',
  //               },
  //             },
  //             create: {
  //               productId: productId,
  //               variantId: variantId || null,
  //               quantity: 1,
  //               whereAdded: whereAdded,
  //               isVisible: true,
  //             },
  //             update: {
  //               isVisible: true,
  //               deletedAt: null,
  //               visibleCause: null,
  //               quantity: {
  //                 increment: 1,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         items: cartItemIncludeForCart,
  //       },
  //     });
  //     const updatedItem = newCart.items.find(
  //       (i) => i.productId === productId && i.variantId === (variantId || null),
  //     );

  //     if (updatedItem) {
  //       this.createLog({
  //         cartId: newCart.id,
  //         locale: newCart.locale,
  //         activityType: existingCartItem
  //           ? 'ITEM_QUANTITY_CHANGED'
  //           : 'ITEM_ADDED',
  //         actorType: 'USER',
  //         actorId: user ? user.id : null,
  //         item: updatedItem,
  //         oldQty: existingCartItem?.quantity,
  //         newQty: updatedItem.quantity,
  //         whereAdded: existingCartItem ? undefined : whereAdded,
  //       });
  //     }

  //     return {
  //       success: true,
  //       message: 'Ürün başarıyla sepete eklendi.',
  //       newCart: this.convertDbCartToClientCart(newCart),
  //     };
  //   } catch (error) {
  //     console.error('Error in newAddItemToCart:', error);
  //     return {
  //       success: false,
  //       message: 'Sepete ürün eklenirken bir hata oluştu.',
  //     };
  //   }
  // }

  // async increaseCartItemQuantity(
  //   data: DecraseOrIncreaseCartItemReqBodyV3Type,
  //   user: User | null,
  // ): Promise<CartActionResponse> {
  //   try {
  //     const { cartId, productId, variantId } = data;

  //     const existingItem = await this.prismaService.cartItem.findUnique({
  //       where: {
  //         cartId_productId_variantId: {
  //           cartId: cartId,
  //           productId: productId,
  //           variantId: variantId || '',
  //         },

  //         ...(user ? { cart: { userId: user.id } } : {}),
  //       },
  //     });

  //     if (!existingItem) {
  //       return {
  //         success: false,
  //         message: 'Sepet ürünü bulunamadı veya size ait değil.',
  //       };
  //     }

  //     const newCart = await this.prismaService.cart.update({
  //       where: {
  //         id: cartId,
  //       },
  //       data: {
  //         items: {
  //           update: {
  //             where: {
  //               id: existingItem.id,
  //             },
  //             data: {
  //               quantity: {
  //                 increment: 1,
  //               },
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         items: cartItemIncludeForCart,
  //       },
  //     });

  //     const updatedItem = newCart.items.find((i) => i.id === existingItem.id);

  //     if (updatedItem) {
  //       this.createLog({
  //         cartId: newCart.id,
  //         locale: newCart.locale,
  //         activityType: 'ITEM_QUANTITY_CHANGED',
  //         actorType: 'USER',
  //         actorId: user ? user.id : null,
  //         item: updatedItem,
  //         oldQty: existingItem.quantity,
  //         newQty: updatedItem.quantity,
  //       });
  //     }

  //     return {
  //       success: true,
  //       message: 'Ürün miktarı artırıldı.',
  //       newCart: this.convertDbCartToClientCart(newCart),
  //     };
  //   } catch (error) {
  //     console.error('Error in increaseCartItemQuantity:', error);
  //     return {
  //       success: false,
  //       message: 'Sepet ürünü miktarı artırılırken bir hata oluştu.',
  //     };
  //   }
  // }

  // async decreaseCartItemQuantity(
  //   data: DecraseOrIncreaseCartItemReqBodyV3Type,
  //   user: User | null,
  // ): Promise<CartActionResponse> {
  //   try {
  //     const { cartId, productId, variantId } = data;

  //     const existingItem = await this.prismaService.cartItem.findUnique({
  //       where: {
  //         cartId_productId_variantId: {
  //           cartId: cartId,
  //           productId: productId,
  //           variantId: variantId || '',
  //         },
  //         ...(user ? { cart: { userId: user.id } } : {}),
  //       },

  //       include: cartItemIncludeForCart.include,
  //     });

  //     if (!existingItem) {
  //       return {
  //         success: false,
  //         message: 'Sepet ürünü bulunamadı veya size ait değil.',
  //       };
  //     }

  //     let newCart: CartWithRelations;

  //     if (existingItem.quantity > 1) {
  //       newCart = await this.prismaService.cart.update({
  //         where: { id: cartId },
  //         data: {
  //           items: {
  //             update: {
  //               where: { id: existingItem.id },
  //               data: {
  //                 quantity: {
  //                   decrement: 1,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         include: {
  //           items: cartItemIncludeForCart,
  //         },
  //       });

  //       const updatedItem = newCart.items.find((i) => i.id === existingItem.id);
  //       this.createLog({
  //         cartId: newCart.id,
  //         locale: newCart.locale,
  //         activityType: 'ITEM_QUANTITY_CHANGED',
  //         actorType: 'USER',
  //         actorId: user ? user.id : null,
  //         item: updatedItem || existingItem,
  //         oldQty: existingItem.quantity,
  //         newQty: updatedItem?.quantity || existingItem.quantity - 1,
  //       });
  //     } else {
  //       newCart = await this.prismaService.cart.update({
  //         where: { id: cartId },
  //         data: {
  //           items: {
  //             update: {
  //               where: { id: existingItem.id },
  //               data: {
  //                 quantity: 0,
  //                 isVisible: false,
  //                 deletedAt: new Date(),
  //                 visibleCause: 'DELETED_BY_USER',
  //               },
  //             },
  //           },
  //         },
  //         include: {
  //           items: cartItemIncludeForCart,
  //         },
  //       });

  //       this.createLog({
  //         cartId: newCart.id,
  //         locale: newCart.locale,
  //         activityType: 'ITEM_REMOVED',
  //         actorType: 'USER',
  //         actorId: user ? user.id : null,
  //         item: existingItem,
  //         oldQty: existingItem.quantity,
  //       });
  //     }

  //     return {
  //       success: true,
  //       message: 'Sepet güncellendi.',
  //       newCart: this.convertDbCartToClientCart(newCart),
  //     };
  //   } catch (error) {
  //     console.error('Error in decreaseCartItemQuantity:', error);
  //     return {
  //       success: false,
  //       message: 'Sepet ürünü miktarı azaltılırken bir hata oluştu.',
  //     };
  //   }
  // }

  // async removeItemFromCart(
  //   data: DecraseOrIncreaseCartItemReqBodyV3Type,
  //   user: User | null,
  // ): Promise<CartActionResponse> {
  //   try {
  //     const { cartId, productId, variantId } = data;

  //     const existingItem = await this.prismaService.cartItem.findUnique({
  //       where: {
  //         cartId_productId_variantId: {
  //           cartId: cartId,
  //           productId: productId,
  //           variantId: variantId || '',
  //         },
  //         ...(user ? { cart: { userId: user.id } } : {}),
  //       },

  //       include: cartItemIncludeForCart.include,
  //     });

  //     if (!existingItem) {
  //       return {
  //         success: false,
  //         message: 'Sepet ürünü bulunamadı veya size ait değil.',
  //       };
  //     }

  //     const newCart = await this.prismaService.cart.update({
  //       where: {
  //         id: cartId,
  //       },
  //       data: {
  //         items: {
  //           update: {
  //             where: { id: existingItem.id },
  //             data: {
  //               quantity: 0,
  //               isVisible: false,
  //               deletedAt: new Date(),
  //               visibleCause: 'DELETED_BY_USER',
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         items: cartItemIncludeForCart,
  //       },
  //     });

  //     this.createLog({
  //       cartId: newCart.id,
  //       locale: newCart.locale,
  //       activityType: 'ITEM_REMOVED',
  //       actorType: 'USER',
  //       actorId: user ? user.id : null,
  //       item: existingItem,
  //       oldQty: existingItem.quantity,
  //     });

  //     return {
  //       success: true,
  //       message: 'Ürün sepetten kaldırıldı.',
  //       newCart: this.convertDbCartToClientCart(newCart),
  //     };
  //   } catch (error) {
  //     console.error('Error in removeItemFromCart:', error);
  //     return {
  //       success: false,
  //       message: 'Sepet ürünü kaldırılırken bir hata oluştu.',
  //     };
  //   }
  // }

  // async clearCart(cartId: string): Promise<CartActionResponse> {
  //   try {
  //     const clearedCart = await this.prismaService.cart.update({
  //       where: {
  //         id: cartId,
  //       },
  //       data: {
  //         items: {
  //           updateMany: {
  //             where: { cartId },
  //             data: {
  //               quantity: 0,
  //               isVisible: false,
  //               deletedAt: new Date(),
  //               visibleCause: 'DELETED_BY_USER',
  //             },
  //           },
  //         },
  //       },
  //       include: {
  //         items: cartItemIncludeForCart,
  //       },
  //     });
  //     return {
  //       success: true,
  //       message: 'Sepet başarıyla temizlendi.',
  //       newCart: this.convertDbCartToClientCart(clearedCart),
  //     };
  //   } catch (error) {
  //     console.error('Error in clearCart:', error);
  //     return {
  //       success: false,
  //       message: 'Sepet temizlenirken bir hata oluştu.',
  //     };
  //   }
  // }

  // async mergeCarts(
  //   mergedCartId: string,
  //   user: User,
  // ): Promise<CartActionResponse> {
  //   try {
  //     const currentLocale = this.localeService.getLocale();
  //     const targetCurrency = getDefaultCurrencyForLocale(currentLocale);

  //     const userCart = await this.prismaService.cart.findFirst({
  //       where: {
  //         userId: user.id,
  //         status: 'ACTIVE',
  //       },
  //       include: {
  //         items: cartItemIncludeForCart,
  //       },
  //       orderBy: {
  //         createdAt: 'desc',
  //       },
  //     });

  //     const guestCart = await this.prismaService.cart.findUnique({
  //       where: {
  //         id: mergedCartId,
  //       },
  //       include: {
  //         items: cartItemIncludeForCart,
  //       },
  //     });

  //     if (!guestCart || guestCart.status !== 'ACTIVE') {
  //       if (userCart) {
  //         return {
  //           success: true,
  //           newCart: this.convertDbCartToClientCart(userCart),
  //         };
  //       }
  //       return { success: false, message: 'Birleştirilecek sepet bulunamadı.' };
  //     }

  //     if (userCart && guestCart.id === userCart.id) {
  //       return {
  //         success: true,
  //         newCart: this.convertDbCartToClientCart(userCart),
  //       };
  //     }

  //     if (guestCart.userId && guestCart.userId !== user.id) {
  //       this.prismaLoggerService.logError(
  //         new Error(
  //           'Security violation: Cart merge attempt on another user cart',
  //         ),
  //         'CartV3Service.mergeCarts',
  //         { mergedCartId, userId: user.id, guestCartUserId: guestCart.userId },
  //       );
  //       return { success: false, message: 'Bu sepet birleştirilemez.' };
  //     }

  //     if (guestCart.items.length === 0) {
  //       await this.prismaService.cart.delete({
  //         where: { id: guestCart.id },
  //       });
  //       if (userCart) {
  //         return {
  //           success: true,
  //           newCart: this.convertDbCartToClientCart(userCart),
  //         };
  //       }
  //       return { success: false, message: 'Sepetler boş.' };
  //     }

  //     if (!userCart) {
  //       const updatedCart = await this.prismaService.cart.update({
  //         where: { id: guestCart.id },
  //         data: {
  //           userId: user.id,
  //           locale: currentLocale,
  //           currency: targetCurrency,
  //         },
  //         include: {
  //           items: cartItemIncludeForCart,
  //         },
  //       });

  //       this.createLog({
  //         cartId: updatedCart.id,
  //         locale: updatedCart.locale,
  //         activityType: 'CART_MERGED',
  //         actorType: 'USER',
  //         actorId: user.id,
  //         customMessage: `Misafir sepeti (ID: ${guestCart.id}) yeni kullanıcıya atandı. Para birimi ${targetCurrency} olarak güncellendi.`,
  //       });

  //       return {
  //         success: true,
  //         newCart: this.convertDbCartToClientCart(updatedCart),
  //       };
  //     }

  //     const guestItemsCount = guestCart.items.length;

  //     await this.prismaService.cart.update({
  //       where: { id: userCart.id },
  //       data: {
  //         locale: currentLocale,
  //         currency: targetCurrency,
  //       },
  //     });

  //     userCart.locale = currentLocale;
  //     userCart.currency = targetCurrency;

  //     await this.prismaService.$transaction(async (tx) => {
  //       if (guestCart.currency !== userCart.currency) {
  //         await tx.cart.update({
  //           where: { id: guestCart.id },
  //           data: { currency: userCart.currency },
  //         });
  //       }

  //       for (const guestItem of guestCart.items) {
  //         const userItem = userCart.items.find(
  //           (i) =>
  //             i.productId === guestItem.productId &&
  //             i.variantId === guestItem.variantId,
  //         );

  //         if (userItem) {
  //           await tx.cartItem.update({
  //             where: { id: userItem.id },
  //             data: {
  //               quantity: { increment: guestItem.quantity },
  //             },
  //           });

  //           await tx.cartItem.delete({ where: { id: guestItem.id } });
  //         } else {
  //           await tx.cartItem.update({
  //             where: { id: guestItem.id },
  //             data: { cartId: userCart.id },
  //           });
  //         }
  //       }

  //       await tx.cart.update({
  //         where: { id: guestCart.id },
  //         data: {
  //           status: 'MERGED',
  //         },
  //       });
  //     });

  //     this.createLog({
  //       cartId: userCart.id,
  //       locale: userCart.locale,
  //       activityType: 'CART_MERGED',
  //       actorType: 'USER',
  //       actorId: user.id,
  //       mergedCartId: guestCart.id,
  //       mergedItemsCount: guestItemsCount,
  //     });

  //     const finalMergedCart = await this.prismaService.cart.findUnique({
  //       where: { id: userCart.id },
  //       include: { items: cartItemIncludeForCart },
  //     });

  //     return {
  //       success: true,
  //       newCart: this.convertDbCartToClientCart(finalMergedCart),
  //     };
  //   } catch (error) {
  //     this.prismaLoggerService.logError(error, 'CartV3Service.mergeCarts', {
  //       mergedCartId,
  //       userId: user.id,
  //     });
  //     return {
  //       success: false,
  //       message: 'Sepet birleştirilirken bir hata oluştu.',
  //     };
  //   }
  // }

  // private _buildLogProductName(
  //   item: CartWithRelations['items'][number],
  //   locale: $Enums.Locale,
  // ): string {
  //   const { product, variant } = item;
  //   let productName =
  //     product.translations.find((t) => t.locale === locale)?.name ||
  //     'Bilinmeyen Ürün';

  //   if (variant) {
  //     const variantInfo = variant.options
  //       .map((opt) => {
  //         const optionTranslation =
  //           opt.productVariantOption.variantOption.translations.find(
  //             (t) => t.locale === locale,
  //           );
  //         return optionTranslation?.name || '';
  //       })
  //       .filter(Boolean)
  //       .join('-');

  //     if (variantInfo) {
  //       productName = `${productName} ${variantInfo}`;
  //     }
  //   }

  //   return productName;
  // }

  // private async createLog(options: {
  //   cartId: string;
  //   locale: $Enums.Locale;
  //   activityType: $Enums.CartActivityType;
  //   actorType: $Enums.ActorType;
  //   actorId: string | null;
  //   item?: CartWithRelations['items'][number];
  //   oldQty?: number;
  //   newQty?: number;
  //   oldStatus?: $Enums.CartStatus;
  //   newStatus?: $Enums.CartStatus;
  //   whereAdded?: $Enums.WhereAdded;
  //   oldVisibility?: boolean;
  //   newVisibility?: boolean;
  //   visibleCause?: string;
  //   addressType?: 'shipping' | 'billing';
  //   orderNote?: string;
  //   mergedCartId?: string;
  //   mergedItemsCount?: number;
  //   paymentMethod?: string;
  //   paymentAmount?: number;
  //   failureReason?: string;
  //   customMessage?: string;
  // }) {
  //   try {
  //     const {
  //       cartId,
  //       locale,
  //       activityType,
  //       actorType,
  //       actorId,
  //       item,
  //       oldQty,
  //       newQty,
  //       oldStatus,
  //       newStatus,
  //       whereAdded,
  //       oldVisibility,
  //       newVisibility,
  //       visibleCause,
  //       addressType,
  //       orderNote,
  //       mergedCartId,
  //       mergedItemsCount,
  //       paymentMethod,
  //       paymentAmount,
  //       failureReason,
  //       customMessage,
  //     } = options;

  //     let message = '';
  //     let cartItemId: string | null = null;
  //     let productName = '';
  //     const actorLabel = getActorTypeLabel(actorType);

  //     if (item) {
  //       cartItemId = item.id;
  //       productName = this._buildLogProductName(item, locale);
  //     }

  //     switch (activityType) {
  //       case 'CART_CREATED':
  //         message = `${actorLabel} tarafından yeni sepet oluşturuldu.`;
  //         break;

  //       case 'ITEM_ADDED':
  //         const whereLabel = whereAdded
  //           ? ` ${getWhereAddedMessageLabel(whereAdded)}`
  //           : '';
  //         const quantity = newQty || 1;
  //         message = `${actorLabel} sepete${whereLabel} ${quantity} adet ${productName} ekledi.`;
  //         break;

  //       case 'ITEM_REMOVED':
  //         const removedQty = oldQty || 0;
  //         message = `${actorLabel} ${removedQty} adet ${productName} ürününü sepetten kaldırdı.`;
  //         break;

  //       case 'ITEM_QUANTITY_CHANGED':
  //         if (oldQty !== undefined && newQty !== undefined) {
  //           const diff = newQty - oldQty;
  //           const action = diff > 0 ? 'artırdı' : 'azalttı';
  //           message = `${actorLabel} ${productName} ürününün miktarını ${oldQty} adetten ${newQty} adete ${action}. (${diff > 0 ? '+' : ''}${diff})`;
  //         } else {
  //           message = `${actorLabel} ${productName} ürününün miktarını güncelledi.`;
  //         }
  //         break;

  //       case 'ITEM_VISIBILITY_CHANGED':
  //         if (oldVisibility !== undefined && newVisibility !== undefined) {
  //           const visibilityStatus = newVisibility ? 'görünür' : 'gizli';
  //           const reasonText = visibleCause ? ` (Sebep: ${visibleCause})` : '';
  //           message = `${actorLabel} ${productName} ürününü ${visibilityStatus} olarak işaretledi${reasonText}.`;
  //         } else {
  //           message = `${actorLabel} ${productName} ürününün görünürlüğünü değiştirdi.`;
  //         }
  //         break;

  //       case 'CART_STATUS_CHANGED':
  //         if (oldStatus && newStatus) {
  //           const oldLabel = getCartStatusLogLabel(oldStatus);
  //           const newLabel = getCartStatusLogLabel(newStatus);
  //           message = `${actorLabel} sepet durumunu "${oldLabel}" iken "${newLabel}" olarak değiştirdi.`;
  //         } else {
  //           message = `${actorLabel} sepet durumunu değiştirdi.`;
  //         }
  //         break;

  //       case 'CART_MERGED':
  //         if (mergedCartId && mergedItemsCount !== undefined) {
  //           message = `${actorLabel} tarafından misafir sepeti (${mergedItemsCount} ürün) kullanıcı sepeti ile birleştirildi. Eski sepet ID: ${mergedCartId}`;
  //         } else {
  //           message = `${actorLabel} tarafından iki sepet birleştirildi.`;
  //         }
  //         break;

  //       case 'SHIPPING_ADDRESS_SET':
  //         message = `${actorLabel} teslimat adresi ekledi/güncelledi.`;
  //         break;

  //       case 'BILLING_ADDRESS_SET':
  //         message = `${actorLabel} fatura adresi ekledi/güncelledi.`;
  //         break;

  //       case 'PAYMENT_ATTEMPT_SUCCESS':
  //         if (paymentMethod && paymentAmount !== undefined) {
  //           message = `${actorLabel} ${paymentMethod} ile ${paymentAmount.toFixed(2)} TL tutarında ödeme işlemini başarıyla tamamladı.`;
  //         } else {
  //           message = `${actorLabel} ödeme işlemini başarıyla tamamladı.`;
  //         }
  //         break;

  //       case 'PAYMENT_ATTEMPT_FAILED':
  //         if (failureReason) {
  //           message = `${actorLabel} ödeme işlemini gerçekleştiremedi. Hata: ${failureReason}`;
  //         } else if (paymentMethod && paymentAmount !== undefined) {
  //           message = `${actorLabel} ${paymentMethod} ile ${paymentAmount.toFixed(2)} TL tutarında ödeme işlemi başarısız oldu.`;
  //         } else {
  //           message = `${actorLabel} ödeme işlemi başarısız oldu.`;
  //         }
  //         break;

  //       default:
  //         message =
  //           customMessage ||
  //           `${actorLabel}: ${getCartActivityLabel(activityType)}`;
  //     }

  //     const contextData: Record<string, any> = {};
  //     if (oldQty !== undefined) contextData.oldQty = oldQty;
  //     if (newQty !== undefined) contextData.newQty = newQty;
  //     if (oldStatus) contextData.oldStatus = oldStatus;
  //     if (newStatus) contextData.newStatus = newStatus;
  //     if (whereAdded) contextData.whereAdded = whereAdded;
  //     if (oldVisibility !== undefined)
  //       contextData.oldVisibility = oldVisibility;
  //     if (newVisibility !== undefined)
  //       contextData.newVisibility = newVisibility;
  //     if (visibleCause) contextData.visibleCause = visibleCause;
  //     if (addressType) contextData.addressType = addressType;
  //     if (mergedCartId) contextData.mergedCartId = mergedCartId;
  //     if (mergedItemsCount !== undefined)
  //       contextData.mergedItemsCount = mergedItemsCount;
  //     if (paymentMethod) contextData.paymentMethod = paymentMethod;
  //     if (paymentAmount !== undefined)
  //       contextData.paymentAmount = paymentAmount;
  //     if (failureReason) contextData.failureReason = failureReason;

  //     await this.prismaService.cartActivityLog.create({
  //       data: {
  //         cartId,
  //         cartItemId,
  //         activityType,
  //         actorType,
  //         actorId,
  //         details: {
  //           message,
  //           ...(Object.keys(contextData).length > 0 && {
  //             context: contextData,
  //           }),
  //         },
  //       },
  //     });
  //   } catch (error) {
  //     this.prismaLoggerService.logError(
  //       error,
  //       'CartV3Service.createLog',
  //       options,
  //     );
  //   }
  // }
}
