import { CountryType } from "@repo/database/client";
import { isPossiblePhoneNumber } from "libphonenumber-js";
import * as z from "zod";
import { TURKEY_DB_ID } from "../common/constants";

export const tcKimlikNoRegex = /^[1-9]{1}[0-9]{9}[02468]{1}$/;
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
    districtId: z
      .uuid({
        error: "Geçersiz Semt Kimliği",
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
    if (
      value.addressType === "CITY" &&
      value.countryId === TURKEY_DB_ID &&
      !value.districtId
    ) {
      issues.push({
        code: "custom",
        message: "Semt/Mahalle seçimi gereklidir",
        input: ["districtId"],
      });
    }
  });

export const AuthUserAddressSchema = BaseAddressSchema.safeExtend({
  addressTitle: z
    .string({
      error: '"Adres Başlığı gereklidir",',
    })
    .min(2, "Adres Başlığı en az 2 karakter olmalıdır")
    .max(256, "Adres Başlığı en fazla 256 karakter olabilir"),
  tcKimlikNo: z
    .string({
      error: ' "T.C. Kimlik Numarası gereklidir"',
    })
    .length(11, "T.C. Kimlik Numarası 11 karakter olmalıdır")
    .optional()
    .nullable(),
}).check(({ value, issues }) => {
  if (value.countryId && value.countryId === TURKEY_DB_ID) {
    if (!value.tcKimlikNo) {
      issues.push({
        code: "custom",
        message: "T.C. Kimlik Numarası gereklidir",
        input: ["tcKimlikNo"],
        path: ["tcKimlikNo"],
      });
    } else if (!tcKimlikNoRegex.test(value.tcKimlikNo)) {
      issues.push({
        code: "custom",
        message: "Geçerli bir T.C. Kimlik Numarası giriniz",
        input: ["tcKimlikNo"],
        path: ["tcKimlikNo"],
      });
    }
  }
});
export const NonAuthUserAddressSchema = BaseAddressSchema.safeExtend({
  email: z.email({
    error: "Geçersiz E-posta Adresi",
  }),
  campaignCheckbox: z.boolean(),
  tcKimlikNo: z
    .string({
      error: ' "T.C. Kimlik Numarası gereklidir"',
    })
    .length(11, "T.C. Kimlik Numarası 11 karakter olmalıdır")
    .optional()
    .nullable(),
}).check(({ value, issues }) => {
  if (value.countryId && value.countryId === TURKEY_DB_ID) {
    if (!value.tcKimlikNo) {
      issues.push({
        code: "custom",
        message: "T.C. Kimlik Numarası gereklidir",
        input: ["tcKimlikNo"],
        path: ["tcKimlikNo"],
      });
    } else if (!tcKimlikNoRegex.test(value.tcKimlikNo)) {
      issues.push({
        code: "custom",
        message: "Geçerli bir T.C. Kimlik Numarası giriniz",
        input: ["tcKimlikNo"],
        path: ["tcKimlikNo"],
      });
    }
  }
});

export type NonAuthUserAddressZodType = z.infer<
  typeof NonAuthUserAddressSchema
>;
export type AuthUserAddressZodType = z.infer<typeof AuthUserAddressSchema>;

export const BillingAddressSchema = BaseAddressSchema.safeExtend({
  isCorporateInvoice: z.boolean({
    error: ' "Kurumsal Fatura seçeneği gereklidir",',
  }),
  companyName: z
    .string({
      error: "Firma Adı gereklidir",
    })
    .min(2, "Firma Adı en az 2 karakter olmalıdır")
    .max(256, "Firma Adı en fazla 256 karakter olabilir")
    .optional()
    .nullable(),
  taxNumber: z
    .string({
      error: ' "Vergi Numarası gereklidir",',
    })
    .min(2, "Vergi Numarası en az 2 karakter olmalıdır")
    .max(50, "Vergi Numarası en fazla 50 karakter olabilir")
    .optional()
    .nullable(),
  companyRegistrationAddress: z
    .string({
      error: ' "Vergi dairesi gereklidir",',
    })
    .min(2, "Vergi dairesi en az 2 karakter olmalıdır")
    .max(256, "Vergi dairesi en fazla 256 karakter olabilir")
    .optional()
    .nullable(),
  tcKimlikNo: z
    .string({
      error: ' "T.C. Kimlik Numarası gereklidir"',
    })
    .length(11, "T.C. Kimlik Numarası 11 karakter olmalıdır")
    .optional()
    .nullable(),
});

export type BillingAddressZodType = z.infer<typeof BillingAddressSchema>;
