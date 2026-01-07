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
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  AdminUserTableBulkActionsSchema,
  type AdminUserTableBulkActionsZodType,
  AllUsersReturnType,
  type CustomerGroupOutputZodType,
  CustomerGroupSchema,
  GetUsersQueriesReturnType,
  SortAdminUserTable,
} from '@repo/types';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';
import {
  AdminUserDeleteBulkActionDto,
  AdminUserUpdateGroupBulkActionDto,
  AdminUserUpdateRoleBulkActionDto,
  CustomerManualGroupDto,
  CustomerSmartGroupDto,
} from './users-dto';
import { UsersService } from './users.service';

@ApiTags('Admin / Users')
@ApiSecurity('token')
@Controller('/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Kullanıcıları Listele' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, enum: SortAdminUserTable })
  async getUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
    @Query('search') search?: string,
    @Query('sortBy', new ParseEnumPipe(SortAdminUserTable, { optional: true }))
    sortBy?: SortAdminUserTable,
  ): Promise<GetUsersQueriesReturnType> {
    return this.usersService.getUsers({
      page: page || 1,
      take: take || 20,
      search: search || '',
      sortBy: sortBy || SortAdminUserTable.nameAsc,
    });
  }

  @Get('get-user-infos')
  @ApiOperation({ summary: 'Kullanıcı Bilgilerini Getir' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getUserData(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.usersService.getUserData(page || 1, search || null, take || 10);
  }

  @Get('all-users')
  @ApiOperation({ summary: 'Tüm Kullanıcıları Getir (Pagination Yok)' })
  async allUsers(): Promise<AllUsersReturnType[]> {
    return this.usersService.getUserInfos();
  }

  @Post('customer-group')
  @ApiOperation({ summary: 'Müşteri Segmenti Oluştur/Güncelle' })
  @ApiExtraModels(CustomerSmartGroupDto, CustomerManualGroupDto)
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CustomerSmartGroupDto) },
        { $ref: getSchemaPath(CustomerManualGroupDto) },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(CustomerGroupSchema))
  async upsertCustomerSegment(@Body() body: CustomerGroupOutputZodType) {
    return this.usersService.upsertCustomerGroup(body);
  }

  @Get('customer-groups')
  @ApiOperation({ summary: 'Müşteri Segmentlerini Listele' })
  async getCustomerSegments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.getCustomerGroups(page, limit, search);
  }

  @Get('customer-group/:id')
  @ApiOperation({ summary: 'ID ile Müşteri Segment Detayı' })
  async getCustomerSegment(@Param('id') id: string) {
    return this.usersService.getCustomerGroup(id);
  }

  @Post('customer-bulk-action')
  @ApiOperation({ summary: 'Toplu Müşteri İşlemleri' })
  @ApiExtraModels(
    AdminUserDeleteBulkActionDto,
    AdminUserUpdateGroupBulkActionDto,
    AdminUserUpdateRoleBulkActionDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(AdminUserDeleteBulkActionDto) },
        { $ref: getSchemaPath(AdminUserUpdateGroupBulkActionDto) },
        { $ref: getSchemaPath(AdminUserUpdateRoleBulkActionDto) },
      ],
    },
  })
  @UsePipes(new ZodValidationPipe(AdminUserTableBulkActionsSchema))
  async customerBulkAction(@Body() data: AdminUserTableBulkActionsZodType) {
    //TODO: OWNER Kontrolü vb. servis katmanında veya burada yapılmalı.
    return this.usersService.handleBulkActions(data);
  }

  @Get('get-all-customer-groups-list')
  @ApiOperation({ summary: 'Tüm Müşteri Segment Listesi (Dropdown için)' })
  async getAllCustomerGroups() {
    return this.usersService.getAllCustomerGroups();
  }
}
