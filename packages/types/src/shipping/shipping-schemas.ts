import { $Enums, CountryType, Currency, Prisma } from "@repo/database";
import * as z from "zod";

export const LocationSchema = z
  .object({
    countryId: z.uuid("Geçersiz ülke kimliği"),
    countryType: z.enum(CountryType),
    stateIds: z.array(z.uuid("Geçersiz eyalet kimliği")).optional().nullable(),
    cityIds: z.array(z.uuid("Geçersiz şehir kimliği")).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    switch (data.countryType) {
      case "CITY":
        // CITY tipinde stateIds sıfırlanmalı
        if (data.stateIds?.length) {
          ctx.addIssue({
            code: "custom",
            path: ["stateIds"],
            message: "Şehir seviyesi için eyalet kimlikleri sağlanmamalıdır",
          });
        }
        break;
      case "STATE":
        if (data.cityIds?.length) {
          ctx.addIssue({
            code: "custom",
            path: ["cityIds"],
            message: "Eyalet seviyesi için şehir kimlikleri sağlanmamalıdır",
          });
        }
        // stateIds zorunlu değil, boş olabilir
        break;
      case "NONE":
        // NONE tipinde hem stateIds hem cityIds sıfırlanmalı
        if (data.stateIds?.length || data.cityIds?.length) {
          ctx.addIssue({
            code: "custom",
            path: ["stateIds"],
            message: "Ülke seviyesi için alt bölge seçilemez",
          });
        }
        break;
    }
  });

export const ShippingRuleSchema = z.object({
  uniqueId: z.cuid2({
    error: "Geçersiz kural kimliği",
  }),
  currency: z.enum(Currency),
  name: z
    .string({
      error: "Geçersiz kural adı",
    })
    .min(1, { error: "Kural adı minimum 1 karakter içermelidir." })
    .max(256, {
      error: "Kural adı maksimum 256 karakter içermelidir.",
    }),
  shippingPrice: z
    .number({
      error: "Geçersiz kargo fiyatı",
    })
    .int({
      error: "Geçersiz kargo fiyatı",
    })
    .min(0, {
      error: "Kargo fiyatı 0 veya daha büyük olmalıdır",
    })
    .max(Number.MAX_SAFE_INTEGER, {
      error: "Kargo fiyatı çok büyük olamaz",
    })
    .nullable()
    .optional(),
  condition: z.discriminatedUnion("type", [
    z
      .object({
        type: z.literal($Enums.RuleType.SalesPrice),
        minSalesPrice: z
          .number({
            error: "Geçersiz minimum satış fiyatı",
          })
          .int({ error: "Geçersiz minimum satış fiyatı" })
          .min(0, {
            error: "Minimum satış fiyatı 0 veya daha büyük olmalıdır",
          })
          .optional()
          .nullable(),
        maxSalesPrice: z
          .number({
            error: "Geçersiz maksimum satış fiyatı",
          })
          .int({
            error: "Geçersiz maksimum satış fiyatı",
          })
          .min(0, {
            error: "Maksimum satış fiyatı 0 veya daha büyük olmalıdır",
          })
          .optional()
          .nullable(), // Typo düzeltildi
      })
      .refine(
        (data) => {
          if (data.minSalesPrice != null && data.maxSalesPrice != null) {
            return data.minSalesPrice <= data.maxSalesPrice;
          }
          return true;
        },
        {
          message: "Minimum fiyat maksimumdan büyük olamaz",
          path: ["minSalesPrice"],
        }
      ),

    z
      .object({
        type: z.literal($Enums.RuleType.ProductWeight),
        minProductWeight: z
          .number({
            error: "Geçersiz minimum ürün ağırlığı",
          })
          .int({
            error: "Geçersiz minimum ürün ağırlığı",
          })
          .min(0, {
            error: "Minimum ürün ağırlığı 0 veya daha büyük olmalıdır",
          })
          .optional()
          .nullable(),
        maxProductWeight: z
          .number({
            error: "Geçersiz maksimum ürün ağırlığı",
          })
          .int({
            error: "Geçersiz maksimum ürün ağırlığı",
          })
          .min(0, {
            error: "Maksimum ürün ağırlığı 0 veya daha büyük olmalıdır",
          })
          .optional()
          .nullable(),
      })
      .refine(
        (data) => {
          if (data.minProductWeight != null && data.maxProductWeight != null) {
            return data.minProductWeight <= data.maxProductWeight;
          }
          return true;
        },
        {
          message: "Minimum ağırlık maksimumdan büyük olamaz",
          path: ["minProductWeight"],
        }
      ),
  ]),
});
export const CargoZoneConfigSchema = z.object({
  uniqueId: z.cuid2({}),
  locations: z.array(LocationSchema).min(1, "En az bir lokasyon gereklidir"),
  rules: z.array(ShippingRuleSchema).min(1, "En az bir kural gereklidir"),
});

export type CargoZoneType = z.infer<typeof CargoZoneConfigSchema>;
export type LocationType = z.infer<typeof LocationSchema>;
export type ShippingRuleType = z.infer<typeof ShippingRuleSchema>;

export type CargoZones = Prisma.CargoZoneGetPayload<{
  include: {
    locations: {
      include: {
        country: {
          include: {
            translations: true;
          };
        };
      };
    };
    rules: true;
  };
}>;

export type CartItemWithPrices = Prisma.CartItemGetPayload<{
  select: {
    quantity: true;
    variant: { select: { prices: true } };
    product: { select: { prices: true } };
  };
}>;

export type LocationWithCargoZone = Prisma.LocationGetPayload<{
  include: {
    country: {
      select: {
        type: true;
      };
    };
    cargoZone: {
      select: {
        rules: {
          where: {
            currency: $Enums.Currency;
          };
        };
      };
    };
  };
}>;

export type CargoRuleWithDetails = Prisma.CargoRuleGetPayload<{
  select: {
    id: true;
    name: true;
    price: true;
    currency: true;
    ruleType: true;
    minValue: true;
    maxValue: true;
  };
}>;

export type ShippingMethodsResponse = {
  success: boolean;
  message?: string;
  shippingMethods?: {
    rules: CargoRuleWithDetails[];
  };
};
