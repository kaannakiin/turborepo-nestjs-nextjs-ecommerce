import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  Scope,
} from '@nestjs/common';
import { DateFormatter } from '@repo/shared';

@Injectable({ scope: Scope.REQUEST })
export class ParseIsoStringPipe implements PipeTransform {
  transform(value: string | null, metadata: ArgumentMetadata): Date | null {
    if (!value) return null;

    const paramName = metadata.data;

    return DateFormatter.parseIsoString(
      value,
      paramName === 'startDate', // setToStartOfDay
      paramName === 'endDate', // setToEndOfDay
    );
  }
}
