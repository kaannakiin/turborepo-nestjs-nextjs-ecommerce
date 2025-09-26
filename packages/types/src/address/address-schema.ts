import { CountryType, Prisma } from "@repo/database";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import * as z from "zod";

const BaseAddressSchema = z
  .object({
    id: z.cuid2({
      error: "Geçersiz Adres Kimliği",
    }),
    phone: z
      .string({ error: "Telefon Numarası gereklidir" })
      .refine((val) => isPossiblePhoneNumber(val), {
        message: "Geçersiz Telefon Numarası",
      }),

    name: z
      .string({
        error: " İsim gereklidir",
      })
      .min(2, "İsim en az 2 karakter olmalıdır")
      .max(256, "İsim en fazla 256 karakter olabilir"),
    surname: z
      .string({
        error: "Soyisim gereklidir",
      })
      .min(2, "Soyisim en az 2 karakter olmalıdır")
      .max(256, "Soyisim en fazla 256 karakter olabilir"),
    countryId: z.uuid({
      error: "Geçersiz Ülke Kimliği",
    }),
    cityId: z
      .uuid({
        error: "Geçersiz Şehir Kimliği",
      })
      .optional()
      .nullable(),
    stateId: z
      .uuid({
        error: "Geçersiz İlçe Kimliği",
      })
      .optional()
      .nullable(),
    addressType: z.enum(CountryType, {
      error: "Geçersiz Adres Türü",
    }),
    addressLine1: z
      .string({
        error: "Adres Satırı 1 gereklidir",
      })
      .min(5, "Adres Satırı 1 en az 5 karakter olmalıdır")
      .max(512, "Adres Satırı 1 en fazla 512 karakter olabilir"),
    addressLine2: z
      .string({ error: "Adres Satırı 2 gereklidir" })
      .max(512, "Adres Satırı 2 en fazla 512 karakter olabilir")
      .optional()
      .nullable(),
    postalCode: z
      .string({
        error: "Posta Kodu gereklidir",
      })
      .regex(
        /^[a-z0-9][a-z0-9\- ]{0,10}[a-z0-9]$/i,
        "Geçersiz postal kodu formatı"
      )
      .nullable()
      .optional(),
  })
  .check(({ issues, value }) => {
    if (value.addressType === "NONE") {
      value.stateId = null;
      value.cityId = null;
      return;
    }

    if (value.addressType === "CITY" && !value.cityId) {
      issues.push({
        code: "custom",
        message: "Şehir seçimi gereklidir",
        input: ["cityId"],
        path: ["cityId"],
      });
    }

    if (value.addressType === "STATE" && !value.stateId) {
      issues.push({
        code: "custom",
        message: "State seçimi gereklidir",
        input: ["stateId"],
        path: ["cityId"],
      });
    }
  });

export const AuthAddressSchema = BaseAddressSchema.safeExtend({
  addressTitle: z
    .string({
      error: '"Adres Başlığı gereklidir",',
    })
    .min(2, "Adres Başlığı en az 2 karakter olmalıdır")
    .max(256, "Adres Başlığı en fazla 256 karakter olabilir"),
});

export const NonAuthUserAddressSchema = BaseAddressSchema.safeExtend({
  email: z.email({
    error: "Geçersiz E-posta Adresi",
  }),
  campaignCheckbox: z.boolean(),
});

export type NonAuthUserAddressZodType = z.infer<
  typeof NonAuthUserAddressSchema
>;

export type GetAllCountryReturnType = Prisma.CountryGetPayload<{
  select: {
    translations: {
      select: {
        name: true;
        locale: true;
      };
    };
    id: true;
    emoji: true;
    type: true;
  };
}>;

export type GetAllCityReturnType = Prisma.CityGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;

export type GetAllStateReturnType = Prisma.StateGetPayload<{
  select: {
    id: true;
    name: true;
  };
}>;
