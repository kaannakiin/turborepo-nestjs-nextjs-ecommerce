import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { type MainDiscount, MainDiscountSchema } from '@repo/types';
import { $Enums } from '@repo/database/client';

@Controller('/admin/discounts')
@UseGuards(JwtAuthGuard)
@Roles(['ADMIN', 'OWNER'])
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('/upgrade-or-create')
  async upgradeOrCreateDiscount(
    @Body(new ZodValidationPipe(MainDiscountSchema)) body: MainDiscount,
  ) {
    return this.discountsService.upgradeOrCreateDiscount(body);
  }

  @Get('get-discounts')
  async getDiscounts(
    @Query('page', new ParseIntPipe()) page: number,
    @Query('type', new ParseEnumPipe($Enums.DiscountType, { optional: true }))
    type?: $Enums.DiscountType,
    @Query('search') search?: string,
  ) {
    return this.discountsService.getDiscounts(page, type, search);
  }

  @Get(':slug')
  async getDiscountBySlug(@Param('slug') slug: string) {
    return this.discountsService.getDiscountBySlug(slug);
  }
}
