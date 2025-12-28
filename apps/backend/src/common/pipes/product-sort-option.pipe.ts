import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import {
  ProductPageSortOption,
  getSortIndexFromQuery,
  SORT_OPTIONS_ARRAY,
} from '@repo/shared';

@Injectable()
export class ParseSortOptionPipe implements PipeTransform {
  transform(value: any): ProductPageSortOption {
    if (value === undefined || value === null || value === '') {
      return ProductPageSortOption.NEWEST;
    }

    const index = parseInt(value, 10);

    if (isNaN(index) || index < 0 || index >= SORT_OPTIONS_ARRAY.length) {
      throw new BadRequestException(
        `Invalid sort index: ${value}. Must be between 0 and ${SORT_OPTIONS_ARRAY.length - 1}`,
      );
    }

    return getSortIndexFromQuery(index);
  }
}
