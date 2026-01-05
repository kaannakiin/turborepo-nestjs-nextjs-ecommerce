import {
  AssetType,
  CampaignOfferTargetPage,
  CampaignStatus,
  CampaignType,
  Prisma,
} from "@repo/database/client";
import {
  CrossSellingCampaignType,
  UpSellingCampaignType,
} from "./campaign-zod-schemas";

export type ProductModalData = {
  id: string;
  name: string;
  image?: string;
  sub?: ProductModalData[];
};

export type SearchableProductModalData = {
  data: ProductModalData[];
  total: number;
};

export type UpSellProductReturnType = {
  success: boolean;
  message: string;
  product?: {
    productId: string;
    productName: string;
    productSlug: string;
    price: number;
    discountedPrice?: number;
    variantId?: string;
    asset?: { url: string; type: AssetType };
    variantOptions?: Array<{
      variantGroupId: string;
      variantGroupName: string;
      variantGroupSlug: string;
      variantOptionId: string;
      variantOptionName: string;
      variantOptionSlug: string;
      variantOptionHexValue?: string;
      variantOptionAsset?: { url: string; type: AssetType };
    }>;
  };
};

export const UpSellCampaignDefaultValues: UpSellingCampaignType = {
  type: CampaignType.UP_SELLING,
  title: "",
  status: CampaignStatus.DRAFT,
  currencies: ["TRY"],
  requirements: {
    addMaxCartAmount: false,
    addMinCartAmount: false,
    maxCartAmount: null,
    minCartAmount: null,
  },
  dates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  buyableProducts: { productIds: null, variantIds: null },
  offers: [
    {
      order: 1,
      title: "",
      description: "",
      offer: {
        addCountDown: false,
        countDownMinute: null,
        discountType: "PERCENTAGE",
        discountValue: 0,
        discountValueAppliedByPrice: "price",
        showPrroductIfInCart: false,
      },
      productId: null,
      variantId: null,
    },
  ],
};

export const CrossSellingCampaignDefaultValues: CrossSellingCampaignType = {
  type: CampaignType.CROSS_SELLING,
  currencies: ["TRY"],
  status: CampaignStatus.DRAFT,
  requirements: {
    addMaxCartAmount: false,
    addMinCartAmount: false,
    maxCartAmount: null,
    minCartAmount: null,
  },
  title: "",
  dates: {
    addEndDate: false,
    addStartDate: false,
    endDate: null,
    startDate: null,
  },
  campaignOfferTargetType: CampaignOfferTargetPage.CHECKOUT_PAGE,
  conditions: { isAllProducts: true, productIds: null, variantIds: null },
  offers: [
    {
      order: 1,
      title: "",
      description: "",
      offer: {
        addCountDown: false,
        countDownMinute: null,
        discountType: "PERCENTAGE",
        discountValue: 0,
        discountValueAppliedByPrice: "price",
        showPrroductIfInCart: false,
      },
      productId: null,
      variantId: null,
    },
  ],
};

export type GetCampaignsReturnType = {
  success: boolean;
  message: string;
  data?: Prisma.CampaignGetPayload<{
    include: { _count: { select: { offers: true } } };
  }>[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
};
