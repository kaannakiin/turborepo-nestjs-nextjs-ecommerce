import { CountryType, LocationType } from "@repo/database/client";
import { z } from "zod";
import { PhoneSchemaOptional } from "../users";

export const ServiceZoneSchema = z.object({
  id: z.cuid2().optional(),
  countryId: z.uuid({ error: "Ülke seçimi zorunludur." }),
  countryType: z.enum(CountryType),
  stateIds: z.array(z.uuid()),
  cityIds: z.array(z.uuid()),
  priority: z
    .number()
    .int()
    .min(0, { message: "Öncelik 0 veya daha büyük olmalıdır." }),
  estimatedDeliveryDays: z
    .number()
    .int()
    .min(1, { message: "Teslimat süresi en az 1 gün olmalıdır." })
    .max(60, { message: "Teslimat süresi en fazla 60 gün olabilir." })
    .nullish(),
});

export type ServiceZoneSchemaType = z.infer<typeof ServiceZoneSchema>;

export const InventoryLocationZodSchema = z
  .object({
    uniqueId: z.cuid2(),
    type: z.enum(LocationType),
    countryType: z.enum(CountryType),
    countryId: z.string({ error: "Ülke bilgisi zorunludur." }),
    stateId: z.string().nullish(),
    cityId: z.string().nullish(),
    districtId: z.string().nullish(),
    zipCode: z.string().nullish(),

    name: z
      .string({ error: "Depo adı zorunludur." })
      .min(2, { message: "Depo adı en az 2 karakter olmalıdır." })
      .max(256, { message: "Depo adı en fazla 256 karakter olabilir." }),

    isActive: z.boolean(),

    addressLine1: z
      .string()
      .min(5, { message: "Adres bilgisi en az 5 karakter olmalıdır." })
      .max(512, { message: "Adres bilgisi en fazla 512 karakter olabilir." })
      .nullish(),
    addressLine2: z
      .string()
      .max(512, { message: "Adres bilgisi en fazla 512 karakter olabilir." })
      .nullish(),

    contactName: z
      .string()
      .min(2, { message: "İletişim adı en az 2 karakter olmalıdır." })
      .max(256, { message: "İletişim adı en fazla 256 karakter olabilir." })
      .nullish(),
    contactPhone: PhoneSchemaOptional.nullish(),
    contactEmail: z
      .email({ error: "Geçerli bir e-posta adresi giriniz." })
      .nullish(),

    serviceZones: z.array(ServiceZoneSchema).min(1, {
      message: "En az bir servis bölgesi tanımlanmalıdır.",
    }),
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

    const countryIds = value.serviceZones.map((z) => z.countryId);
    const duplicates = countryIds.filter(
      (id, index) => countryIds.indexOf(id) !== index
    );

    if (duplicates.length > 0) {
      issues.push({
        code: "custom",
        path: ["serviceZones"],
        message: "Aynı ülke için birden fazla servis bölgesi tanımlanamaz.",
        input: value.serviceZones,
      });
    }
  });

export type InventoryLocationZodSchemaType = z.infer<
  typeof InventoryLocationZodSchema
>;

export const UpsertServiceZoneSchema = z.object({
  locationId: z.cuid2({ error: "Lokasyon ID zorunludur." }),
  zone: ServiceZoneSchema,
});

export type UpsertServiceZoneSchemaType = z.infer<
  typeof UpsertServiceZoneSchema
>;

export const BulkUpdateServiceZonesSchema = z.object({
  locationId: z.cuid2({ error: "Lokasyon ID zorunludur." }),
  zones: z.array(ServiceZoneSchema),
});

export type BulkUpdateServiceZonesSchemaType = z.infer<
  typeof BulkUpdateServiceZonesSchema
>;
