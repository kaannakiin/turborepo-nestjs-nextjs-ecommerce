import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { Themev2Service } from './themev2.service';
import {
  Cuid2ZodType,
  ProductCarouselRequestSchema,
  type ProductCarouselRequestType,
} from '@repo/types';

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
      initialIds?: { id: Cuid2ZodType; isVariant: boolean }[];
      page?: number;
      limit?: number;
    },
  ) {
    return this.themev2Service.getProducts(body);
  }

  @Post('product-carousel-products')
  async getThemeV2ProductCarouselProducts(
    @Body(new ZodValidationPipe(ProductCarouselRequestSchema))
    body: ProductCarouselRequestType,
  ) {
    return this.themev2Service.getProductCarouselProducts(body);
  }
}
