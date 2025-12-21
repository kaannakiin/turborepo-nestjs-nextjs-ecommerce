import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { GoogleCategoriesService } from './google-categories.service';

@Controller('/admin/products/google-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class GoogleCategoriesController {
  constructor(
    private readonly googleCategoriesService: GoogleCategoriesService,
  ) {}

  @Get('get-categories-by-depth')
  async getCategoriesByDepth(
    @Query('depth', new ParseIntPipe()) depth: number,
  ) {
    return this.googleCategoriesService.getCategoriesByDepth(depth);
  }

  @Get('get-categories-by-parent-id')
  async getCategoriesByParentId(@Query('parentId') parentId: string) {
    if (!parentId || parentId === 'null') {
      return this.googleCategoriesService.getCategoriesByDepth(0);
    }
    return this.googleCategoriesService.getCategoriesByParentId(parentId);
  }

  @Get('search-categories')
  async searchCategories(@Query('search') search: string) {
    return this.googleCategoriesService.getCategoriesBySearch(search);
  }

  @Get('get-ancestor-ids-by-id')
  async getAncestorIds(@Query('id') id: string) {
    const ids = await this.googleCategoriesService.getAncestorIds(id);
    return { success: true, ids };
  }

  @Get('get-category-details-by-id')
  async getCategoryDetailsById(@Query('id') id: string) {
    const category =
      await this.googleCategoriesService.getCategoryDetailsById(id);
    if (!category) {
      return { success: false, message: 'Category not found' };
    }
    return { success: true, category };
  }
}
