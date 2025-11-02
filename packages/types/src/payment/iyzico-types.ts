import { $Enums, CardAssociation, CardFamilyName } from "@repo/database";

export type IyzLocale = "tr" | "en";
export type CardType = "CREDIT_CARD" | "DEBIT_CARD" | "PREPAID_CARD";
export type PaymentGroup = "PRODUCT" | "LISTING" | "SUBSCRIPTION";
export type IyzStatus = "success" | "failure";
export type PaymentChannel =
  | "WEB"
  | "MOBILE"
  | "MOBILE_WEB"
  | "MOBILE_IOS"
  | "MOBILE_ANDROID"
  | "MOBILE_WINDOWS"
  | "MOBILE_TABLET"
  | "MOBILE_PHONE";

export interface IyzicoBaseRequest {
  locale: IyzLocale;
  conversationId: string;
}

export interface IyzicoBaseResponse {
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
}

export interface IyzicoSuccessResponse extends IyzicoBaseResponse {
  status: "success";
}

export interface IyzicoFailureResponse extends IyzicoBaseResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
}

export interface BasketItem {
  id: string;
  price: number;
  name: string;
  category1: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  category2?: string;
  subMerchantKey?: string;
  subMerchantPrice?: string;
}
export interface PaymentCard {
  cardHolderName: string;
  cardNumber: string;
  expireMonth: string;
  expireYear: string;
  cvc: string;
  registerCard?: number;
}
export interface Buyer {
  id: string;
  name: string;
  surname: string;
  identityNumber: string;
  email: string;
  gsmNumber: string;
  city: string;
  country: string;
  zipCode?: string;
  registrationAddress: string;
  lastLoginDate?: string;
  registrationDate?: string;
  ip?: string;
}
export interface IyzicoAddress {
  address: string;
  zipCode?: string;
  contactName: string;
  city: string;
  country: string;
}
export interface ItemTransaction {
  itemId: string;
  paymentTransactionId: string;
  transactionStatus: number;
  price: number;
  paidPrice: number;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  blockageRate: number;
  blockageRateAmountMerchant: number;
  blockageRateAmountSubMerchant: number;
  blockageResolvedDate: string;
  subMerchantPrice: number;
  subMerchantPayoutRate: number;
  subMerchantPayoutAmount: number;
  merchantPayoutAmount: number;
  convertedPayout: {
    paidPrice: number;
    iyziCommissionRateAmount: number;
    iyziCommissionFee: number;
    blockageRateAmountMerchant: number;
    blockageRateAmountSubMerchant: number;
    subMerchantPayoutAmount: number;
    merchantPayoutAmount: number;
    iyziConversionRate: number;
    iyziConversionRateAmount: number;
    currency: string;
  };
}

export interface BinCheckRequest extends IyzicoBaseRequest {
  binNumber: string;
}

export interface BinCheckSuccessResponse extends IyzicoSuccessResponse {
  binNumber: string;
  cardType: CardType;
  cardAssociation: CardAssociation;
  cardFamily: CardFamilyName;
  bankName: string;
  bankCode: number;
  commercial: number;
}

export type BinCheckResponse = BinCheckSuccessResponse | IyzicoFailureResponse;

export interface InstallmentRequest extends IyzicoBaseRequest {
  price: number;
  binNumber: string;
}

export interface InstallmentPrice {
  installmentPrice: number;
  totalPrice: number;
  installmentNumber: number;
}

export interface InstallmentDetail {
  binNumber: string;
  price: number;
  cardType: CardType;
  cardAssociation: CardAssociation;
  cardFamilyName: CardFamilyName;
  force3ds: number;
  bankCode: number;
  bankName: string;
  forceCvc: number;
  commercial: number;
  dccEnabled: number;
  agricultureEnabled: number;
  installmentPrices: InstallmentPrice[];
}

export interface InstallmentSuccessResponse extends IyzicoSuccessResponse {
  installmentDetails: InstallmentDetail[];
}

export type InstallmentResponse =
  | InstallmentSuccessResponse
  | IyzicoFailureResponse;

export interface BasePaymentSuccessData {
  price: number;
  paidPrice: number;
  installment: number;
  paymentId: string;
  fraudStatus: number;
  merchantCommissionRate: number;
  merchantCommissionRateAmount: number;
  iyziCommissionRateAmount: number;
  iyziCommissionFee: number;
  cardType: CardType;
  cardAssociation: CardAssociation;
  cardFamily: CardFamilyName;
  binNumber: string;
  lastFourDigits: string;
  basketId: string;
  currency: $Enums.Currency;
  itemTransactions: ItemTransaction[];
  authCode: string;
  phase: string;
  hostReference: string;
  signature: string;
}

export interface ThreeDSRequest extends IyzicoBaseRequest {
  price: number;
  paidPrice: number;
  currency?: $Enums.Currency;
  installment?: number;
  basketId?: string;
  paymentGroup?: PaymentGroup;
  callbackUrl: string;
  paymentCard: PaymentCard;
  buyer: Buyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: BasketItem[];
  paymentChannel?: PaymentChannel;
}

export interface ThreeDSSuccessResponse extends IyzicoSuccessResponse {
  threeDSHtmlContent: string;
  paymentId: string;
  signature: string;
}

export type ThreeDSResponse = ThreeDSSuccessResponse | IyzicoFailureResponse;

export interface NonThreeDSRequest
  extends Omit<ThreeDSRequest, "callbackUrl"> {}

export interface NonThreeDSSuccessResponse
  extends IyzicoSuccessResponse,
    BasePaymentSuccessData {}

export type NonThreeDSResponse =
  | NonThreeDSSuccessResponse
  | IyzicoFailureResponse;

export interface ThreeDCallback {
  status: IyzStatus;
  paymentId: string;
  conversationData?: string;
  conversationId: string;
  mdStatus: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "-1";
  signature: string;
}

export interface CompleteThreeDSRequest extends IyzicoBaseRequest {
  paymentId: string;
  conversationData?: string;
}

export interface CompleteThreeDSSuccessResponse
  extends IyzicoSuccessResponse,
    BasePaymentSuccessData {
  mdStatus: number;
}

export type CompleteThreeDSResponse =
  | CompleteThreeDSSuccessResponse
  | IyzicoFailureResponse;

export interface SignatureValidationData {
  paymentId?: string;
  conversationId: string;
  currency?: string;
  basketId?: string;
  paidPrice?: number;
  price?: number;
  conversationData?: string;
  mdStatus?: string;
  status?: string;
  signature: string;
}

export type PaymentReqReturnType = {
  success: boolean;
  message: string;
  threeDSHtmlContent?: string;
};

export enum IyzicoWebhookStatus {
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
  INIT_THREEDS = "INIT_THREEDS",
  CALLBACK_THREEDS = "CALLBACK_THREEDS",
  BKM_POS_SELECTED = "BKM_POS_SELECTED",
  INIT_APM = "INIT_APM",
  INIT_CONTACTLESS = "INIT_CONTACTLESS",
}

export enum IyzicoWebhookEventType {
  PAYMENT_API = "PAYMENT_API",
  API_AUTH = "API_AUTH",
  THREE_DS_AUTH = "THREE_DS_AUTH",
  THREE_DS_CALLBACK = "THREE_DS_CALLBACK",
  BKM_AUTH = "BKM_AUTH",
  BALANCE = "BALANCE",
  CONTACTLESS_AUTH = "CONTACTLESS_AUTH",
  CONTACTLESS_REFUND = "CONTACTLESS_REFUND",
}
export interface IyzicoWebhookPayload {
  paymentConversationId: string;
  merchantId: string;
  paymentId: string;
  status: IyzicoWebhookStatus;
  iyziReferenceCode: string;
  iyziEventType: IyzicoWebhookEventType;
  iyziEventTime: number;
  iyziPaymentId: number;
}
