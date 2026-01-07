import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { CreateOrUpdateBrandDto } from './brands.dto';
import { BrandsService } from './brands.service';

@ApiSecurity('token')
@ApiSecurity('csrf_header')
@ApiTags('Admin / Products / Brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Markaları Listele' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Marka isminde arama yap',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getBrands(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.brandsService.getBrands({ search, page, limit });
  }

  @Get('get-brand-form-value/:id')
  @ApiOperation({ summary: 'Form Düzenleme İçin Marka Verisini Getir' })
  @ApiParam({ name: 'id', description: 'Marka ID (Cuid2)' })
  async getBrandForForm(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.brandsService.getBrandFormValue(id);
  }

  @Get('get-all-brands-only-id-and-name')
  @ApiOperation({ summary: 'Tüm Markaların Sadece ID ve İsimlerini Getir' })
  async getAllBrandsIdsAndName() {
    return this.brandsService.getAllBrandsIdsAndName();
  }

  @Post('create-or-update-brand')
  @ApiOperation({ summary: 'Marka Oluştur veya Güncelle' })
  @ApiResponse({ status: 201, description: 'İşlem başarılı.' })
  @UsePipes(ZodValidationPipe)
  async createOrUpdateBrand(@Body() data: CreateOrUpdateBrandDto) {
    return this.brandsService.createOrUpdateBrand(data);
  }

  @Post('upload-brand-image/:id')
  @ApiOperation({ summary: 'Marka Görseli Yükle' })
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
  @ApiParam({ name: 'id', description: 'Marka ID' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadBrandImage(
    @UploadedFile(
      new FilesValidationPipe({
        types: 'IMAGE',
        maxSize: 10 * 1024 * 1024,
      }),
    )
    file: Express.Multer.File,
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.brandsService.uploadBrandImage(id, file);
  }

  @Delete('delete-brand-image/:id')
  @ApiOperation({ summary: 'Marka Görselini Sil' })
  @ApiParam({ name: 'id', description: 'Marka ID' })
  async deleteBrandImage(@Param('id') id: string) {
    return this.brandsService.deleteBrandImage(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Markayı Sil' })
  @ApiParam({ name: 'id', description: 'Marka ID' })
  async deleteBrand(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.brandsService.deleteBrand(id);
  }
}
