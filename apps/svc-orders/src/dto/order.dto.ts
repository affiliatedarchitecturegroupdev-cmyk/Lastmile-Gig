import { IsString, IsNumber, IsArray, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  partnerId: string;

  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @IsArray()
  deliveryLocation: { lat: number; lng: number };

  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  customerPhone?: string;

  @IsString()
  @IsOptional()
  customerNote?: string;

  @IsString()
  @IsOptional()
  paymentRef?: string;
}

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  quantity: number;

  @IsString()
  @IsOptional()
  note?: string;

  @IsOptional()
  options?: Record<string, any>;
}

export class ConfirmOrderDto {}

export class StartPreparingDto {
  @IsNumber()
  @IsOptional()
  @Min(5)
  @Max(60)
  estimatedPrepMinutes?: number;
}

export class MarkDispatchedDto {
  @IsString()
  @IsOptional()
  driverId?: string;

  @IsArray()
  @IsOptional()
  pickupLocation?: { lat: number; lng: number };
}

export class DeliverOrderDto {
  @IsArray()
  @IsOptional()
  location?: { lat: number; lng: number };

  @IsString()
  @IsOptional()
  photo?: string;
}

export class CancelOrderDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ModifyOrderDto {
  @IsArray()
  @IsOptional()
  addedItems?: CreateOrderItemDto[];

  @IsArray()
  @IsOptional()
  removedItemIds?: string[];
}

export class RateOrderDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

export class AssignDriverDto {
  @IsString()
  @IsNotEmpty()
  driverId: string;
}