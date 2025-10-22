import z from "zod";

export const CampaignOfferType = {
  CROSS_SELLING: "CROSS_SELLING",
  UP_SELLING: "UP_SELLING",
};

export type CampaignOfferType =
  (typeof CampaignOfferType)[keyof typeof CampaignOfferType];

export const CampaignOfferTargetPage = {
  CHECKOUT: "CHECKOUT",
  POST_CHECKOUT: "POST_CHECKOUT",
  PRODUCT: "PRODUCT",
};
export type CampaignOfferTargetPage =
  (typeof CampaignOfferTargetPage)[keyof typeof CampaignOfferTargetPage];

export const CrossSellingCampaignSchema = z.object({
  type: z.literal<CampaignOfferType>(CampaignOfferType.CROSS_SELLING),
});

export const UpSellingCampaignSchema = z.object({
  type: z.literal<CampaignOfferType>(CampaignOfferType.UP_SELLING),
});

export const CampaignType = z.discriminatedUnion("type", [
  CrossSellingCampaignSchema,
  UpSellingCampaignSchema,
]);
