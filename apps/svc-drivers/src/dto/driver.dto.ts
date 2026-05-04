import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, Min, Max, IsDateString } from 'class-validator';
import { VehicleType } from '../entities/driver.entity';

export class RegisterDriverDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsEnum(VehicleType)
  vehicleType: VehicleType;

  @IsString()
  vehiclePlate: string;

  @IsString()
  vehicleModel: string;

  @IsNumber()
  @Min(1990)
  @Max(2030)
  vehicleYear: number;

  @IsString()
  licenseNumber: string;

  @IsDateString()
  licenseExpiry: string;

  @IsString()
  insuranceNumber: string;

  @IsDateString()
  insuranceExpiry: string;
}

export class UpdateDriverDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  profilePhotoUrl?: string;
}

export class UpdateAvailabilityDto {
  @IsEnum(['online', 'offline', 'busy'])
  availability: 'online' | 'offline' | 'busy';
}

export class UpdateLocationDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  @IsOptional()
  heading?: number;

  @IsNumber()
  @IsOptional()
  speed?: number;
}

export class UpdateStatusDto {
  @IsEnum(['active', 'inactive'])
  status: 'active' | 'inactive';
}

export class RequestPayoutDto {
  @IsNumber()
  @Min(10)
  @Max(10000)
  amount: number;

  @IsString()
  @IsOptional()
  bankAccount?: string;
}