import { Controller, Get } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('/admin/products/tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get('get-all-tags-id-and-name')
  async getAllTagsIdAndName() {
    return this.tagsService.getAllTagsIdAndName();
  }
}
