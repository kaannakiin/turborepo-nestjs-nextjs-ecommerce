import { CountryCallingCode, isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import { getCountryCodes, isPhoneJustCallingCode } from "../common/helpers";
import { SortAdminUserTable } from "../common";
export const PhoneSchema = z
  .string({
    error: "Telefon numarası gereklidir",
  })
  .refine(
    (val) => {
      try {
        return isValidPhoneNumber(val);
      } catch {
        return false;
      }
    },
    {
      message: "Geçersiz telefon numarası",
    }
  );

export const PhoneSchemaOptional = z
  .string()
  .nullish()
  .refine(
    (val) => {
      if (!val) return true;
      const isPhoneJustCallingCodeValue = isPhoneJustCallingCode(val);
      if (isPhoneJustCallingCodeValue) return true;
      try {
        return isValidPhoneNumber(val);
      } catch {
        return false;
      }
    },
    {
      message: "Geçersiz telefon numarası",
    }
  );

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, "İsim en az 2 karakter olmalıdır")
      .max(50, "İsim en fazla 50 karakter olabilir"),
    surname: z
      .string()
      .min(2, "Soyisim en az 2 karakter olmalıdır")
      .max(50, "Soyisim en fazla 50 karakter olabilir"),
    email: z.email("Geçersiz e-posta adresi").optional().nullable(),
    phone: z.string().optional().nullable(),
    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(50, "Şifre en fazla 50 karakter olabilir"),
    confirmPassword: z
      .string()
      .min(6, "Onay şifresi en az 6 karakter olmalıdır")
      .max(50, "Onay şifresi en fazla 50 karakter olabilir"),
  })
  .check(({ issues, value }) => {
    if (value.password !== value.confirmPassword) {
      issues.push({
        code: "custom",
        message: "Şifreler eşleşmiyor",
        path: ["confirmPassword"],
        input: value.confirmPassword,
      });
    }

    const isEmailProvided = value.email && value.email.trim() !== "";
    const callingCodes = getCountryCodes();
    const phoneValue = value.phone?.trim() || "";

    const isPhoneJustCallingCode = callingCodes.includes(
      phoneValue as CountryCallingCode
    );
    const isPhoneEmpty = phoneValue === "";
    const isPhoneProvided = !isPhoneEmpty && !isPhoneJustCallingCode;

    if (!isEmailProvided && !isPhoneProvided) {
      issues.push({
        code: "custom",
        message: "E-posta adresi veya telefon numarası gereklidir",
        path: ["email"],
        input: value.email,
      });
      return;
    }

    if (isPhoneProvided) {
      try {
        if (!isValidPhoneNumber(phoneValue)) {
          issues.push({
            code: "custom",
            message: "Geçersiz telefon numarası",
            path: ["phone"],
            input: value.phone,
          });
        }
      } catch (error) {
        issues.push({
          code: "custom",
          message: "Geçersiz telefon numarası",
          path: ["phone"],
          input: value.phone,
        });
      }
    }

    if (isEmailProvided) {
      const emailSchema = z.string().email();
      const emailResult = emailSchema.safeParse(value.email!);
      if (!emailResult.success) {
        issues.push({
          code: "custom",
          message: "Invalid email address",
          path: ["email"],
          input: value.email,
        });
      }
    }
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    email: z.email("Geçersiz e-posta adresi"),
    password: z
      .string({
        error: "Şifre gereklidir",
      })
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(50, "Şifre en fazla 50 karakter olabilir"),
  }),
  z.object({
    type: z.literal("phone"),
    phone: z
      .string({
        error: "Telefon numarası gereklidir",
      })
      .refine(
        (val) => {
          try {
            return isValidPhoneNumber(val);
          } catch {
            return false;
          }
        },
        {
          message: "Geçersiz telefon numarası",
        }
      ),
    password: z
      .string({
        error: "Şifre gereklidir",
      })
      .min(6, "Şifre en az 6 karakter olmalıdır")
      .max(50, "Şifre en fazla 50 karakter olabilir"),
  }),
]);

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export type UserIdAndName = {
  id: string;
  name: string;
};

export const UserDashboardInfoSchema = z.object({
  name: z
    .string()
    .min(2, "İsim en az 2 karakter olmalıdır")
    .max(50, "İsim en fazla 50 karakter olabilir"),
  surname: z
    .string()
    .min(2, "Soyisim en az 2 karakter olmalıdır")
    .max(50, "Soyisim en fazla 50 karakter olabilir"),
  phone: z
    .string({
      error: "Telefon numarası gereklidir",
    })
    .optional()
    .nullable(),
  email: z
    .email({
      error: "Geçersiz e-posta adresi",
    })
    .optional()
    .nullable(),
});

export type UserDashboardInfoType = z.infer<typeof UserDashboardInfoSchema>;

export const getUsersQueries = z.object({
  search: z.string().default(""), // default boş string
  page: z.coerce.number().min(1).default(1), // query string "2" → number 2
  sortBy: z.enum(SortAdminUserTable).default(SortAdminUserTable.nameAsc),
});
export type GetUsersQueries = z.infer<typeof getUsersQueries>;
