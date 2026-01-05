import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AllUsersReturnType,
  CustomerGroupSchema,
  type CustomerGroupOutputZodType,
  type GetUsersQueries,
  getUsersQueries,
  GetUsersQueriesReturnType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/user/reflectors/roles.decorator';
import { UsersService } from './users.service';

@Controller('/admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('get-users')
  async getUsers(
    @Query(new ZodValidationPipe(getUsersQueries)) queries: GetUsersQueries,
  ): Promise<GetUsersQueriesReturnType> {
    return this.usersService.getUsers({
      page: queries.page,
      search: queries.search,
      sortBy: queries.sortBy,
    });
  }

  @Get('get-user-infos')
  async getUserData(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('search') search?: string,
    @Query('take', new ParseIntPipe({ optional: true })) take?: number,
  ) {
    return this.usersService.getUserData(page || 1, search || null, take || 10);
  }

  @Get('all-users')
  async allUsers(): Promise<AllUsersReturnType[]> {
    return this.usersService.getUserInfos();
  }

  @Post('customer-group')
  async upsertCustomerSegment(
    @Body(new ZodValidationPipe(CustomerGroupSchema))
    body: CustomerGroupOutputZodType,
  ) {
    return this.usersService.upsertCustomerGroup(body);
  }

  @Get('customer-groups')
  async getCustomerSegments(
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 20,
    @Query('search') search?: string,
  ) {
    return this.usersService.getCustomerGroups(page, limit, search);
  }

  @Get('customer-group/:id')
  async getCustomerSegment(@Param('id') id: string) {
    return this.usersService.getCustomerGroup(id);
  }
}
