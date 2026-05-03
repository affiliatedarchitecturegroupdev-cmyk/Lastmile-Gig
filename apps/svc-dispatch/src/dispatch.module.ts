import { Module } from '@nestjs/common';
import { DispatchController } from './dispatch.controller';
import { DispatchService } from './dispatch.service';
import { MatchingModule } from './matching/matching.module';
import { AllocationModule } from './allocation/allocation.module';

@Module({
  imports: [MatchingModule, AllocationModule],
  controllers: [DispatchController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class DispatchModule {}