import { Controller, Get, UseGuards } from '@nestjs/common';
import { GoogleCategoriesService } from './google-categories.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/reflectors/roles.decorator';

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
}
