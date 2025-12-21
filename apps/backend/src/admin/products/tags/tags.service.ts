import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { LocaleService } from 'src/common/services/locale.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
  private logger = new Logger(TagsService.name);
  constructor(
    private readonly prismaService: PrismaService,
    private readonly localeService: LocaleService,
  ) {}

  async getAllTagsIdAndName(): Promise<Array<{ id: string; name: string }>> {
    try {
      const locale = this.localeService.getLocale();
      const tags = await this.prismaService.productTag.findMany({
        select: {
          id: true,
          translations: true,
        },
      });
      return tags.map((tag) => ({
        id: tag.id,
        name:
          tag.translations.find((t) => t.locale === locale)?.name ||
          tag.translations[0]?.name ||
          'N/A',
      }));
    } catch (error) {
      this.logger.error('Failed to get all tags id and name', error);
      throw new InternalServerErrorException(
        'Failed to get all tags id and name',
      );
    }
  }
}
