import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  async createPaymentIntent(@Body() dto: CreateIntentDto) {
    return this.paymentsService.createPaymentIntent(dto.amount, dto.currency, dto.customerId);
  }

  @Post('confirm')
  async confirmPayment(@Body() dto: ConfirmDto) {
    return this.paymentsService.confirmPayment(dto.paymentIntentId);
  }

  @Get(':id')
  async getPayment(@Param('id') id: string) {
    return this.paymentsService.getPayment(id);
  }

  @Post('refund')
  async refundPayment(@Body() dto: RefundDto) {
    return this.paymentsService.refundPayment(dto.paymentId, dto.amount);
  }

  @Get('order/:orderId')
  async getOrderPayments(@Param('orderId') orderId: string) {
    return this.paymentsService.getOrderPayments(orderId);
  }

  @Post('driver/:driverId/payout')
  async createPayout(@Param('driverId') driverId: string, @Body() dto: PayoutDto) {
    return this.paymentsService.createPayout(driverId, dto.amount);
  }

  @Get('driver/:driverId/balance')
  async getDriverBalance(@Param('driverId') driverId: string) {
    return this.paymentsService.getDriverBalance(driverId);
  }

  @Get('history')
  async getPaymentHistory(
    @Query('customerId') customerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentsService.getPaymentHistory(customerId, startDate, endDate);
  }
}

interface CreateIntentDto {
  amount: number;
  currency: string;
  customerId: string;
}

interface ConfirmDto {
  paymentIntentId: string;
}

interface RefundDto {
  paymentId: string;
  amount?: number;
}

interface PayoutDto {
  amount: number;
}