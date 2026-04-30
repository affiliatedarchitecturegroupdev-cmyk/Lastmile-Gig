import { Module } from '@nestjs/common';
import { DriversController } from './drivers.controller';
import { DriversService } from './drivers.service';
import { LocationTrackingModule } from './location-tracking/location-tracking.module';

@Module({
  imports: [LocationTrackingModule],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}