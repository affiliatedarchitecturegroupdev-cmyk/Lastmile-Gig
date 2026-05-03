import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { DispatchService } from './dispatch.service';

@Controller('dispatch')
export class DispatchController {
  constructor(private readonly dispatchService: DispatchService) {}

  @Post('assign')
  async assignDriver(@Body() dto: AssignDriverDto) {
    return this.dispatchService.assignDriver(dto.orderId, dto.driverId);
  }

  @Post('batch-assign')
  async batchAssign(@Body() dto: BatchAssignDto) {
    return this.dispatchService.batchAssign(dto.orderIds, dto.driverId);
  }

  @Get('available-drivers')
  async getAvailableDrivers(@Query('orderId') orderId: string) {
    return this.dispatchService.findAvailableDrivers(orderId);
  }

  @Get('order/:id/status')
  async getDispatchStatus(@Param('id') orderId: string) {
    return this.dispatchService.getDispatchStatus(orderId);
  }

  @Post('order/:id/reassign')
  async reassignDriver(@Param('id') orderId: string, @Body() dto: ReassignDto) {
    return this.dispatchService.reassignDriver(orderId, dto.newDriverId);
  }

  @Get('zone/:zoneId/orders')
  async getZoneOrders(@Param('zoneId') zoneId: string) {
    return this.dispatchService.getZoneOrders(zoneId);
  }

  @Post('optimize-route')
  async optimizeRoute(@Body() dto: OptimizeRouteDto) {
    return this.dispatchService.optimizeRoute(dto.orderIds);
  }
}

interface AssignDriverDto {
  orderId: string;
  driverId: string;
}

interface BatchAssignDto {
  orderIds: string[];
  driverId: string;
}

interface ReassignDto {
  newDriverId: string;
}

interface OptimizeRouteDto {
  orderIds: string[];
}