import { IsEnum, IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsObject, IsDateString } from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planId: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyPrice: number;

  @IsNumber()
  @IsOptional()
  userCount?: number;

  @IsBoolean()
  @IsOptional()
  autoRenew?: boolean;

  @IsObject()
  @IsOptional()
  features?: Record<string, boolean>;
}

export class UpdateSubscriptionStatusDto {
  @IsEnum(SubscriptionStatus)
  @IsNotEmpty()
  status: SubscriptionStatus;
}
