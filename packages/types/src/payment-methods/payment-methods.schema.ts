import { $Enums } from "@repo/database";
import * as z from "zod";

const BasePaymentSchema = z.object({
  isTestMode: z.boolean(),
  isActive: z.boolean(),
});

export const IyzicoPaymentMethodSchema = z.object({
  type: z.literal<$Enums.PaymentProvider>("IYZICO"),
  iyzicoApiKey: z
    .string({ error: "Bu alan zorunludur." })
    .min(1, "Bu alan zorunludur.")
    .max(255, "Maksimum 255 karakter olmalıdır."),
  iyzicoSecretKey: z
    .string({ error: "Bu alan zorunludur." })
    .min(1, "Bu alan zorunludur.")
    .max(255, "Maksimum 255 karakter olmalıdır."),
  ...BasePaymentSchema.shape,
});

export const PayTRPaymentMethodSchema = z.object({
  type: z.literal<$Enums.PaymentProvider>("PAYTR"),
  merchantId: z
    .string({ error: "Bu alan zorunludur." })
    .min(1, "Bu alan zorunludur.")
    .max(255, "Maksimum 255 karakter olmalıdır."),
  merchantKey: z
    .string({ error: "Bu alan zorunludur." })
    .min(1, "Bu alan zorunludur.")
    .max(255, "Maksimum 255 karakter olmalıdır."),
  merchantSalt: z
    .string({ error: "Bu alan zorunludur." })
    .min(1, "Bu alan zorunludur.")
    .max(255, "Maksimum 255 karakter olmalıdır."),
  ...BasePaymentSchema.shape,
});

export const PaymentMethodSchema = z.discriminatedUnion("type", [
  IyzicoPaymentMethodSchema,
  PayTRPaymentMethodSchema,
]);

export type IyzicoPaymentMethodType = z.infer<typeof IyzicoPaymentMethodSchema>;
export type PayTRPaymentMethodType = z.infer<typeof PayTRPaymentMethodSchema>;

export type PaymentMethodType = z.infer<typeof PaymentMethodSchema>;

export type GetPaymentMethodResponseType = {
  success: boolean;
  message: string;
  data?: PaymentMethodType;
};
