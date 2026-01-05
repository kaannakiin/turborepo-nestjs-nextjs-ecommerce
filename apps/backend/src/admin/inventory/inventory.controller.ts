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
import { InventoryService } from './inventory.service';
import {
  InventoryLocationZodSchema,
  type InventoryLocationZodSchemaType,
} from '@repo/types';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { LocationType } from '@repo/database';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('location')
  async upsertInventoryLocation(
    @Body(new ZodValidationPipe(InventoryLocationZodSchema))
    body: InventoryLocationZodSchemaType,
  ) {
    return this.inventoryService.upsertInventoryLocation(body);
  }

  @Get('location')
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
  async getInventoryLocationById(@Param('id') id: string) {
    return this.inventoryService.getInventoryLocationById(id);
  }
}
