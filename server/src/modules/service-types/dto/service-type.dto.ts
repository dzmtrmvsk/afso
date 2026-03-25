import { IsNotEmpty, IsString, IsOptional, IsInt, IsNumber, IsBoolean, IsArray, Min } from 'class-validator';

export class CreateServiceTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  estimatedDurationMinutes: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseCost?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateServiceTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  estimatedDurationMinutes?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  baseCost?: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  requiredSkills?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
