import { Module } from '@nestjs/common';
import { HierarchyService } from './hierarchy.service';
import { HierarchyController } from './hierarchy.controller';

@Module({
  controllers: [HierarchyController],
  providers: [HierarchyService],
})
export class HierarchyModule {}
