import { ArgumentMetadata, PipeTransform } from '@nestjs/common';

export class NullableStringPipe implements PipeTransform {
  transform(value: string | null, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }
    return null;
  }
}
