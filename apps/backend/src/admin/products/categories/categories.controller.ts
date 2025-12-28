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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  CategorySchema,
  CategoryZodType,
  Cuid2Schema,
  type Cuid2ZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { CategoriesService } from './categories.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.categoriesService.getCategories(page, limit, search);
  }

  @Delete('delete-category/:id')
  async deleteCategory(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.deleteCategory(id);
  }

  @Get('get-category-form-value/:id')
  async getCategoryFormValue(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.getCategoryFormValue(id);
  }

  @Get('get-all-categories-for-select')
  async getAllCategoriesForSelect(
    @Query('excludeId', new ZodValidationPipe(Cuid2Schema.nullish()))
    excludeId?: Cuid2ZodType,
  ) {
    return this.categoriesService.getAllCategoriesForSelect(excludeId);
  }

  @Post('create-or-update-category')
  async createOrUpdateCategory(
    @Body(
      new ZodValidationPipe(
        CategorySchema.omit({
          image: true,
        }),
      ),
    )
    data: Omit<CategoryZodType, 'image'>,
  ) {
    return this.categoriesService.createOrUpdateCategory(data);
  }

  @Post('upload-category-image/:categoryId')
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
  async getAllCategoriesOnlyIdAndName() {
    return this.categoriesService.getAllCategoriesOnlyIdAndName();
  }
}
