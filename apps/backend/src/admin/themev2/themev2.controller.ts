import { Controller, Get } from '@nestjs/common';
import { Themev2Service } from './themev2.service';

@Controller('admin/themev2')
export class Themev2Controller {
  constructor(private readonly themev2Service: Themev2Service) {}

  @Get()
  async getThemeV2() {}
}
