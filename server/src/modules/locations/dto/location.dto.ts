import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsObject } from 'class-validator';
import { LocationType } from '../entities/location.entity';

export type DistanceUnit = 'km' | 'miles';

export class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LocationType)
  @IsNotEmpty()
  type: LocationType;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsObject()
  @IsOptional()
  serviceRadius?: {
    value: number;
    unit: DistanceUnit;
  };

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(LocationType)
  @IsOptional()
  type?: LocationType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsObject()
  @IsOptional()
  serviceRadius?: {
    value: number;
    unit: DistanceUnit;
  };

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
