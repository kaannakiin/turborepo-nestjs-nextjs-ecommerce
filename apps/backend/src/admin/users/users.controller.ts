import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  AllUsersReturnType,
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
}
