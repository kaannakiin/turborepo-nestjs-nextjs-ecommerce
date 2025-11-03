import { ArgumentMetadata, PipeTransform, Injectable } from '@nestjs/common';
import { $Enums } from '@repo/database';
import { DateFormatter } from '@repo/shared';

@Injectable()
export class ParseIsoStringPipe implements PipeTransform {
  constructor(private readonly locale?: $Enums.Locale) {}

  transform(value: string | null, metadata: ArgumentMetadata): Date | null {
    if (!value) return null;

    const localeToUse = this.locale || $Enums.Locale.TR;

    const date = DateFormatter.parseIsoString(value, localeToUse);

    if (!date) {
      throw new Error(`Invalid ISO date string: ${value}`);
    }

    return date;
  }
}
