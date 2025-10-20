import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  BaseProductSchema,
  type BaseProductZodType,
  type Cuid2ZodType,
  VariantGroupSchema,
  type VariantGroupZodType,
  VariantProductSchema,
  type VariantProductZodType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { FilesValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { ProductsService } from './products.service';

@Controller('/admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('get-variants')
  async getVariants(): Promise<VariantGroupZodType[]> {
    const data = await this.productsService.getVariants();
    if (!data || data.length === 0) {
      return [];
    }
    return data.map((variant) => ({
      options: variant.options.map((option) => ({
        translations: option.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          slug: t.slug,
        })) as VariantGroupZodType['options'][number]['translations'],
        uniqueId: option.id,
        existingFile:
          option.asset?.url ||
          (null as VariantGroupZodType['options'][number]['existingFile']),
        file: null,
        hexValue: option.hexValue,
      })) as VariantGroupZodType['options'],
      translations: variant.translations.map((t) => ({
        locale: t.locale,
        name: t.name,
        slug: t.slug,
      })) as VariantGroupZodType['translations'],
      type: variant.type,
      uniqueId: variant.id,
    }));
  }

  @Post('create-or-update-variant')
  @UsePipes(new ZodValidationPipe(VariantGroupSchema))
  async createOrUpdateVariants(@Body() data: VariantGroupZodType) {
    return this.productsService.createOrUpdateVariants(data);
  }

  @Get('get-product-variant/:id')
  async getProductVariant(
    @Param('id') id: string,
  ): Promise<VariantProductZodType | null> {
    const result = await this.productsService.getProductVariant(id);
    if (!result) {
      throw new NotFoundException('Ürün varyantı bulunamadı');
    }
    return result;
  }

  @Delete('delete-product-image')
  async deleteProductImage(@Query('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      throw new BadRequestException('Image URL is required');
    }
    return this.productsService.deleteProductImage(imageUrl);
  }

  @Post('upload-product-image')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        types: ['IMAGE', 'VIDEO'],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() body: { productId: string; orders: number[] },
  ) {
    return this.productsService.uploadProductsFile(
      files,
      body.productId,
      body.orders,
    );
  }

  @Post('create-or-update-variant-product')
  @UsePipes(new ZodValidationPipe(VariantProductSchema))
  async createOrUpdateVariantProduct(@Body() data: VariantProductZodType) {
    return this.productsService.createOrUpdateVariantProduct(data);
  }

  @Post('upload-variant-image')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadVariantImage(
    @UploadedFiles(
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        types: ['IMAGE', 'VIDEO'],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() body: { variantId: string },
  ) {
    return this.productsService.uploadVariantImage(files, body.variantId);
  }

  @Delete('variant-image')
  async deleteVariantImage(@Body() body: { imageUrl: string }) {
    return this.productsService.deleteVariantImage(body.imageUrl);
  }

  @Post('upload-option-asset/:optionUniqueId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadOptionAsset(
    @UploadedFile(
      new FilesValidationPipe({
        maxSize: 10 * 1024 * 1024,
        types: ['IMAGE'],
      }),
    )
    file: Express.Multer.File,
    @Param('optionUniqueId') optionUniqueId: string,
  ) {
    return this.productsService.uploadVariantOptionAsset(file, optionUniqueId);
  }

  @Delete('delete-option-asset/:url')
  async deleteOptionAsset(@Param('url') url: string) {
    const decodedUrl = decodeURIComponent(url);
    return this.productsService.deleteVariantOptionAsset(decodedUrl);
  }

  @Post('create-or-update-basic-product')
  @UsePipes(
    new ZodValidationPipe(
      BaseProductSchema.omit({
        images: true,
      }),
    ),
  )
  async createOrUpdateBasicProduct(
    @Body() data: Omit<BaseProductZodType, 'images'>,
  ) {
    return this.productsService.createOrUpdateBasicProduct(data);
  }

  @Get('get-basic-product/:id')
  async getBasicProduct(@Param('id') id: Cuid2ZodType) {
    const result = await this.productsService.getBasicProduct(id);
    if (!result) {
      throw new NotFoundException('Ürün bulunamadı');
    }
    return result;
  }

  @Get('get-products')
  async getProducts(
    @Query('search') search?: string,
    @Query('page') pageParam?: string,
  ) {
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    return this.productsService.getProducts(search, page);
  }

  @Get('get-products-for-selection')
  async getProductsForSelection() {
    return this.productsService.getProductsForSelection();
  }

  @Get('get-product-and-variants-for-modal')
  async getProductAndVariantsForModal(@Query('search') search: string) {
    return this.productsService.getProductAndVariantsForModal(search);
  }

  @Post('get-selected-products')
  async getSelectedProducts(
    @Body() body: { selectedItems: { productId: string; variantId: string }[] },
  ) {
    return this.productsService.getSelectedProductsForModal(body.selectedItems);
  }

  @Get('get-all-products-id-name-image')
  async getAllProductsIdNameImage() {
    return this.productsService.getAllProductsIdNameImage();
  }

  @Get('get-all-products-and-its-subs')
  async getAllProductAndItsSubs() {
    return this.productsService.getAllProductsAndItsSubs();
  }
}
