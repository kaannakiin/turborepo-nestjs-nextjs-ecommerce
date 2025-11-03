import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { $Enums } from '@repo/database';
import { DateFormatter } from '@repo/shared';
import { LocaleService } from '../services/locale.service';

@Injectable({ scope: Scope.REQUEST })
export class ParseIsoStringPipe implements PipeTransform {
  constructor(private readonly localeService: LocaleService) {}

  transform(value: string | null, metadata: ArgumentMetadata): Date | null {
    if (!value) return null;

    const localeToUse = this.localeService.getLocale() || $Enums.Locale.TR;

    const date = DateFormatter.parseIsoString(value, localeToUse);

    if (!date) {
      return null;
    }

    return date;
  }
}
