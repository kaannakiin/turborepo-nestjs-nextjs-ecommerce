import { Controller, Get, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/user/reflectors/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['ADMIN', 'OWNER'])
@Controller('/admin/products/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('get-all-tags-id-and-name')
  async getAllTagsIdAndName() {
    return this.tagsService.getAllTagsIdAndName();
  }
}
