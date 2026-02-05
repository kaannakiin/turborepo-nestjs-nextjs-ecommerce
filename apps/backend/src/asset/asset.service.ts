import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    private readonly prismaService: PrismaService,
    private readonly minioService: MinioService,
  ) {}

  async deleteAsset(url: string) {
    try {
      const asset = await this.prismaService.asset.findUnique({
        where: { url },
      });

      if (!asset) {
        throw new NotFoundException('Asset bulunamadı.');
      }

      await this.prismaService.asset.delete({
        where: { url },
      });

      await this.minioService.deleteAsset(url);

      this.logger.log(`Asset silindi: ${url}`);
      return { success: true, message: 'Asset başarıyla silindi.' };
    } catch (error) {
      this.logger.error(`Asset silinirken hata: ${url}`, error.stack);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Asset silinirken bir hata oluştu.',
      );
    }
  }
}
