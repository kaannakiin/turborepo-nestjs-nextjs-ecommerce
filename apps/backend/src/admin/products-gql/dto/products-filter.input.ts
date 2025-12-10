import { Field, Float, InputType, registerEnumType } from '@nestjs/graphql';
import { Currency, Locale } from '@repo/database';
import { ProductSortField, SortOrder } from '@repo/types';

registerEnumType(SortOrder, {
  name: 'SortOrderGql',
  description: 'Sıralama düzeni',
});

registerEnumType(ProductSortField, {
  name: 'ProductSortFieldGql',
  description: 'Ürün sıralama alanları',
});

registerEnumType(Locale, {
  name: 'LocaleGql',
  description: 'Desteklenen diller',
});

registerEnumType(Currency, {
  name: 'CurrencyGql',
  description: 'Para birimleri',
});

@InputType()
export class AttributeFilterInput {
  @Field(() => String, {
    description: 'VariantGroup ID (Örn: Renk Grubunun IDsi)',
  })
  groupId: string;

  @Field(() => [String], {
    description: 'Seçilen Option IDleri (Örn: Kırmızı, Mavi IDleri)',
  })
  optionIds: string[];
}

@InputType()
export class PriceRangeInput {
  @Field(() => Float, { nullable: true })
  min?: number;

  @Field(() => Float, { nullable: true })
  max?: number;

  @Field(() => Currency, { nullable: true, defaultValue: Currency.TRY })
  currency?: Currency;
}

@InputType()
export class ProductSortInput {
  @Field(() => ProductSortField)
  field: ProductSortField;

  @Field(() => SortOrder)
  order: SortOrder;
}

@InputType()
export class ProductsFilterInput {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => [String], {
    nullable: true,
    description: 'Kategori ID listesi (OR mantığı)',
  })
  categoryIds?: string[];

  @Field(() => [String], {
    nullable: true,
    description: 'Marka ID listesi (OR mantığı)',
  })
  brandIds?: string[];

  @Field(() => [String], { nullable: true })
  tagIds?: string[];

  @Field(() => [AttributeFilterInput], {
    nullable: true,
    description: 'Varyant özellikleri filtrelemesi',
  })
  attributes?: AttributeFilterInput[];

  @Field(() => PriceRangeInput, { nullable: true })
  priceRange?: PriceRangeInput;

  @Field(() => Boolean, { nullable: true, defaultValue: true })
  isActive?: boolean;

  @Field(() => Boolean, {
    nullable: true,
    description: 'Sadece stokta olanları getir',
  })
  hasStock?: boolean;

  @Field(() => Boolean, { nullable: true })
  isVariant?: boolean;
}
