import { Prisma } from "@repo/database/client";
import { Pagination } from "../common";

export const AdminInventoryTableQuery = {
  _count: {
    select: {
      serviceZones: true,
      supplierOrders: true,
      inventoryLevels: true,
    },
  },
  city: {
    select: {
      name: true,
    },
  },
  district: {
    select: {
      name: true,
    },
  },
  state: {
    select: {
      name: true,
    },
  },
  country: {
    select: {
      translations: true,
      emoji: true,
      type: true,
    },
  },
  serviceZones: {
    orderBy: {
      priority: "asc",
    },
    select: {
      id: true,
      cityIds: true,
      stateIds: true,
      countryType: true,
      priority: true,
      country: {
        select: {
          id: true,
          type: true,
        },
      },
      estimatedDeliveryDays: true,
    },
  },
} as const satisfies Prisma.InventoryLocationInclude;

export type AdminInventoryTableQueryType = Prisma.InventoryLocationGetPayload<{
  include: typeof AdminInventoryTableQuery;
}>;

export type AdminInventoryTableReturnType = {
  data: AdminInventoryTableQueryType[];
  pagination?: Pagination;
};

export const UpsertInventoryRuleFulfillmentStrategyQuery = {
  serviceZones: {
    orderBy: { priority: "asc" },
  },
  country: true,
  state: true,
  city: true,
  district: true,
} as const satisfies Prisma.InventoryLocationInclude;

export type UpsertInventoryRuleFulfillmentStrategy =
  Prisma.InventoryLocationGetPayload<{
    include: typeof UpsertInventoryRuleFulfillmentStrategyQuery;
  }>;
