import { PipeTransform, Injectable } from '@nestjs/common';
import { $Enums } from '@repo/database';

@Injectable()
export class CartStatusValidationPipe implements PipeTransform {
  transform(value: string | undefined): $Enums.CartStatus | null {
    // Boş değer kontrolü
    if (!value) {
      return null;
    }

    // Trim ve uppercase gibi normalizasyon yapabilirsiniz
    const normalizedValue = value.trim().toUpperCase();

    const validStatuses = Object.values($Enums.CartStatus);

    if (!validStatuses.includes(normalizedValue as $Enums.CartStatus)) {
      return null; // veya default bir değer dönebilirsiniz
    }

    return normalizedValue as $Enums.CartStatus;
  }
}
