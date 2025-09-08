import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  type Cuid2ZodType,
  DiscountSchema,
  type DiscountZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/reflectors/roles.decorator';
import { DiscountsService } from './discounts.service';

@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('create-or-update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  @UsePipes(new ZodValidationPipe(DiscountSchema))
  async createOrUpdateProduct(@Body() body: DiscountZodType): Promise<any> {
    return this.discountsService.createOrUpdateDiscount(body);
  }

  @Get('get-discount-for-admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  async getDiscountForAdmin(
    @Param('id') id: Cuid2ZodType,
  ): Promise<DiscountZodType> {
    return this.discountsService.getDiscountById(id);
  }

  @Get('get-all-discounts-for-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  async getAllDiscountsForAdmin(
    @Query('search') search: string,
    @Query('page') page: string,
  ) {
    const pageNumber = parseInt(page) || 1;
    return this.discountsService.getAllDiscountsForAdmin(search, pageNumber);
  }

  @Delete('delete-discount/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(['ADMIN', 'OWNER'])
  async deleteDiscount(@Param('id') id: Cuid2ZodType) {
    return this.discountsService.softDeleteDiscount(id);
  }
}
