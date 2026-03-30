import { IsNotEmpty, IsString, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { TicketPriority } from '../entities/ticket.entity';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  serviceTypeName?: string;

  @IsOptional()
  @IsString()
  serviceTypeId?: string;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  slaPolicyId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  estimatedDurationMinutes?: number;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(TicketPriority)
  @IsOptional()
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  teamId?: string;

  @IsOptional()
  @IsString()
  slaPolicyId?: string;
}

export class UpdateTicketStatusDto {
  @IsEnum(['pending', 'in_queue', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed'])
  status: string;
}
