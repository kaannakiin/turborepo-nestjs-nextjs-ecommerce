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
  Category,
  CategorySchema,
  Cuid2Schema,
  type Cuid2ZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { CategoriesService } from './categories.service';

@Controller('/admin/products/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create-or-update-category')
  @UsePipes(new ZodValidationPipe(CategorySchema.omit({ image: true })))
  async createOrUpdateCategory(@Body() categoryData: Omit<Category, 'image'>) {
    return this.categoriesService.createOrUpdateCategory(categoryData);
  }

  @Post('update-category-image/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateCategoryImage(
    @UploadedFile(
      new FilesValidationPipe({
        types: 'IMAGE',
        maxSize: 10 * 1024 * 1024,
      }),
    )
    file: Express.Multer.File,
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.updateCategoryImage(file, id);
  }

  @Get('get-category/:id')
  async getCategoryById(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.getCategoryById(id);
  }

  @Delete('delete-category-image/:url')
  async deleteCategoryImage(@Param('url') url: string) {
    return this.categoriesService.deleteCategoryImage(url);
  }

  @Get('get-all-categories')
  async getAllCategories(
    @Query('search') search?: string,
    @Query('page') page?: string,
  ) {
    const pageNumber = page ? parseInt(page) : 1;
    const categories = await this.categoriesService.getAllCategories(
      search,
      pageNumber,
    );
    const total = await this.categoriesService.getCategoriesCount(search);

    return {
      success: true,
      data: categories,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / 10),
        totalItems: total,
        itemsPerPage: 10,
      },
    };
  }

  @Delete('delete-category/:id')
  async deleteCategory(
    @Param('id', new ZodValidationPipe(Cuid2Schema)) id: Cuid2ZodType,
  ) {
    return this.categoriesService.deleteCategory(id);
  }

  @Get('get-all-parent-categories/:id')
  async getAllParentCategories(@Param('id') id: Cuid2ZodType) {
    const categories = await this.categoriesService.getAllParentCategories(id);
    return {
      success: true,
      data: categories,
    };
  }

  @Get('get-all-parent-categories')
  async getAllParentCategoriesForNew() {
    const categories = await this.categoriesService.getAllParentCategories();
    return {
      success: true,
      data: categories,
    };
  }

  @Get('get-all-categories-without-query')
  async getAllCategoriesWithoutQuery() {
    return this.categoriesService.getAllCategoriesWithoutQuery();
  }

  @Get('get-all-categories-only-id-and-name')
  async getAllCategoriesOnlyIdAndName() {
    return this.categoriesService.getAllCategoriesOnlyIdAndName();
  }

  @Get('get-all-categories-only-id-name-image')
  async getAllCategoriesOnlyIdNameImage() {
    return this.categoriesService.getAllCategoriesOnlyIdNameImage();
  }

  @Get('get-all-category-and-its-subs')
  async getAllCategoryAndItsSubs() {
    return this.categoriesService.getAllCategoryAndItsSubs();
  }
}
