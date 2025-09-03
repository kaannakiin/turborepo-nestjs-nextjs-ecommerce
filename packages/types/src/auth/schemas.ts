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
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    surname: z
      .string()
      .min(2, "Surname must be at least 2 characters")
      .max(50, "Surname cannot exceed 50 characters"),
    email: z.string().email("Invalid email address").optional().nullable(),
    phone: z.string().optional().nullable(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password cannot exceed 50 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters")
      .max(50, "Confirm password cannot exceed 50 characters"),
  })
  .superRefine((data, ctx) => {
    // Password match validation
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
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
        message: "Either email or phone number is required",
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
            message: "Invalid phone number",
            path: ["phone"],
          });
        }
      } catch (error) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid phone number",
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
