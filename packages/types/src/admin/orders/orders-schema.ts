import { Prisma } from "@repo/database/client";
import * as z from "zod";

export type GetOrdersReturnType = {
  success: boolean;
  message: string;
  orders?: Prisma.OrderSchemaGetPayload<{
    include: {
      user: {
        select: {
          name: true;
          surname: true;
          email: true;
          phone: true;
          imageUrl: true;
        };
      };
      orderItems: true;
    };
  }>[];
  pagination?: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export const GetOrdersSchema = z.object({
  page: z.number().int().min(1, "Page must be at least 1"),
  orderStatus: z.number().int().optional(),
  paymentStatus: z.number().int().optional(),
  search: z.string().optional(),
});

export type GetOrderZodType = z.infer<typeof GetOrdersSchema>;

type BaseOrderPayload = Prisma.OrderSchemaGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        phone: true;
        surname: true;
      };
    };
    orderItems: true;
  };
}>;

type ExtendedOrder = Omit<BaseOrderPayload, "user"> & {
  user: BaseOrderPayload["user"] & {
    successfulOrderCount: number;
  };
};

export type GetOrderReturnType = {
  success: boolean;
  message: string;
  order?: ExtendedOrder; // Artık genişletilmiş tipi kullanıyoruz
};
