import { UseGuards } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Locale } from '@repo/database';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { AdminProductsResponseGql } from './dto/product.model';
import {
  ProductsFilterInput,
  ProductSortInput,
} from './dto/products-filter.input';
import { ProductsGqlService } from './products-gql.service';

@Resolver()
export class ProductsGqlResolver {
  constructor(private readonly productsGqlService: ProductsGqlService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  @Query(() => AdminProductsResponseGql)
  async getProductsForAdmin(
    @Args('filter', { nullable: true }) filter: ProductsFilterInput,
    @Args('sort', { nullable: true }) sort: ProductSortInput,
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
    @Args('locale', { type: () => Locale, defaultValue: Locale.TR })
    locale: Locale,
  ) {
    return this.productsGqlService.findAll(filter, sort, page, limit, locale);
  }
}
