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
  Brand,
  BrandSchema,
  Cuid2Schema,
  type Cuid2ZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { BrandsService } from './brands.service';

@Controller('/admin/products/brands')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post('create-or-update-brand')
  @UsePipes(new ZodValidationPipe(BrandSchema.omit({ image: true })))
  async createOrUpdateBrand(@Body() data: Omit<Brand, 'image'>) {
    return this.brandsService.createOrUpdateBrand(data);
  }

  @Post('update-brand-image/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateBrandImage(
    @UploadedFile(
      new FilesValidationPipe({
        types: 'IMAGE',
        maxSize: 10 * 1024 * 1024,
      }),
    )
    file: Express.Multer.File,
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType, // ✅ Düzeltilmiş
  ) {
    return this.brandsService.updateBrandImage(file, id);
  }

  @Get('get-all-brands')
  async getAllBrands(
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    const pageNumber = page ? parseInt(page) : 1;
    const brands = await this.brandsService.getAllBrands(search, pageNumber);
    const total = await this.brandsService.getBrandsCount(search);

    return {
      success: true,
      data: brands,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / 10),
        totalItems: total,
        itemsPerPage: 10,
      },
    };
  }
  @Get('get-all-brands-without-query')
  async getAllBrandsWithoutQuery() {
    return this.brandsService.getAllBrandsWithoutQuery();
  }

  @Delete('delete-brand/:id')
  async deleteBrand(@Param('id') id: Cuid2ZodType) {
    return this.brandsService.deleteBrand(id);
  }

  @Get('get-brand/:id')
  async getBrand(@Param('id') id: Cuid2ZodType) {
    return this.brandsService.getBrand(id);
  }

  @Delete('delete-brand-image/:url')
  async deleteBrandImage(@Param('url') url: string) {
    return this.brandsService.deleteBrandImage(url);
  }

  @Get('get-all-parent-brands/:id')
  async getAllParentBrands(@Param('id') id: Cuid2ZodType) {
    const brands = await this.brandsService.getAllParentBrands(id);
    return {
      success: true,
      data: brands,
    };
  }

  @Get('get-all-parent-brands')
  async getAllParentBrandsForNew() {
    const brands = await this.brandsService.getAllParentBrands();
    return {
      success: true,
      data: brands,
    };
  }
  @Get('get-all-brands-only-id-and-name')
  async getAllBrandsOnlyIdAndName() {
    return this.brandsService.getAllBrandsOnlyIdAndName();
  }
  @Get('get-all-brands-only-id-name-image')
  async getAllBrandsOnlyIdNameImage() {
    return this.brandsService.getAllBrandsOnlyIdNameImage();
  }
}
