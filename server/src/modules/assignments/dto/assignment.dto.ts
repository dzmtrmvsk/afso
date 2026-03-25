import { IsNotEmpty, IsUUID, IsString, IsOptional, IsEnum } from 'class-validator';
import { AssignmentStatus } from '../entities/assignment.entity';

export class CreateAssignmentDto {
  @IsUUID()
  @IsNotEmpty()
  ticketId: string;

  @IsUUID()
  @IsNotEmpty()
  agentId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAssignmentStatusDto {
  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class DeclineAssignmentDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
