import { CountryType, LocationType } from "@repo/database";
import { z } from "zod";
import { PhoneSchemaOptional } from "../../auth/schemas";

export const InventoryZodSchema = z
  .object({
    type: z.enum(LocationType),
    countryType: z.enum(CountryType),
    countryId: z.cuid2({ error: "Ülke bilgisi zorunludur." }),
    stateId: z.cuid2().nullish(),
    cityId: z.cuid2().nullish(),
    districtId: z.cuid2().nullish(),
    zipCode: z.cuid2().nullish(),
    name: z
      .string({
        error: "Depo adı zorunludur.",
      })
      .min(2, { message: "Depo adı en az 2 karakter olmalıdır." })
      .max(256, { message: "Depo adı en fazla 256 karakter olabilir." }),
    isActive: z.boolean(),
    addressLine1: z
      .string({ error: "Adres bilgisi zorunludur." })
      .min(5, { message: "Adres bilgisi en az 5 karakter olmalıdır." })
      .max(512, { message: "Adres bilgisi en fazla 512 karakter olabilir." })
      .nullish(),
    addressLine2: z
      .string({ error: "Adres bilgisi zorunludur." })
      .min(5, { message: "Adres bilgisi en az 5 karakter olmalıdır." })
      .max(512, { message: "Adres bilgisi en fazla 512 karakter olabilir." })
      .nullish(),
    contactName: z
      .string({ error: "İletişim adı zorunludur." })
      .min(2, {
        error: "İletişim adı en az 2 karakter olmalıdır.",
      })
      .max(256, { message: "İletişim adı en fazla 256 karakter olabilir." })
      .nullish(),
    contactPhone: PhoneSchemaOptional.nullish(),
    contactEmail: z
      .email({ error: "Geçerli bir e-posta adresi giriniz." })
      .nullish(),
  })
  .check(({ value, issues }) => {
    if (value.countryType === "STATE" && !value.stateId) {
      issues.push({
        code: "custom",
        path: ["stateId"],
        message: "Eyalet/Bölge seçimi zorunludur.",
        input: value.stateId,
      });
    }

    if (value.countryType === "CITY" && !value.cityId) {
      issues.push({
        code: "custom",
        path: ["cityId"],
        message: "Şehir seçimi zorunludur.",
        input: value.cityId,
      });
    }
  });
