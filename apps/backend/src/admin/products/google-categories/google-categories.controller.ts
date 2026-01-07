import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { GoogleCategoriesService } from './google-categories.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Admin / Products / Google Categories')
@ApiSecurity('token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/google-categories')
export class GoogleCategoriesController {
  constructor(
    private readonly googleCategoriesService: GoogleCategoriesService,
  ) {}

  @Get('get-categories-by-depth')
  @ApiOperation({ summary: 'Kategorileri Derinliğe Göre Getir' })
  @ApiQuery({
    name: 'depth',
    type: Number,
    description: 'Kategori derinliği (0: Ana kategoriler, 1: Alt kategoriler)',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Belirtilen derinlikteki kategoriler.',
  })
  async getCategoriesByDepth(@Query('depth', ParseIntPipe) depth: number) {
    return this.googleCategoriesService.getCategoriesByDepth(depth);
  }

  @Get('get-categories-by-parent-id')
  @ApiOperation({ summary: "Üst Kategori ID'sine Göre Alt Kategorileri Getir" })
  @ApiQuery({
    name: 'parentId',
    type: String,
    required: false,
    description:
      'Üst kategori ID (Boş bırakılırsa veya "null" gönderilirse ana kategoriler döner)',
  })
  async getCategoriesByParentId(@Query('parentId') parentId: string) {
    if (!parentId || parentId === 'null') {
      return this.googleCategoriesService.getCategoriesByDepth(0);
    }
    return this.googleCategoriesService.getCategoriesByParentId(parentId);
  }

  @Get('search-categories')
  @ApiOperation({ summary: 'Google Kategorilerinde Arama Yap' })
  @ApiQuery({
    name: 'search',
    type: String,
    description: 'Aranacak kelime (Örn: "Electronic")',
  })
  async searchCategories(@Query('search') search: string) {
    return this.googleCategoriesService.getCategoriesBySearch(search);
  }

  @Get('get-ancestor-ids-by-id')
  @ApiOperation({ summary: "Bir Kategorinin Tüm Üst (Ata) ID'lerini Getir" })
  @ApiQuery({
    name: 'id',
    type: String,
    description: 'Kategori ID',
  })
  async getAncestorIds(@Query('id') id: string) {
    const ids = await this.googleCategoriesService.getAncestorIds(id);
    return { success: true, ids };
  }

  @Get('get-category-details-by-id')
  @ApiOperation({ summary: 'Kategori Detaylarını ID ile Getir' })
  @ApiQuery({
    name: 'id',
    type: String,
    description: 'Kategori ID',
  })
  @ApiResponse({ status: 200, description: 'Kategori bulundu.' })
  @ApiResponse({ status: 404, description: 'Kategori bulunamadı.' })
  async getCategoryDetailsById(@Query('id') id: string) {
    const category =
      await this.googleCategoriesService.getCategoryDetailsById(id);
    if (!category) {
      return { success: false, message: 'Category not found' };
    }
    return { success: true, category };
  }
}
