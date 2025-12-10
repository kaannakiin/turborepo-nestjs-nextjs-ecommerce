import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { Currency } from '@repo/database';

@ObjectType()
export class AssetSelectGql {
  @Field(() => String, { nullable: true })
  url?: string;

  @Field(() => String, { nullable: true })
  type?: string;
}

@ObjectType()
export class VariantGroupSelectGql {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  type?: string;

  @Field(() => [ProductTranslationGql], { nullable: 'itemsAndList' })
  translations: ProductTranslationGql[];
}

@ObjectType()
export class VariantOptionSelectGql {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  hexValue?: string;

  @Field(() => [ProductTranslationGql], { nullable: 'itemsAndList' })
  translations: ProductTranslationGql[];

  @Field(() => AssetSelectGql, { nullable: true })
  asset?: AssetSelectGql;

  @Field(() => VariantGroupSelectGql, { nullable: true })
  variantGroup?: VariantGroupSelectGql;
}

@ObjectType()
export class ProductVariantGroupSelectGql {
  @Field(() => String, { nullable: true })
  renderVisibleType?: string;
}

@ObjectType()
export class ProductVariantOptionWrapperGql {
  @Field(() => VariantOptionSelectGql, { nullable: true })
  variantOption?: VariantOptionSelectGql;

  @Field(() => ProductVariantGroupSelectGql, { nullable: true })
  productVariantGroup?: ProductVariantGroupSelectGql;
}

@ObjectType()
export class CombinationOptionGql {
  @Field(() => ProductVariantOptionWrapperGql, { nullable: true })
  productVariantOption?: ProductVariantOptionWrapperGql;
}

@ObjectType()
export class ProductTranslationGql {
  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  description?: string;
}

@ObjectType()
export class ProductPriceGql {
  @Field(() => Float)
  price: number;

  @Field(() => Currency)
  currency: Currency;
}

@ObjectType()
export class ProductAssetWrapperGql {
  @Field(() => AssetSelectGql, { nullable: true })
  asset?: AssetSelectGql;
}

@ObjectType()
export class ProductVariantCombinationGql {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  sku?: string;

  @Field(() => String, { nullable: true })
  barcode?: string;

  @Field(() => Int)
  stock: number;

  @Field(() => [ProductPriceGql], { nullable: 'itemsAndList' })
  prices: ProductPriceGql[];

  @Field(() => [ProductAssetWrapperGql], { nullable: 'itemsAndList' })
  assets: ProductAssetWrapperGql[];

  @Field(() => [CombinationOptionGql], { nullable: 'itemsAndList' })
  options: CombinationOptionGql[];
}

@ObjectType()
export class ProductGqlModel {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  sku?: string;

  @Field(() => String, { nullable: true })
  barcode?: string;

  @Field(() => Int)
  stock: number;

  @Field(() => Boolean)
  active: boolean;

  @Field(() => Boolean)
  isVariant: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [ProductTranslationGql], { nullable: 'itemsAndList' })
  translations: ProductTranslationGql[];

  @Field(() => [ProductPriceGql], { nullable: 'itemsAndList' })
  prices: ProductPriceGql[];

  @Field(() => [ProductAssetWrapperGql], { nullable: 'itemsAndList' })
  assets: ProductAssetWrapperGql[];

  @Field(() => [ProductVariantCombinationGql], { nullable: 'itemsAndList' })
  variantCombinations: ProductVariantCombinationGql[];
}

@ObjectType()
export class PaginationMetaGql {
  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  currentPage: number;

  @Field(() => Int)
  totalPages: number;

  @Field(() => Int)
  perPage: number;
}

@ObjectType()
export class AdminProductsResponseGql {
  @Field(() => [ProductGqlModel])
  items: ProductGqlModel[];

  @Field(() => PaginationMetaGql, { nullable: true })
  pagination?: PaginationMetaGql;

  @Field(() => Boolean)
  success: boolean;
}
