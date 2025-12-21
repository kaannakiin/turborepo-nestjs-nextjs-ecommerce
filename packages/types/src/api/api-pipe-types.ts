import { Prisma } from "@repo/database/client";
import * as z from "zod";
import { SortAdminUserTable } from "../shared/shared-enum";

export const getUsersQueries = z.object({
  search: z.string().default(""), // default boş string
  page: z.coerce.number().min(1).default(1), // query string "2" → number 2
  sortBy: z.enum(SortAdminUserTable).default(SortAdminUserTable.nameAsc),
});
export type GetUsersQueries = z.infer<typeof getUsersQueries>;

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
