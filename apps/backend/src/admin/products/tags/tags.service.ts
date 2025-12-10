import { Injectable } from '@nestjs/common';
import { ProductTagIdAndName } from '@repo/types';
import { LocaleService } from 'src/common/services/locale.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TagsService {
  constructor(
    private prismaService: PrismaService,
    private localeService: LocaleService,
  ) {}

  async getAllTagsIdAndName(): Promise<ProductTagIdAndName[]> {
    const locale = this.localeService.getLocale();

    const tags = await this.prismaService.productTag.findMany({
      select: {
        id: true,
        translations: {
          select: {
            name: true,
            locale: true,
          },
        },
      },
    });

    return tags.map((tag) => {
      const targetTranslation = tag.translations.find(
        (t) => t.locale === locale,
      );

      const defaultTranslation = tag.translations[0];

      return {
        id: tag.id,
        name:
          targetTranslation?.name ??
          defaultTranslation?.name ??
          'İsimsiz-Etiket',
      };
    });
  }
}
