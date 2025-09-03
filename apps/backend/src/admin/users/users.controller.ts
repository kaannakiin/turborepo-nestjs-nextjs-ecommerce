import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  GetUsersQueries,
  getUsersQueries,
  GetUsersQueriesReturnType,
} from '@repo/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { Roles } from 'src/reflectors/roles.decorator';
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
      page: queries.page, // Zod'da default 1 var, || 0 gereksiz
      search: queries.search, // Zod'da default "" var
      sortBy: queries.sortBy, // Zod'da default var
    });
  }
}
