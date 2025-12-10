import graphqlWrapper, { ApiError } from "@lib/wrappers/graphqlWrapper";
import { Locale } from "@repo/database/client";
import { ProductFilterFormValues } from "@repo/types";
import { gql } from "graphql-request";
import {
  AdminProductsResponseGql,
  CurrencyGql,
  ProductsFilterInput,
  ProductSortFieldGql,
  ProductSortInput,
  SortOrderGql,
} from "../../../../../../src/gql/graphql";

const GET_PRODUCTS_QUERY = gql`
  query GetProductsForAdmin(
    $filter: ProductsFilterInput
    $sort: ProductSortInput
    $page: Int
    $limit: Int
    $locale: LocaleGql
  ) {
    getProductsForAdmin(
      filter: $filter
      sort: $sort
      page: $page
      limit: $limit
      locale: $locale
    ) {
      items {
        id
        sku
        barcode
        stock
        active
        isVariant
        createdAt
        translations {
          name
        }
        prices {
          price
          currency
        }
        assets {
          asset {
            url
            type
          }
        }
        variantCombinations {
          sku
          stock
          prices {
            price
            currency
          }
          assets {
            asset {
              url
              type
            }
          }
        }
      }
      pagination {
        totalCount
        currentPage
        totalPages
      }
      success
    }
  }
`;

const mapUiFiltersToGqlInput = (
  formValues: ProductFilterFormValues,
  searchValue: string
): ProductsFilterInput => {
  const { minPrice, maxPrice, currency, ...rest } = formValues;

  const cleanArray = (arr?: string[] | null) =>
    arr && arr.length > 0 ? arr : undefined;
  const cleanBool = (val?: boolean | null) => (val === null ? undefined : val);

  return {
    search: searchValue || undefined,
    brandIds: cleanArray(rest.brandIds),
    categoryIds: cleanArray(rest.categoryIds),
    tagIds: cleanArray(rest.tagIds),
    isActive: cleanBool(rest.isActive),
    hasStock: cleanBool(rest.hasStock),
    isVariant: cleanBool(rest.isVariant),
    priceRange:
      (minPrice !== undefined && minPrice !== null) ||
      (maxPrice !== undefined && maxPrice !== null)
        ? {
            min: minPrice ?? undefined,
            max: maxPrice ?? undefined,
            currency: currency as CurrencyGql,
          }
        : undefined,
  };
};

interface FetchProductsParams {
  page?: number;
  filters: ProductFilterFormValues;
  search: string;
  limit?: number;
  sort?: ProductSortInput;
}

export const fetchProducts = async ({
  page = 1,
  filters,
  search,
  limit,
  sort,
}: FetchProductsParams) => {
  const gqlFilter = mapUiFiltersToGqlInput(filters, search);

  const response = await graphqlWrapper.request<
    { getProductsForAdmin: AdminProductsResponseGql },
    {
      filter: ProductsFilterInput;
      sort: ProductSortInput;
      page?: number;
      limit?: number;
      locale?: Locale;
    }
  >(GET_PRODUCTS_QUERY, {
    page: page || 1,
    limit: limit || 10,
    filter: gqlFilter,
    sort: sort || {
      field: ProductSortFieldGql.CreatedAt,
      order: SortOrderGql.Desc,
    },
    locale: "TR",
  });

  if (!response.success) {
    const error = response as ApiError;
    throw new Error(error.error || "Veri alınamadı");
  }

  return response.data?.getProductsForAdmin;
};
