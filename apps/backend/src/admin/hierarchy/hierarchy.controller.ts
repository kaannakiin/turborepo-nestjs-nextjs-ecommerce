import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';

@Controller('admin/hierarchy')
export class HierarchyController {
  constructor(private readonly helperService: HierarchyService) {}

  @Get('categories-hierarchy')
  async getCategoriesHierarchy(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
  ) {
    return this.helperService.getCategoriesHierarchy(limit, page, search);
  }

  @Get('brands-hierarchy')
  async getBrandsHierarchy(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
  ) {
    return this.helperService.getBrandsHierarchy(limit, page, search);
  }

  @Get('tags-hierarchy')
  async getTagsHierarchy(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
  ) {
    return this.helperService.getTagsHierarchy(limit, page, search);
  }
}
