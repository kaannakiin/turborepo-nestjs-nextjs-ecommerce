import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { GoogleCategoriesService } from './google-categories.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';

@Controller('/admin/products/google-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class GoogleCategoriesController {
  constructor(
    private readonly googleCategoriesService: GoogleCategoriesService,
  ) {}

  @Get('taxonomy')
  async getTaxonomy() {
    return this.googleCategoriesService.getTaxonomy();
  }

  @Get('get-taxonomies-have-no-parent')
  async getTaxonomiesHaveNoParent(@Query('id') id?: string) {
    return this.googleCategoriesService.getTaxonomiesHaveNoParent(id);
  }
  @Get('get-parent-id')
  async getParentId(@Query('id') id: string) {
    return this.googleCategoriesService.getParentId(id);
  }
}
