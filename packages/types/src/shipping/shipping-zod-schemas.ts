import { CountryType, Currency, RuleType } from "@repo/database/client";
import { z } from "zod";

export const LocationSchema = z
  .object({
    countryId: z.uuid("Geçersiz ülke kimliği"),
    countryType: z.enum(CountryType),
    stateIds: z.array(z.uuid("Geçersiz eyalet kimliği")).optional().nullable(),
    cityIds: z.array(z.uuid("Geçersiz şehir kimliği")).optional().nullable(),
  })
  .check(({ value, issues }) => {
    switch (value.countryType) {
      case "CITY":
        if (value.stateIds?.length) {
          issues.push({
            code: "custom",
            path: ["stateIds"],
            input: value.stateIds,
            message: "Şehir seviyesi için eyalet kimlikleri sağlanmamalıdır",
          });
        }
        break;
      case "STATE":
        if (value.cityIds?.length) {
          issues.push({
            code: "custom",
            path: ["cityIds"],
            input: value.cityIds,
            message: "Eyalet seviyesi için şehir kimlikleri sağlanmamalıdır",
          });
        }

        break;
      case "NONE":
        if (value.stateIds?.length || value.cityIds?.length) {
          issues.push({
            code: "custom",
            path: ["stateIds"],
            input: value.stateIds,
            message: "Ülke seviyesi için alt bölge seçilemez",
          });
        }
        break;
    }
  });

export const SalesPriceConditionSchema = z
  .object({
    type: z.literal(RuleType.SalesPrice),
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
      .nullable(),
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
    },
  );

export const ProductWeightConditionSchema = z
  .object({
    type: z.literal(RuleType.ProductWeight),
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
    },
  );

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
    SalesPriceConditionSchema,
    ProductWeightConditionSchema,
  ]),
});

export const CargoZoneConfigSchema = z.object({
  uniqueId: z.cuid2({}).nullish(),
  locations: z.array(LocationSchema).min(1, "En az bir lokasyon gereklidir"),
  rules: z.array(ShippingRuleSchema).min(1, "En az bir kural gereklidir"),
});

export type SalesPriceCondition = z.infer<typeof SalesPriceConditionSchema>;
export type ProductWeightCondition = z.infer<
  typeof ProductWeightConditionSchema
>;
export type CargoZoneType = z.infer<typeof CargoZoneConfigSchema>;
export type LocationType = z.infer<typeof LocationSchema>;
export type ShippingRuleType = z.infer<typeof ShippingRuleSchema>;
