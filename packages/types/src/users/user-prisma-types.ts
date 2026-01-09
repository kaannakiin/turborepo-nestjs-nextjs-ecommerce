import { User } from "@repo/database/client";

export type GetUsersQueriesReturnType = {
  users: User[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export const AdminUserTableBulkActions = {
  DELETE: "DELETE",
  UPDATE_ROLE: "UPDATE_ROLE",
  UPDATE_GROUP: "UPDATE_GROUP",
} as const;

export type AdminUserTableBulkActions =
  (typeof AdminUserTableBulkActions)[keyof typeof AdminUserTableBulkActions];
