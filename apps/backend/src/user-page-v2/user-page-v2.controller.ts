import { Controller, Get, Param, Query } from '@nestjs/common';
import { UserPageV2Service } from './user-page-v2.service';

@Controller('user-page-v2')
export class UserPageV2Controller {
  constructor(private readonly userPageV2Service: UserPageV2Service) {}
  @Get('get-category/:slug')
  getCategoryBySlug(
    @Param('slug') slug: string,
    @Query() query: Record<string, string | string[]>,
  ) {
    return this.userPageV2Service.getCategoryBySlug(slug, 'TR', query);
  }
}
