import {
  Controller,
  UseGuards
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { Themev2Service } from './themev2.service';

@Controller('admin/themev2')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class Themev2Controller {
  constructor(private readonly themev2Service: Themev2Service) {}

  // @Get('selectable-products')
  // async getSelectableProducts(
  //   @Query('search') search?: string,
  //   @Query('page', new ParseIntPipe({ optional: true })) page?: number,
  //   @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  // ) {
  //   return this.themev2Service.getProducts({ search, page, limit });
  // }

  // @Post('carousel-products')
  // async carouselProducts(
  //   @Body(new ZodValidationPipe(CarouselProductsDtoSchema))
  //   body: CarouselProductsDto,
  // ) {
  //   return this.themev2Service.carouselProducts(
  //     body.productIds,
  //     body.variantIds,
  //   );
  // }
}
