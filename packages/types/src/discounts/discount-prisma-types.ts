import { AllowedDiscountedItemsBy, Prisma } from "@repo/database/client";

export type GetAllDiscountReturnType = {
  success: boolean;
  message: string;
  data: Prisma.DiscountGetPayload<{
    include: {
      _count: {
        select: {
          usages: true;
        };
      };
    };
  }>[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export type DiscountItem = {
  id: string;
  name: string;
  sub?: DiscountItem[];
};

export type FlatItem = {
  id: string;
  name: string;
  parentId: string | null;
};

export type AllUsersReturnType = {
  id: string;
  name: string;
  surname: string;
  email?: string;
  phone?: string;
};

export type CommonDiscountPrismaData = {
  title: string;
  startDate: Date | null;
  endDate: Date | null;
  isLimitPurchase: boolean;
  minPurchaseAmount: number | null;
  maxPurchaseAmount: number | null;
  isLimitItemQuantity: boolean;
  minItemQuantity: number | null;
  maxItemQuantity: number | null;
  allowDiscountedItems: boolean;
  allowedDiscountedItemsBy: AllowedDiscountedItemsBy | null;
  mergeOtherCampaigns: boolean;
  isLimitTotalUsage: boolean;
  totalUsageLimit: number | null;
  isLimitTotalUsagePerCustomer: boolean;
  totalUsageLimitPerCustomer: number | null;
  isAllCustomers: boolean;
  isAllProducts: boolean;
};

export type DiscountUpsertResponse = {
  success: boolean;
  message: string;
  discountId: string;
};
