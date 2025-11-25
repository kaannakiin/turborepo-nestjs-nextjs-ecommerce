import { Prisma } from "@repo/database/client";
import { Pagination } from "../../shared-schema";

export type CartWhereInput = Prisma.CartWhereInput;
export type GetAllCartsReturnType = {
  success: boolean;
  message: string;
  data?: {
    carts: Prisma.CartGetPayload<{
      include: {
        user: true;
        _count: {
          select: {
            items: true;
            orderAttempts: true;
          };
        };
      };
    }>[];
    pagination: Pagination;
  };
};
