import { CountryType, Currency } from "@repo/database";
import * as z from "zod";

const RuleType = {
  SalesPrice: "SalesPrice",
  ProductWeight: "ProductWeight",
} as const;

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
  currency: z.enum(Currency),
  name: z.string().min(1).max(256),
  shippingPrice: z.number().int().min(0),
  condition: z.discriminatedUnion("type", [
    z
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
        }
      ),
  ]),
});
export const CargoZoneConfigSchema = z.object({
  locations: z.array(LocationSchema).min(1, "En az bir lokasyon gereklidir"),
  rules: z.array(ShippingRuleSchema).min(1, "En az bir kural gereklidir"),
});

export type CargoZoneType = z.infer<typeof CargoZoneConfigSchema>;
export type LocationType = z.infer<typeof LocationSchema>;
export type ShippingRuleType = z.infer<typeof ShippingRuleSchema>;
