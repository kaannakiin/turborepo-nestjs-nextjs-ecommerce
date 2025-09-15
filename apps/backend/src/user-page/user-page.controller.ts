import { Controller, Get } from '@nestjs/common';
import { UserPageService } from './user-page.service';

@Controller('user-page')
export class UserPageController {
  constructor(private readonly userPageService: UserPageService) {}

  @Get('main-page-header-categories')
  async getMainPageHeaderCategories() {
    return this.userPageService.getHeaderCategoiresData();
  }
}
