import { PaymentRule, Prisma } from "@repo/database/client";
import { Pagination } from "../common";
import { PaymentRuleTree } from "./payment-rules-zod-schemas";

export type PaymentRuleListResponse = {
  success: boolean;
  data: PaymentRule[];
  pagination: Pagination;
};

export type PaymentRuleDetailResponse = {
  success: boolean;
  data?: PaymentRule;
  message?: string;
};

export type PaymentRuleMutationResponse = {
  success: boolean;
  message: string;
  id?: string;
};

export const toFlowDataJson = (
  flowData: PaymentRuleTree,
): Prisma.InputJsonValue => {
  return flowData as unknown as Prisma.InputJsonValue;
};

export const fromFlowDataJson = (
  flowData: Prisma.JsonValue,
): PaymentRuleTree | null => {
  if (!flowData) return null;
  return flowData as unknown as PaymentRuleTree;
};
