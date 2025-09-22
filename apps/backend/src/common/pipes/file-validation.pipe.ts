import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { getMimeTypesForAssetType, MIME_TYPES } from '@repo/types';

export type AssetType = keyof typeof MIME_TYPES;

interface FileValidationOptions {
  types: AssetType | AssetType[];
  maxSize: number; // bytes
}

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions) {}

  transform(value: any) {
    if (!value) {
      throw new BadRequestException('No files uploaded.');
    }

    const files: Express.Multer.File[] = [];

    // 1. Tek file (FileInterceptor)
    if (value.fieldname && value.originalname && value.mimetype) {
      files.push(value);
    }
    // 2. Array of files (FilesInterceptor)
    else if (Array.isArray(value)) {
      files.push(...value);
    }
    // 3. Nested object (FileFieldsInterceptor)
    else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach((fieldFiles: any) => {
        if (Array.isArray(fieldFiles)) {
          files.push(...fieldFiles);
        } else if (fieldFiles?.fieldname && fieldFiles?.originalname) {
          // Tek file nested olarak gelmiş
          files.push(fieldFiles);
        }
      });
    }

    if (files.length === 0) {
      throw new BadRequestException('At least one file must be uploaded.');
    }

    // AssetType tek mi array mi → normalize et
    const allowedTypes = Array.isArray(this.options.types)
      ? this.options.types
      : [this.options.types];

    // İzin verilen mime türlerini topla
    const allowedMimes = allowedTypes.flatMap((type) =>
      getMimeTypesForAssetType(type),
    );

    for (const file of files) {
      // Boyut kontrolü
      if (file.size > this.options.maxSize) {
        throw new BadRequestException(
          `File ${file.originalname} is too large. Max allowed size is ${Math.round(
            this.options.maxSize / 1024 / 1024,
          )}MB.`,
        );
      }

      // MIME kontrolü
      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File ${file.originalname} has invalid type (${file.mimetype}). Allowed: ${allowedMimes.join(
            ', ',
          )}`,
        );
      }
    }

    // Orijinal yapıyı koru
    return value;
  }
}
