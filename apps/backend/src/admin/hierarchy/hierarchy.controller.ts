import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { Locale } from '@repo/database';
import { ActiveLocale } from '../../common/decorators/active-locale.decorator';
import { HierarchyService } from './hierarchy.service';

@Controller('admin/hierarchy')
export class HierarchyController {
  constructor(private readonly helperService: HierarchyService) {}

  @Get('categories-hierarchy')
  async getCategoriesHierarchy(
    @ActiveLocale() locale: Locale,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
  ) {
    return this.helperService.getCategoriesHierarchy(
      locale,
      limit,
      page,
      search,
    );
  }

  @Get('brands-hierarchy')
  async getBrandsHierarchy(
    @ActiveLocale() locale: Locale,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
  ) {
    return this.helperService.getBrandsHierarchy(locale, limit, page, search);
  }

  @Get('tags-hierarchy')
  async getTagsHierarchy(
    @ActiveLocale() locale: Locale,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
  ) {
    return this.helperService.getTagsHierarchy(locale, limit, page, search);
  }
}
