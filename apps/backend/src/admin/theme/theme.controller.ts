import { Controller, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/reflectors/roles.decorator';
import { ThemeService } from './theme.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(['OWNER', 'ADMIN'])
@Controller('/admin/theme')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  // async
}
