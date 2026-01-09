import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Cuid2Schema, type Cuid2ZodType } from '@repo/types';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { CreateOrUpdateCategoryDto } from './admin-categories-dto';
import { CategoriesService } from './categories.service';

@ApiSecurity('token')
@ApiTags('Admin / Products / Categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Kategorileri Listele' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Kategori adı ara',
  })
  async getCategories(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.getCategories(page, limit, search);
  }

  @Delete('delete-category/:id')
  @ApiOperation({ summary: 'Kategori Sil' })
  @ApiParam({ name: 'id', description: 'Kategori ID (Cuid2)' })
  async deleteCategory(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.deleteCategory(id);
  }

  @Get('get-category-form-value/:id')
  @ApiOperation({ summary: 'Form Düzenleme İçin Kategori Verisini Getir' })
  @ApiParam({ name: 'id', description: 'Kategori ID (Cuid2)' })
  async getCategoryFormValue(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.getCategoryFormValue(id);
  }

  @Get('get-all-categories-for-select')
  @ApiOperation({ summary: 'Dropdown İçin Kategori Listesi (Hiyerarşik)' })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    description: 'Kendi altına taşımayı engellemek için mevcut kategori ID',
  })
  async getAllCategoriesForSelect(
    @Query('excludeId', new ZodValidationPipe(Cuid2Schema.nullish()))
    excludeId?: Cuid2ZodType,
  ) {
    return this.categoriesService.getAllCategoriesForSelect(excludeId);
  }

  @Post('create-or-update-category')
  @ApiOperation({ summary: 'Kategori Oluştur veya Güncelle' })
  @ApiResponse({ status: 201, description: 'İşlem Başarılı' })
  @UsePipes(ZodValidationPipe)
  async createOrUpdateCategory(@Body() data: CreateOrUpdateCategoryDto) {
    return this.categoriesService.createOrUpdateCategory(data);
  }

  @Post('upload-category-image/:categoryId')
  @ApiOperation({ summary: 'Kategori Görseli Yükle' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiParam({ name: 'categoryId', description: 'Kategori ID' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCategoryImage(
    @Param('categoryId', new ZodValidationPipe(Cuid2Schema))
    categoryId: Cuid2ZodType,
    @UploadedFile(
      new FilesValidationPipe({
        types: 'IMAGE',
        maxSize: 10 * 1024 * 1024,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.categoriesService.uploadCategoryImage(categoryId, file);
  }

  @Get('get-all-categories-only-id-and-name')
  @ApiOperation({ summary: 'Tüm Kategorilerin Sadece ID ve İsimleri' })
  async getAllCategoriesOnlyIdAndName() {
    return this.categoriesService.getAllCategoriesOnlyIdAndName();
  }
}
