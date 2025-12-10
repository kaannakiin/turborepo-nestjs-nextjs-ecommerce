import { Module } from '@nestjs/common';
import { ProductsGqlService } from './products-gql.service';
import { ProductsGqlResolver } from './products-gql.resolver';

@Module({
  providers: [ProductsGqlResolver, ProductsGqlService],
})
export class ProductsGqlModule {}
