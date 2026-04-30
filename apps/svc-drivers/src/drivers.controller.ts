import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { DriversService } from './drivers.service';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get('nearby')
  async findNearby(
    @Query('latitude') lat: string,
    @Query('longitude') lng: string,
    @Query('radiusKm') radiusKm = '5',
  ) {
    return this.driversService.findNearby(
      parseFloat(lat), parseFloat(lng), parseFloat(radiusKm),
    );
  }

  @Get(':id/location')
  async getLocation(@Param('id') id: string) {
    return this.driversService.getLocation(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.driversService.updateStatus(id, dto.status);
  }

  @Patch(':id/location')
  async updateLocation(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.driversService.updateLocation(
      id, dto.latitude, dto.longitude,
    );
  }

  @Post(':id/accept/:orderId')
  async acceptOrder(
    @Param('id') driverId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.driversService.acceptOrder(driverId, orderId);
  }

  @Post(':id/decline/:orderId')
  async declineOrder(
    @Param('id') driverId: string,
    @Param('orderId') orderId: string,
  ) {
    return this.driversService.declineOrder(driverId, orderId);
  }

  @Get(':id/earnings')
  async getEarnings(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.driversService.getEarnings(id, startDate, endDate);
  }
}

interface UpdateStatusDto { status: string; }
interface UpdateLocationDto { latitude: number; longitude: number; }