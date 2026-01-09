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
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  getSchemaPath,
} from '@nestjs/swagger';
import { $Enums } from '@repo/database';
import { type MainDiscount, MainDiscountSchema } from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import {
  CreateFixedAmountDiscountDto,
  CreateFixedAmountGrowPriceDto,
  CreateFixedAmountGrowQuantityDto,
  CreateFreeShippingDiscountDto,
  CreatePercentageDiscountDto,
  CreatePercentageGrowPriceDto,
  CreatePercentageGrowQuantityDto,
} from './admin-discounts-dto';
import { DiscountsService } from './discounts.service';

@ApiSecurity('token')
@ApiSecurity('csrf_header')
@Controller('/admin/discounts')
@UseGuards(JwtAuthGuard)
@Roles(['ADMIN', 'OWNER'])
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post('/upgrade-or-create')
  @ApiOperation({
    summary: 'İndirim Kampanyası Oluştur veya Güncelle',
    description: 'Kampanya türüne (type) göre gerekli alanlar değişir.',
  })
  @ApiExtraModels(
    CreatePercentageDiscountDto,
    CreatePercentageGrowQuantityDto,
    CreatePercentageGrowPriceDto,
    CreateFixedAmountDiscountDto,
    CreateFixedAmountGrowQuantityDto,
    CreateFixedAmountGrowPriceDto,
    CreateFreeShippingDiscountDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreatePercentageDiscountDto) },
        { $ref: getSchemaPath(CreatePercentageGrowQuantityDto) },
        { $ref: getSchemaPath(CreatePercentageGrowPriceDto) },
        { $ref: getSchemaPath(CreateFixedAmountDiscountDto) },
        { $ref: getSchemaPath(CreateFixedAmountGrowQuantityDto) },
        { $ref: getSchemaPath(CreateFixedAmountGrowPriceDto) },
        { $ref: getSchemaPath(CreateFreeShippingDiscountDto) },
      ],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Kampanya başarıyla oluşturuldu/güncellendi.',
  })
  @ApiResponse({ status: 400, description: 'Validasyon hatası.' })
  async upgradeOrCreateDiscount(
    @Body(new ZodValidationPipe(MainDiscountSchema)) body: MainDiscount,
  ) {
    return this.discountsService.upgradeOrCreateDiscount(body);
  }

  @Get('get-discounts')
  @ApiOperation({
    summary: 'İndirimleri Listele',
    description: 'Sayfalama ve filtreleme ile indirimleri getirir.',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Sayfa numarası',
    example: 1,
  })
  @ApiQuery({
    name: 'type',
    enum: $Enums.DiscountType,
    required: false,
    description: 'İndirim türüne göre filtrele',
  })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Başlıkta arama yap',
  })
  async getDiscounts(
    @Query('page', ParseIntPipe) page: number,
    @Query('type', new ParseEnumPipe($Enums.DiscountType, { optional: true }))
    type?: $Enums.DiscountType,
    @Query('search') search?: string,
  ) {
    return this.discountsService.getDiscounts(page, type, search);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Slug ile İndirim Getir' })
  @ApiParam({
    name: 'slug',
    type: String,
    description: 'Kampanya benzersiz link yapısı (slug)',
  })
  @ApiResponse({ status: 200, description: 'Kampanya detayları.' })
  @ApiResponse({ status: 404, description: 'Kampanya bulunamadı.' })
  async getDiscountBySlug(@Param('slug') slug: string) {
    return this.discountsService.getDiscountBySlug(slug);
  }
}
