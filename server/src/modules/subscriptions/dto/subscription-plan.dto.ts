import { IsEnum, IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { PlanType } from '../entities/subscription-plan.entity';

export class CreateSubscriptionPlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(PlanType)
  @IsNotEmpty()
  type: PlanType;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  monthlyPrice: number;

  @IsNumber()
  @IsOptional()
  annualPrice?: number;

  @IsNumber()
  @IsNotEmpty()
  maxUsers: number;

  @IsNumber()
  @IsNotEmpty()
  maxTicketsPerMonth: number;

  @IsNumber()
  @IsOptional()
  maxTeams?: number;

  @IsObject()
  @IsNotEmpty()
  features: Record<string, boolean>;

  @IsObject()
  @IsOptional()
  limits?: Record<string, number>;
}

export class UpdateSubscriptionPlanDto extends CreateSubscriptionPlanDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
