//packages/types/src/auth/schemas.ts
import {
  CountryCallingCode,
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
} from "libphonenumber-js";
import * as z from "zod";
import { UserRole } from "@repo/database";

export const getCountryCodes = (): string[] => {
  const countryCodes = getCountries();
  const callingCodes = countryCodes.map(
    (code) => `+${getCountryCallingCode(code)}`
  ) as CountryCallingCode[];
  return callingCodes;
};

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
  .superRefine((data, ctx) => {
    // Password match validation
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Şifreler eşleşmiyor",
        path: ["confirmPassword"],
      });
    }

    const isEmailProvided = data.email && data.email.trim() !== "";
    const callingCodes = getCountryCodes();
    const phoneValue = data.phone?.trim() || "";

    const isPhoneJustCallingCode = callingCodes.includes(
      phoneValue as CountryCallingCode
    );
    const isPhoneEmpty = phoneValue === "";
    const isPhoneProvided = !isPhoneEmpty && !isPhoneJustCallingCode;
    // Email or phone required validation
    if (!isEmailProvided && !isPhoneProvided) {
      ctx.addIssue({
        code: "custom",
        message: "E-posta adresi veya telefon numarası gereklidir",
        path: ["email"],
      });
      return;
    }

    // Phone validation if provided
    if (isPhoneProvided) {
      try {
        if (!isValidPhoneNumber(phoneValue)) {
          ctx.addIssue({
            code: "custom",
            message: "Geçersiz telefon numarası",
            path: ["phone"],
          });
        }
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          message: "Geçersiz telefon numarası",
          path: ["phone"],
        });
      }
    }

    // Email validation if provided (additional check)
    if (isEmailProvided) {
      const emailSchema = z.string().email();
      const emailResult = emailSchema.safeParse(data.email!);
      if (!emailResult.success) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid email address",
          path: ["email"],
        });
      }
    }
  });

export type RegisterSchemaType = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("email"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
  }),
  z.object({
    type: z.literal("phone"),
    phone: z.string().refine(
      (val) => {
        try {
          return isValidPhoneNumber(val);
        } catch {
          return false;
        }
      },
      {
        message: "Invalid phone number",
      }
    ),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
  }),
]);

export type LoginSchemaType = z.infer<typeof LoginSchema>;

export type TokenPayload = {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
  image?: string;
};

export type UserIdAndName = {
  id: string;
  name: string;
};
