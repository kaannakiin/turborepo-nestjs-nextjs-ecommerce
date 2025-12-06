import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Cuid2ZodType } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { Themev2Service } from './themev2.service';

@Controller('admin/themev2')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class Themev2Controller {
  constructor(private readonly themev2Service: Themev2Service) {}

  @Get()
  async getThemeV2() {}

  @Post('selectable-modal-products')
  async getThemeV2Products(
    @Body()
    body: {
      search?: string;
      initialIds?: { id: string; isVariant: boolean }[];
      page?: number;
      limit?: number;
    },
  ) {
    return this.themev2Service.getProducts(body);
  }
}
