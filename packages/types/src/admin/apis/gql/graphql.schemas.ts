export const SortOrder = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

export const ProductSortField = {
  CREATED_AT: "createdAt",
  PRICE: "price",
  NAME: "name",
  STOCK: "stock",
};

export type ProductSortField =
  (typeof ProductSortField)[keyof typeof ProductSortField];
