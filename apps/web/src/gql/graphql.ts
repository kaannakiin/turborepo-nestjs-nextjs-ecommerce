/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AdminProductsResponseGql = {
  __typename?: 'AdminProductsResponseGql';
  items: Array<ProductGqlModel>;
  pagination?: Maybe<PaginationMetaGql>;
  success: Scalars['Boolean']['output'];
};

export type AssetSelectGql = {
  __typename?: 'AssetSelectGql';
  type?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type AttributeFilterInput = {
  /** VariantGroup ID (Örn: Renk Grubunun IDsi) */
  groupId: Scalars['String']['input'];
  /** Seçilen Option IDleri (Örn: Kırmızı, Mavi IDleri) */
  optionIds: Array<Scalars['String']['input']>;
};

export type CombinationOptionGql = {
  __typename?: 'CombinationOptionGql';
  productVariantOption?: Maybe<ProductVariantOptionWrapperGql>;
};

/** Para birimleri */
export enum CurrencyGql {
  Eur = 'EUR',
  Gbp = 'GBP',
  Try = 'TRY',
  Usd = 'USD'
}

/** Desteklenen diller */
export enum LocaleGql {
  De = 'DE',
  En = 'EN',
  Tr = 'TR'
}

export type PaginationMetaGql = {
  __typename?: 'PaginationMetaGql';
  currentPage: Scalars['Int']['output'];
  perPage: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PriceRangeInput = {
  currency?: InputMaybe<CurrencyGql>;
  max?: InputMaybe<Scalars['Float']['input']>;
  min?: InputMaybe<Scalars['Float']['input']>;
};

export type ProductAssetWrapperGql = {
  __typename?: 'ProductAssetWrapperGql';
  asset?: Maybe<AssetSelectGql>;
};

export type ProductGqlModel = {
  __typename?: 'ProductGqlModel';
  active: Scalars['Boolean']['output'];
  assets?: Maybe<Array<Maybe<ProductAssetWrapperGql>>>;
  barcode?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isVariant: Scalars['Boolean']['output'];
  prices?: Maybe<Array<Maybe<ProductPriceGql>>>;
  sku?: Maybe<Scalars['String']['output']>;
  stock: Scalars['Int']['output'];
  translations?: Maybe<Array<Maybe<ProductTranslationGql>>>;
  variantCombinations?: Maybe<Array<Maybe<ProductVariantCombinationGql>>>;
};

export type ProductPriceGql = {
  __typename?: 'ProductPriceGql';
  currency: CurrencyGql;
  price: Scalars['Float']['output'];
};

/** Ürün sıralama alanları */
export enum ProductSortFieldGql {
  CreatedAt = 'CREATED_AT',
  Name = 'NAME',
  Price = 'PRICE',
  Stock = 'STOCK'
}

export type ProductSortInput = {
  field: ProductSortFieldGql;
  order: SortOrderGql;
};

export type ProductTranslationGql = {
  __typename?: 'ProductTranslationGql';
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ProductVariantCombinationGql = {
  __typename?: 'ProductVariantCombinationGql';
  assets?: Maybe<Array<Maybe<ProductAssetWrapperGql>>>;
  barcode?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  options?: Maybe<Array<Maybe<CombinationOptionGql>>>;
  prices?: Maybe<Array<Maybe<ProductPriceGql>>>;
  sku?: Maybe<Scalars['String']['output']>;
  stock: Scalars['Int']['output'];
};

export type ProductVariantGroupSelectGql = {
  __typename?: 'ProductVariantGroupSelectGql';
  renderVisibleType?: Maybe<Scalars['String']['output']>;
};

export type ProductVariantOptionWrapperGql = {
  __typename?: 'ProductVariantOptionWrapperGql';
  productVariantGroup?: Maybe<ProductVariantGroupSelectGql>;
  variantOption?: Maybe<VariantOptionSelectGql>;
};

export type ProductsFilterInput = {
  /** Varyant özellikleri filtrelemesi */
  attributes?: InputMaybe<Array<AttributeFilterInput>>;
  /** Marka ID listesi (OR mantığı) */
  brandIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Kategori ID listesi (OR mantığı) */
  categoryIds?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Sadece stokta olanları getir */
  hasStock?: InputMaybe<Scalars['Boolean']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isVariant?: InputMaybe<Scalars['Boolean']['input']>;
  priceRange?: InputMaybe<PriceRangeInput>;
  search?: InputMaybe<Scalars['String']['input']>;
  tagIds?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type Query = {
  __typename?: 'Query';
  getProductsForAdmin: AdminProductsResponseGql;
};


export type QueryGetProductsForAdminArgs = {
  filter?: InputMaybe<ProductsFilterInput>;
  limit?: Scalars['Int']['input'];
  locale?: LocaleGql;
  page?: Scalars['Int']['input'];
  sort?: InputMaybe<ProductSortInput>;
};

/** Sıralama düzeni */
export enum SortOrderGql {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type VariantGroupSelectGql = {
  __typename?: 'VariantGroupSelectGql';
  id: Scalars['String']['output'];
  translations?: Maybe<Array<Maybe<ProductTranslationGql>>>;
  type?: Maybe<Scalars['String']['output']>;
};

export type VariantOptionSelectGql = {
  __typename?: 'VariantOptionSelectGql';
  asset?: Maybe<AssetSelectGql>;
  hexValue?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  translations?: Maybe<Array<Maybe<ProductTranslationGql>>>;
  variantGroup?: Maybe<VariantGroupSelectGql>;
};
