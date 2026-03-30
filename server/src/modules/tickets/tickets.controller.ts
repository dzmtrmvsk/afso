import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto, UpdateTicketStatusDto } from './dto/ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketStatus } from './entities/ticket.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import type { AuthenticatedRequest } from '../../shared/interfaces/auth-request.interface';
import { TicketFilters } from './dto/ticket-filters.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.MANAGER)
  create(@Body() createTicketDto: CreateTicketDto, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.create(createTicketDto, req.user.organizationId, req.user.userId);
  }

  @Get()
  findAll(@Query() query: TicketFilters, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.findAll(req.user.organizationId, query);
  }

  @Get('my')
  @Roles(UserRole.AGENT)
  myTasks(@Request() req: AuthenticatedRequest) {
    return this.ticketsService.findByAgent(req.user.userId, req.user.organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  @Roles(UserRole.MANAGER)
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.update(id, updateTicketDto, req.user.organizationId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateTicketStatusDto, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.updateStatus(id, updateStatusDto.status as TicketStatus, req.user.organizationId, req.user.userId);
  }

  @Post(':id/start')
  @Roles(UserRole.AGENT)
  startWork(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.startWork(id, req.user.organizationId, req.user.userId);
  }

  @Post(':id/pause')
  @Roles(UserRole.AGENT)
  pauseWork(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.pauseWork(id, req.user.organizationId, req.user.userId);
  }

  @Post(':id/complete')
  @Roles(UserRole.AGENT)
  completeWork(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.completeWork(id, req.user.organizationId, req.user.userId);
  }

  @Delete(':id')
  @Roles(UserRole.MANAGER)
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.ticketsService.remove(id, req.user.organizationId);
  }
}
