import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { $Enums } from '@repo/database';
import { createId } from '@repo/shared';
import { type Client } from 'minio';
import { NestMinioService } from 'nestjs-minio';
import sharp from 'sharp';

interface UploadAssetProps {
  bucketName: string;
  file: Express.Multer.File;
  isNeedOg?: boolean;
  isNeedThumbnail?: boolean;
}

export interface ProcessedAsset {
  url: string;
  type: $Enums.AssetType;
  originalName: string;
  size: number;
  thumbnailUrl?: string;
  ogUrl?: string;
}

export interface UploadResponse {
  success: boolean;
  data: ProcessedAsset | null;
}

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Client;

  constructor(
    private minio: NestMinioService,
    private config: ConfigService,
  ) {
    this.minioClient = this.minio.getMinio();
  }

  private getAssetType(mimeType: string): $Enums.AssetType {
    if (mimeType.startsWith('image/')) return $Enums.AssetType.IMAGE;
    if (mimeType.startsWith('video/')) return $Enums.AssetType.VIDEO;
    if (mimeType.startsWith('audio/')) return $Enums.AssetType.AUDIO;
    return $Enums.AssetType.DOCUMENT;
  }

  private generateFileName(originalName: string, suffix?: string): string {
    const uuid = createId();
    const nameParts = originalName.split('.');
    const extension = nameParts.pop();
    const nameWithoutExt = nameParts.join('.');
    const finalSuffix = suffix ? `_${suffix}` : '';
    return `${nameWithoutExt}_${uuid}${finalSuffix}.${extension}`;
  }

  private async ensurePublicReadOnlyPolicy(bucketName: string): Promise<void> {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    };
    const policyString = JSON.stringify(policy);

    try {
      const currentPolicy = await this.minioClient.getBucketPolicy(bucketName);
      if (currentPolicy !== policyString) {
        await this.minioClient.setBucketPolicy(bucketName, policyString);
      }
    } catch (err) {
      if (err.code === 'NoSuchBucketPolicy') {
        await this.minioClient.setBucketPolicy(bucketName, policyString);
      } else {
        throw err;
      }
    }
  }

  private async uploadToMinio(
    bucketName: string,
    fileName: string,
    buffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const bucketExists = await this.minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      try {
        await this.minioClient.makeBucket(bucketName);
      } catch (err) {
        if (err.code !== 'BucketAlreadyOwnedByYou') {
          throw err;
        }
      }
    }

    await this.ensurePublicReadOnlyPolicy(bucketName);

    await this.minioClient.putObject(
      bucketName,
      fileName,
      buffer,
      buffer.length,
      {
        'Content-Type': contentType,
      },
    );

    const MINIO_ENDPOINT = this.config.getOrThrow('MINIO_ENDPOINT');
    const endpoint = MINIO_ENDPOINT.endsWith('/')
      ? MINIO_ENDPOINT.slice(0, -1)
      : MINIO_ENDPOINT;

    return `${endpoint}/${bucketName}/${fileName}`;
  }

  private async processImage(
    file: Express.Multer.File,
    isNeedOg: boolean,
    isNeedThumbnail: boolean,
  ): Promise<{
    main: { buffer: Buffer; contentType: string };
    og?: { buffer: Buffer; contentType: string };
    thumbnail?: { buffer: Buffer; contentType: string };
  }> {
    const result: {
      main: { buffer: Buffer; contentType: string };
      og?: { buffer: Buffer; contentType: string };
      thumbnail?: { buffer: Buffer; contentType: string };
    } = {
      main: {
        buffer: await sharp(file.buffer).toBuffer(),
        contentType: 'image/webp',
      },
    };

    if (isNeedOg) {
      result.og = {
        buffer: await sharp(file.buffer)
          .resize(1200, 630, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toBuffer(),
        contentType: 'image/jpeg',
      };
    }

    if (isNeedThumbnail) {
      result.thumbnail = {
        buffer: await sharp(file.buffer)
          .blur(1)
          .webp({ quality: 10 })
          .toBuffer(),

        contentType: 'image/webp',
      };
    }

    return result;
  }

  private validateVideoFormat(file: Express.Multer.File): void {
    if (file.mimetype !== 'video/webm') {
      throw new BadRequestException(
        `Video dosyası WebM formatında olmalıdır. Gönderilen format: ${file.mimetype}`,
      );
    }
  }

  private async processVideo(
    file: Express.Multer.File,
    isNeedThumbnail: boolean,
  ): Promise<{
    main: { buffer: Buffer; contentType: string };
    thumbnail?: { buffer: Buffer; contentType: string };
  }> {
    this.validateVideoFormat(file);

    const result: {
      main: { buffer: Buffer; contentType: string };
      thumbnail?: { buffer: Buffer; contentType: string };
    } = {
      main: {
        buffer: file.buffer,
        contentType: 'video/webm',
      },
    };

    if (isNeedThumbnail) {
      const placeholderThumbnail = await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 50, g: 50, b: 50 },
        },
      })
        .blur(1)
        .webp({ quality: 70 })
        .toBuffer();

      result.thumbnail = {
        buffer: placeholderThumbnail,
        contentType: 'image/webp',
      };
    }

    return result;
  }

  async uploadAsset({
    bucketName,
    file,
    isNeedOg = false,
    isNeedThumbnail = false,
  }: UploadAssetProps): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException('Yüklenecek dosya bulunamadı.');
    }

    try {
      const assetType = this.getAssetType(file.mimetype);

      const processedAsset: ProcessedAsset = {
        url: '',
        type: assetType,
        originalName: file.originalname,
        size: file.size,
      };

      switch (assetType) {
        case $Enums.AssetType.IMAGE: {
          const processed = await this.processImage(
            file,
            isNeedOg,
            isNeedThumbnail,
          );

          const baseFileName = this.generateFileName(file.originalname).split(
            '.',
          )[0];

          const mainFileName = `${baseFileName}.webp`;
          processedAsset.url = await this.uploadToMinio(
            bucketName,
            mainFileName,
            processed.main.buffer,
            processed.main.contentType,
          );

          if (processed.og) {
            const ogFileName = `${baseFileName}-og.jpg`;
            processedAsset.ogUrl = await this.uploadToMinio(
              bucketName,
              ogFileName,
              processed.og.buffer,
              processed.og.contentType,
            );
          }

          if (processed.thumbnail) {
            const thumbnailFileName = `${baseFileName}-thumbnail.webp`;
            processedAsset.thumbnailUrl = await this.uploadToMinio(
              bucketName,
              thumbnailFileName,
              processed.thumbnail.buffer,
              processed.thumbnail.contentType,
            );
          }
          break;
        }

        case $Enums.AssetType.VIDEO: {
          const processed = await this.processVideo(file, isNeedThumbnail);

          const baseFileName = this.generateFileName(file.originalname).split(
            '.',
          )[0];

          const mainFileName = `${baseFileName}.webm`;
          processedAsset.url = await this.uploadToMinio(
            bucketName,
            mainFileName,
            processed.main.buffer,
            processed.main.contentType,
          );

          if (processed.thumbnail) {
            const thumbnailFileName = `${baseFileName}-thumbnail.webp`;
            processedAsset.thumbnailUrl = await this.uploadToMinio(
              bucketName,
              thumbnailFileName,
              processed.thumbnail.buffer,
              processed.thumbnail.contentType,
            );
          }
          break;
        }

        case $Enums.AssetType.AUDIO:
        case $Enums.AssetType.DOCUMENT: {
          const extension = file.originalname.split('.').pop();
          const fileName =
            this.generateFileName(file.originalname).split('.')[0] +
            `.${extension}`;
          processedAsset.url = await this.uploadToMinio(
            bucketName,
            fileName,
            file.buffer,
            file.mimetype,
          );
          break;
        }

        default:
          throw new BadRequestException(
            `Desteklenmeyen dosya tipi: ${file.mimetype}`,
          );
      }

      return { success: true, data: processedAsset };
    } catch (error) {
      console.log(error);
      this.logger.error(
        `Dosya yükleme sırasında hata oluştu: ${file.originalname}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Dosya yüklenirken bir sunucu hatası oluştu.',
      );
    }
  }
  async deleteAsset(
    fileUrl: string,
  ): Promise<{ success: boolean; message?: string }> {
    if (!fileUrl) {
      throw new BadRequestException('Silinecek dosya URLsi belirtilmedi.');
    }

    try {
      const MINIO_ENDPOINT = this.config.getOrThrow<string>('MINIO_ENDPOINT');

      if (!fileUrl.startsWith(MINIO_ENDPOINT)) {
        this.logger.error(
          `URL ${fileUrl} does not match configured MINIO_ENDPOINT.`,
        );
        throw new BadRequestException(
          'Geçersiz dosya URLsi. Bu sunucuya ait değil.',
        );
      }

      const path = new URL(fileUrl).pathname.substring(1);

      const firstSlashIndex = path.indexOf('/');
      if (firstSlashIndex === -1) {
        throw new BadRequestException(
          'URL formatı geçersiz: bucket adı bulunamadı.',
        );
      }

      const bucketName = path.substring(0, firstSlashIndex);
      const objectName = path.substring(firstSlashIndex + 1);

      if (!bucketName || !objectName) {
        throw new BadRequestException(
          'URL formatı geçersiz: bucket veya dosya adı eksik.',
        );
      }

      await this.minioClient.removeObject(bucketName, objectName);

      this.logger.log(
        `Asset deleted successfully: ${objectName} from bucket ${bucketName}`,
      );
      return { success: true, message: 'Dosya başarıyla silindi.' };
    } catch (error) {
      this.logger.error(
        `Failed to delete asset with URL: ${fileUrl}`,
        error.stack,
      );
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Dosya silinirken bir hata oluştu.',
      );
    }
  }
}
