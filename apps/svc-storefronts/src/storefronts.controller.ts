import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { StorefrontsService } from './storefronts.service';

@Controller('storefronts')
export class StorefrontsController {
  constructor(private readonly storefrontsService: StorefrontsService) {}

  @Post()
  async createStorefront(@Body() dto: CreateStorefrontDto) {
    return this.storefrontsService.createStorefront(dto);
  }

  @Get()
  async listStorefronts(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.storefrontsService.listStorefronts(status, parseInt(page) || 1, parseInt(limit) || 20);
  }

  @Get(':id')
  async getStorefront(@Param('id') id: string) {
    return this.storefrontsService.getStorefront(id);
  }

  @Put(':id')
  async updateStorefront(@Param('id') id: string, @Body() dto: UpdateStorefrontDto) {
    return this.storefrontsService.updateStorefront(id, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body() dto: StatusDto) {
    return this.storefrontsService.updateStatus(id, dto.status);
  }

  @Get(':id/analytics')
  async getAnalytics(@Param('id') id: string, @Query('startDate') startDate?: string) {
    return this.storefrontsService.getAnalytics(id, startDate);
  }

  @Get(':id/hours')
  async getHours(@Param('id') id: string) {
    return this.storefrontsService.getHours(id);
  }

  @Put(':id/hours')
  async updateHours(@Param('id') id: string, @Body() dto: HoursDto) {
    return this.storefrontsService.updateHours(id, dto);
  }
}

interface CreateStorefrontDto {
  name: string;
  partnerId: string;
  address: string;
  phone?: string;
  email?: string;
  timezone?: string;
}

interface UpdateStorefrontDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
}

interface StatusDto {
  status: 'active' | 'inactive' | 'suspended';
}

interface HoursDto {
  monday?: { open: string; close: string };
  tuesday?: { open: string; close: string };
  wednesday?: { open: string; close: string };
  thursday?: { open: string; close: string };
  friday?: { open: string; close: string };
  saturday?: { open: string; close: string };
  sunday?: { open: string; close: string };
}