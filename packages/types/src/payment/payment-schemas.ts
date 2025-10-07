import { OrderItem, Prisma } from "@repo/database";
import * as z from "zod";
import { BillingAddressSchema } from "../address/address-schema";
export const PaymentZodSchema = z
  .object({
    creditCardName: z
      .string({
        error: "Kart üzerindeki isim gereklidir",
      })
      .min(2, "Kart üzerindeki isim en az 2 karakter olmalıdır")
      .max(50, "Kart üzerindeki isim en fazla 50 karakter olmalıdır")
      .transform((str) => str.trim().toUpperCase()),

    creditCardNumber: z
      .string({
        error: "Kredi kartı numarası gereklidir",
      })
      .regex(/^\d{4} \d{4} \d{4} \d{4}$/, {
        error: "Geçersiz kredi kartı formatı. ",
      }),
    // .refine(
    //   (cardNumber) => {
    //     const digits = cardNumber.replace(/\s/g, "").split("").map(Number);
    //     let sum = 0;
    //     let isEven = false;

    //     for (let i = digits.length - 1; i >= 0; i--) {
    //       let digit = digits[i];
    //       if (isEven) {
    //         digit *= 2;
    //         if (digit > 9) {
    //           digit -= 9;
    //         }
    //       }
    //       sum += digit;
    //       isEven = !isEven;
    //     }
    //     return sum % 10 === 0;
    //   },
    //   {
    //     error: "Geçersiz kredi kartı numarası",
    //   }
    // ),

    expiryDate: z
      .string({
        error: "Son kullanma tarihi gereklidir",
      })
      .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
        error: "Son kullanma tarihi MM/YY formatında olmalıdır",
      })
      .refine(
        (date) => {
          const [month, year] = date.split("/").map(Number);
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          if (year < currentYear) return false;
          if (year === currentYear && month < currentMonth) return false;
          return true;
        },
        {
          error: "Geçersiz son kullanma tarihi",
        }
      ),

    cvv: z
      .string({
        error: "CVV gereklidir",
      })
      .regex(/^\d{3}$/, {
        error: "CVV 3 haneli olmalıdır",
      }),
    checkAggrements: z.boolean().refine((val) => val === true, {
      error: "Lütfen şartları kabul edin",
    }),
    isBillingAddressSame: z.boolean(),
    billingAddress: BillingAddressSchema.optional().nullable(),
  })
  .check(({ value, issues }) => {
    if (!value.isBillingAddressSame && !value.billingAddress) {
      if (value?.billingAddress?.isCorporateInvoice) {
        if (
          !value?.billingAddress?.companyName ||
          value?.billingAddress?.companyName.trim().length === 0
        ) {
          issues.push({
            code: "custom",
            message: "Firma Adı gereklidir",
            path: ["companyName"],
            input: ["companyName"],
          });
        }

        if (
          !value?.billingAddress?.taxNumber ||
          value?.billingAddress?.taxNumber.trim().length === 0
        ) {
          issues.push({
            code: "custom",
            message: "Vergi Numarası gereklidir",
            path: ["taxNumber"],
            input: ["taxNumber"],
          });
        }

        if (
          !value?.billingAddress?.companyRegistrationAddress ||
          value?.billingAddress?.companyRegistrationAddress.trim().length === 0
        ) {
          issues.push({
            code: "custom",
            message: "Vergi dairesi gereklidir",
            path: ["companyRegistrationAddress"],
            input: ["companyRegistrationAddress"],
          });
        }
      }
    }
  });

export type PaymentZodType = z.infer<typeof PaymentZodSchema>;

export type OrderPageGetOrderReturnType = {
  success: boolean;
  message: string;
  order?: Omit<
    Prisma.OrderGetPayload<{
      include: {
        user: true;
      };
    }> & {
      orderItems: Array<
        Omit<OrderItem, "productSnapshot" | "buyedVariants"> & {
          productSnapshot: Prisma.ProductGetPayload<{
            include: {
              assets: {
                take: 1;
                orderBy: { order: "asc" };
                select: {
                  asset: {
                    select: { url: true; type: true };
                  };
                };
              };
              translations: true;
              brand: true;
              categories: {
                orderBy: { createdAt: "desc" };
                select: { category: true };
              };
              prices: true;
              taxonomyCategory: true;
            };
          }>;
          buyedVariants: Prisma.ProductVariantCombinationGetPayload<{
            include: {
              assets: {
                take: 1;
                orderBy: { order: "asc" };
                select: {
                  asset: {
                    select: { url: true; type: true };
                  };
                };
              };
              prices: true;
              translations: true;
              options: {
                orderBy: [
                  {
                    productVariantOption: {
                      productVariantGroup: { order: "asc" };
                    };
                  },
                  {
                    productVariantOption: { order: "asc" };
                  },
                ];
                select: {
                  productVariantOption: {
                    select: {
                      variantOption: {
                        select: {
                          id: true;
                          hexValue: true;
                          asset: {
                            select: { url: true; type: true };
                          };
                          translations: true;
                          variantGroup: {
                            select: {
                              id: true;
                              type: true;
                              translations: true;
                            };
                          };
                        };
                      };
                    };
                  };
                };
              };
              product: {
                include: {
                  assets: {
                    take: 1;
                    orderBy: { order: "asc" };
                    select: {
                      asset: {
                        select: { url: true; type: true };
                      };
                    };
                  };
                  translations: true;
                  brand: true;
                  categories: {
                    orderBy: { createdAt: "desc" };
                    select: { category: true };
                  };
                  prices: true;
                  taxonomyCategory: true;
                };
              };
            };
          }> | null;
        }
      >;
    },
    "billingAddress" | "shippingAddress"
  > & {
    billingAddress: {
      city: string;
      address: string;
      country: string;
      zipCode: string;
      contactName: string;
      gsmNumber: string;
      email: string;
    };
  } & {
    shippingAddress: {
      city: string;
      address: string;
      country: string;
      zipCode: string;
      contactName: string;
      gsmNumber: string;
      email: string;
    };
  };
};
