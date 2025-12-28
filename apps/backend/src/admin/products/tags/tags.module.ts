import { Module } from '@nestjs/common';
import { TagsService } from './tags.service';
import { TagsController } from './tags.controller';
import { LocaleModule } from 'src/common/services/locale/locale.module';

@Module({
  controllers: [TagsController],
  providers: [TagsService],
  imports: [LocaleModule],
})
export class TagsModule {}
