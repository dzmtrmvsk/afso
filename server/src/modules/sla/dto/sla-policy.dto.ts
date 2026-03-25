import { IsNotEmpty, IsString, IsEnum, IsInt, IsBoolean, IsOptional, IsArray, IsObject, Min } from 'class-validator';
import { TicketPriority } from '../../tickets/entities/ticket.entity';

export class CreateSlaPolicyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TicketPriority)
  priority: TicketPriority;

  @IsInt()
  @Min(0)
  responseTimeMinutes: number;

  @IsInt()
  @Min(0)
  resolutionTimeMinutes: number;

  @IsBoolean()
  @IsOptional()
  escalateOnBreach?: boolean;

  @IsOptional()
  @IsObject()
  escalationRules?: {
    notifyUserIds: string[];
    reassignToTeamId?: string;
  };
}

export class UpdateSlaPolicyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsInt()
  @Min(0)
  @IsOptional()
  responseTimeMinutes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  resolutionTimeMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  escalateOnBreach?: boolean;
}
