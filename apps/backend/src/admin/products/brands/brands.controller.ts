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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  BrandSchema,
  BrandZodType,
  Cuid2Schema,
  type Cuid2ZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { BrandsService } from './brands.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async getBrands(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.brandsService.getBrands({ search, page, limit });
  }

  @Get('get-brand-form-value/:id')
  async getBrandForForm(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.brandsService.getBrandFormValue(id);
  }

  @Get('get-all-brands-only-id-and-name')
  async getAllBrandsIdsAndName() {
    return this.brandsService.getAllBrandsIdsAndName();
  }

  @Post('create-or-update-brand')
  async createOrUpdateBrand(
    @Body(
      new ZodValidationPipe(
        BrandSchema.omit({
          image: true,
        }),
      ),
    )
    data: Omit<BrandZodType, 'image'>,
  ) {
    return this.brandsService.createOrUpdateBrand(data);
  }

  @Post('upload-brand-image/:id')
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
  async deleteBrandImage(@Param('id') id: string) {
    return this.brandsService.deleteBrandImage(id);
  }

  @Delete(':id')
  async deleteBrand(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.brandsService.deleteBrand(id);
  }
}
