import { Prisma } from "@repo/database/client";

export type GetUsersQueriesReturnType = {
  users: Prisma.UserGetPayload<{
    select: {
      id: true;
      name: true;
      email: true;
      role: true;
      surname: true;
      phone: true;
      createdAt: true;
      updatedAt: true;
    };
  }>[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};
