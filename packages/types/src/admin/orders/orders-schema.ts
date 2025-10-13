import { Prisma } from "@repo/database";
import * as z from "zod";

export type GetOrderReturnType = {
  success: boolean;
  message: string;
  orders?: Prisma.OrderGetPayload<{
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
