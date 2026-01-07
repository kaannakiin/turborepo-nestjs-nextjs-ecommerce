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
  UsePipes,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { LocationType } from '@repo/database';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import {
  FullfillmentStrategyDto,
  GetFulfillmentStrategiesQueryDto,
  UpsertInventoryLocationDto,
} from './inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Admin / Inventory')
@ApiSecurity('token')
@ApiSecurity('csrf_header')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('location')
  @ApiOperation({
    summary: 'Envanter Lokasyonu Ekle/Güncelle',
    description:
      'Depo veya mağaza lokasyonlarını oluşturur veya günceller. Servis bölgeleri (Service Zones) validasyonu dahildir.',
  })
  @ApiResponse({ status: 201, description: 'Lokasyon başarıyla kaydedildi.' })
  @ApiResponse({
    status: 400,
    description:
      'Validasyon hatası (örn: Eksik ülke/şehir bilgisi, çakışan bölgeler).',
  })
  @UsePipes(ZodValidationPipe)
  async upsertInventoryLocation(@Body() body: UpsertInventoryLocationDto) {
    return this.inventoryService.upsertInventoryLocation(body);
  }

  @Get('location')
  @ApiOperation({ summary: 'Envanter Lokasyonlarını Listele' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'İsim veya adres bazlı arama',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 24, type: Number })
  @ApiQuery({
    name: 'type',
    enum: LocationType,
    required: false,
    description: 'Lokasyon tipine göre filtrele (WAREHOUSE, STORE vb.)',
  })
  async getInventoryLocations(
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true }))
    page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true }))
    limit: number = 24,
    @Query('type', new ParseEnumPipe(LocationType, { optional: true }))
    type?: LocationType,
  ) {
    return this.inventoryService.getInventoryLocations(
      page,
      limit,
      search,
      type,
    );
  }

  @Get('location/:id')
  @ApiOperation({ summary: 'ID ile Lokasyon Detayı Getir' })
  @ApiParam({ name: 'id', description: 'Lokasyon unique ID (Cuid2)' })
  @ApiResponse({ status: 200, description: 'Lokasyon detayları.' })
  @ApiResponse({ status: 404, description: 'Lokasyon bulunamadı.' })
  async getInventoryLocationById(@Param('id') id: string) {
    return this.inventoryService.getInventoryLocationById(id);
  }

  @Post('inventory-rule-fulfillment-strategy')
  @ApiOperation({
    summary: 'Fulfillment Stratejisi Ekle veya Güncelle (Upsert)',
    description: `
      Gelişmiş karar ağacı (Decision Tree) ve ayarları içeren teslimat stratejilerini yönetir.
      - **uniqueId** alanı dolu gelirse mevcut kaydı günceller.
      - **uniqueId** boş gelirse yeni bir strateji oluşturur.
      - **isDefault: true** gönderilirse, sistemdeki diğer aktif stratejilerin varsayılan özelliği kaldırılır.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Strateji başarıyla oluşturuldu veya güncellendi.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Validasyon hatası. Karar ağacı yapısı veya zorunlu alanlar hatalı.',
  })
  @ApiResponse({
    status: 500,
    description: 'Sunucu hatası veya veritabanı işlemi başarısız.',
  })
  @UsePipes(ZodValidationPipe)
  async upsertInventoryRuleFulfillmentStrategy(
    @Body() body: FullfillmentStrategyDto,
  ) {
    return this.inventoryService.upsertInventoryRuleFulfillmentStrategy(body);
  }

  @Get('fulfillment-strategies')
  @ApiOperation({
    summary: 'Fulfillment Stratejilerini Listele',
    description: 'Sayfalama ve arama desteği ile stratejileri getirir.',
  })
  @ApiResponse({
    status: 200,
    description: 'Strateji listesi ve sayfalama bilgisi döner.',
  })
  @UsePipes(ZodValidationPipe)
  async getFulfillmentStrategies(
    @Query() query: GetFulfillmentStrategiesQueryDto,
  ) {
    return this.inventoryService.getFulfillmentStrategies(query);
  }
}
