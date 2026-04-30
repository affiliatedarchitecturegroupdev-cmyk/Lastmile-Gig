import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  async createOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  @Get()
  async listOrders(
    @Query('customerId') customerId?: string,
    @Query('partnerId') partnerId?: string,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.ordersService.findAll({
      customerId,
      partnerId,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  }

  @Patch(':id/confirm')
  async confirmOrder(@Param('id') id: string) {
    return this.ordersService.transition(id, 'confirmed');
  }

  @Patch(':id/preparing')
  async markPreparing(@Param('id') id: string) {
    return this.ordersService.transition(id, 'preparing');
  }

  @Patch(':id/ready')
  async markReady(@Param('id') id: string) {
    return this.ordersService.transition(id, 'ready');
  }

  @Patch(':id/dispatch')
  async dispatchOrder(
    @Param('id') id: string,
    @Body() dto: DispatchOrderDto,
  ) {
    return this.ordersService.dispatch(id, dto.driverId);
  }

  @Patch(':id/deliver')
  async deliverOrder(
    @Param('id') id: string,
    @Body() dto: DeliverOrderDto,
  ) {
    return this.ordersService.deliver(id, dto);
  }

  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancel(id, dto.reason);
  }

  @Get(':id/history')
  async getOrderHistory(@Param('id') id: string) {
    return this.ordersService.getStatusHistory(id);
  }

  @Post(':id/rate')
  async rateOrder(
    @Param('id') id: string,
    @Body() dto: RateOrderDto,
  ) {
    return this.ordersService.rate(id, dto.rating, dto.feedback);
  }
}

interface CreateOrderDto {
  customerId: string;
  partnerId: string;
  items: OrderItem[];
  deliveryAddress: DeliveryAddress;
  paymentMethod: string;
  paymentRef: string;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface DeliveryAddress {
  street: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
}

interface DispatchOrderDto {
  driverId: string;
}

interface DeliverOrderDto {
  latitude: number;
  longitude: number;
  photoUrl?: string;
}

interface CancelOrderDto {
  reason: string;
}

interface RateOrderDto {
  rating: number;
  feedback?: string;
}