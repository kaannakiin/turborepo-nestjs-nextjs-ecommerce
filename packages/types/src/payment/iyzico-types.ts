import { $Enums } from "@repo/database";

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

export type CardAssociation =
  | "MASTER_CARD"
  | "VISA"
  | "TROY"
  | "AMERICAN_EXPRESS";

export type CardFamilyName =
  | "Bonus"
  | "Axess"
  | "World"
  | "Maximum"
  | "Paraf"
  | "CardFinans"
  | "Advantage";

export interface BinCheckRequest {
  locale: IyzLocale;
  binNumber: string;
  conversationId: string;
}

export interface BinCheckFailureResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
}
export interface BinCheckSuccessResponse {
  status: "success";
  binNumber: string;
  cardType: CardType;
  cardAssociation: CardAssociation;
  cardFamily: CardFamilyName;
  bankName: string;
  bankCode: number;
  commercial: number;
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
}

export type BinCheckResponse =
  | BinCheckSuccessResponse
  | BinCheckFailureResponse;

export interface InstallmentRequest {
  locale: IyzLocale;
  price: number;
  binNumber: string;
  conversationId: string;
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

export interface InstallmentSuccessResponse {
  status: "success";
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
  installmentDetails: InstallmentDetail[];
}

export interface InstallmentFailureResponse {
  status: "failure";
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
  errorCode: string;
  errorMessage: string;
}

export type InstallmentResponse =
  | InstallmentSuccessResponse
  | InstallmentFailureResponse;

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
export interface ThreeDSRequest {
  locale: IyzLocale;
  conversationId: string;
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

export interface ThreeDSSuccessResponse {
  status: "success";
  locale: IyzLocale;
  systemTime: number;
  threeDSHtmlContent: string;
  paymentId: string;
  signature: string;
  conversationId: string;
}
export interface ThreeDSFailureResponse {
  status: "failure";
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
  errorCode: string;
  errorMessage: string;
}

export type ThreeDSResponse = ThreeDSSuccessResponse | ThreeDSFailureResponse;
export interface NonThreeDSRequest
  extends Omit<ThreeDSRequest, "callbackUrl"> {}

// Başarılı Non-ThreeDS Response
export interface NonThreeDSSuccessResponse {
  status: "success";
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
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
export interface NonThreeDSFailureResponse {
  status: "failure";
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
  errorCode: string;
  errorMessage: string;
}

export type NonThreeDSResponse =
  | NonThreeDSSuccessResponse
  | NonThreeDSFailureResponse;
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

export interface ThreeDCallback {
  status: IyzStatus;
  paymentId: string;
  conversationData?: string;
  conversationId: string;
  mdStatus: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "-1";
  signature: string;
}

export interface CompleteThreeDSRequest {
  locale: IyzLocale;
  paymentId: string;
  conversationId: string;
  conversationData?: string;
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

// Başarılı Complete 3DS Response
export interface CompleteThreeDSSuccessResponse {
  status: "success";
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
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
  mdStatus: number;
  hostReference: string;
  signature: string;
}

// Başarısız Complete 3DS Response
export interface CompleteThreeDSFailureResponse {
  status: "failure";
  errorCode: string;
  errorMessage: string;
  locale: IyzLocale;
  systemTime: number;
  conversationId: string;
}

// Union type
export type CompleteThreeDSResponse =
  | CompleteThreeDSSuccessResponse
  | CompleteThreeDSFailureResponse;

export enum IyzicoWebhookStatus {
  FAILURE = "FAILURE",
  SUCCESS = "SUCCESS",
  INIT_THREEDS = "INIT_THREEDS",
  CALLBACK_THREEDS = "CALLBACK_THREEDS",
  BKM_POS_SELECTED = "BKM_POS_SELECTED",
  INIT_APM = "INIT_APM",
  INIT_CONTACTLESS = "INIT_CONTACTLESS",
}

// Webhook event type enum
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
  /**
   * İlgili ödemenin üye işyeri tarafından gönderilmiş referans numarası
   */
  paymentConversationId: string;

  /**
   * Merchant'ın iyzico tarafından atanmış ID numarası
   */
  merchantId: string;

  /**
   * İlgili ödemenin paymentId bilgisi
   */
  paymentId: string;

  /**
   * Ödeme durumu
   * Alabileceği değerler: FAILURE, SUCCESS, INIT_THREEDS,
   * CALLBACK_THREEDS, BKM_POS_SELECTED, INIT_APM, INIT_CONTACTLESS
   */
  status: IyzicoWebhookStatus;

  /**
   * İstek için üretilen unique iyzico referans kodu
   */
  iyziReferenceCode: string;

  /**
   * İstek tipini belirtir
   * Alabileceği değerler: PAYMENT_API, API_AUTH, THREE_DS_AUTH,
   * THREE_DS_CALLBACK, BKM_AUTH, BALANCE,
   * CONTACTLESS_AUTH, CONTACTLESS_REFUND
   */
  iyziEventType: IyzicoWebhookEventType;

  /**
   * Notification oluşturulma zamanının unix timestamp değeridir
   */
  iyziEventTime: number;

  /**
   * Ödemeye ait ilgili paymentId
   */
  iyziPaymentId: number;
}
