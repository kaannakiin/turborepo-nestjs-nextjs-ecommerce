import { PaymentMethodType } from "./payment-method-zod-schema";

export type GetPaymentMethodResponseType = {
  success: boolean;
  message: string;
  data?: PaymentMethodType;
};
