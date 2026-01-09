import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { getMimeTypesForAssetType, MIME_TYPES } from '@repo/types';

export type AssetType = keyof typeof MIME_TYPES;

type MulterValue =
  | Express.Multer.File
  | Express.Multer.File[]
  | Record<string, Express.Multer.File[]>
  | undefined;

interface FileValidationOptions {
  types: AssetType | AssetType[];
  maxSize: number;
  required?: boolean;
}

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  constructor(private readonly options: FileValidationOptions) {}

  transform(value: MulterValue): MulterValue {
    const isRequired = this.options.required ?? true;

    if (!value) {
      if (isRequired) {
        throw new BadRequestException('Dosya yüklenmedi.');
      }
      return [];
    }

    const files: Express.Multer.File[] = [];

    if (Array.isArray(value)) {
      files.push(...value);
    } else if ('fieldname' in value) {
      files.push(value as Express.Multer.File);
    } else {
      const filesMap = value as Record<string, Express.Multer.File[]>;
      Object.values(filesMap).forEach((fieldFiles) => {
        if (Array.isArray(fieldFiles)) {
          files.push(...fieldFiles);
        }
      });
    }

    if (files.length === 0) {
      if (isRequired) {
        throw new BadRequestException('En az bir dosya yüklenmelidir.');
      }
      return value;
    }

    const allowedTypes = Array.isArray(this.options.types)
      ? this.options.types
      : [this.options.types];

    const allowedMimes = allowedTypes.flatMap((type) =>
      getMimeTypesForAssetType(type),
    );

    for (const file of files) {
      if (file.size > this.options.maxSize) {
        throw new BadRequestException(
          `${file.originalname} dosyası çok büyük. İzin verilen maksimum boyut: ${Math.round(
            this.options.maxSize / 1024 / 1024,
          )}MB.`,
        );
      }

      if (!allowedMimes.includes(file.mimetype)) {
        throw new BadRequestException(
          `${file.originalname} dosyası geçersiz türde (${
            file.mimetype
          }). İzin verilenler: ${allowedMimes.join(', ')}`,
        );
      }
    }

    return value;
  }
}
