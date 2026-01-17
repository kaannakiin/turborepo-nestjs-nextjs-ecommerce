import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ProductPageSortOption } from '@repo/types';

@Injectable()
export class ParseSortOptionPipe implements PipeTransform {
  transform(value: any): ProductPageSortOption {
    if (value === undefined || value === null || value === '') {
      return ProductPageSortOption.NEWEST;
    }

    const index = parseInt(value, 10);

    if (
      isNaN(index) ||
      index < 0 ||
      index >= Object.values(ProductPageSortOption).length
    ) {
      throw new BadRequestException(
        `Invalid sort index: ${value}. Must be between 0 and ${Object.values(ProductPageSortOption).length - 1}`,
      );
    }

    return Object.values(ProductPageSortOption)[index];
  }
}
