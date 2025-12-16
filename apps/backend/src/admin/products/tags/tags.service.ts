import { Injectable } from '@nestjs/common';
import { LocaleService } from 'src/common/services/locale.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(
    private prismaService: PrismaService,
    private localeService: LocaleService,
  ) {}

  async getAllTagsIdAndName(): Promise<{ id: string; name: string }[]> {
    const locale = this.localeService.getLocale();
    const data = await this.prismaService.productTag.findMany({
      select: {
        id: true,
        translations: true,
      },
    });

    return data?.map((tag) => ({
      id: tag.id,
      name:
        tag.translations.find((t) => t.locale === locale)?.name ||
        tag.translations[0]?.name ||
        '',
    }));
  }
}
