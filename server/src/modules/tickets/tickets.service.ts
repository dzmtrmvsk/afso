import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { SlaService } from '../sla/sla.service';
import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../notifications/events.gateway';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Escalation, EscalationLevel, EscalationStatus } from '../sla/entities/escalation.entity';

import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class TicketFilters {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    private readonly slaService: SlaService,
    private readonly auditService: AuditService,
    private readonly eventsGateway: EventsGateway,
    @InjectQueue('auto-assign') private autoAssignQueue: Queue,
    @InjectQueue('sla-monitor') private slaQueue: Queue,
  ) {}

  async create(createTicketDto: CreateTicketDto, organizationId: string, userId: string): Promise<Ticket> {
    const slaDeadline = await this.slaService.calculateDeadline(
      createTicketDto.priority || TicketPriority.MEDIUM,
      organizationId,
    );

    const ticket = this.ticketRepository.create({
      ...createTicketDto,
      organizationId,
      createdById: userId,
      status: TicketStatus.PENDING,
      slaDeadline: slaDeadline || undefined,
    });

    const savedTicket = await this.ticketRepository.save(ticket);

    await this.auditService.logEvent({
      eventType: 'ticket.created',
      entityType: 'ticket',
      entityId: savedTicket.id,
      organizationId,
      userId,
      data: { after: savedTicket },
    });

    this.eventsGateway.emitToOrganization(organizationId, 'ticket.created', savedTicket);

    // Add to BullMQ for auto-assignment
    await this.autoAssignQueue.add('assign-ticket', {
      ticketId: savedTicket.id,
      organizationId,
    });

    // Schedule SLA monitor job
    if (slaDeadline) {
      const delay = slaDeadline.getTime() - Date.now();
      if (delay > 0) {
        await this.slaQueue.add('check-sla', {
          ticketId: savedTicket.id,
          organizationId,
        }, { delay });
      }
    }

    return savedTicket;
  }

  async findAll(organizationId: string, filters: TicketFilters): Promise<Ticket[]> {
    const { status, priority, page = 1, limit = 20 } = filters;
    const query = this.ticketRepository.createQueryBuilder('ticket')
      .where('ticket.organizationId = :organizationId', { organizationId });

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    if (priority) {
      query.andWhere('ticket.priority = :priority', { priority });
    }

    return query
      .orderBy('ticket.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();
  }

  async findOne(id: string, organizationId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, organizationId },
      relations: ['createdBy', 'assignment', 'assignment.agent', 'slaPolicy'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    return ticket;
  }

  async update(id: string, updateTicketDto: UpdateTicketDto, organizationId: string): Promise<Ticket> {
    const ticket = await this.findOne(id, organizationId);
    Object.assign(ticket, updateTicketDto);
    return this.ticketRepository.save(ticket);
  }

  async updateStatus(id: string, status: TicketStatus, organizationId: string, userId: string): Promise<Ticket> {
    const ticket = await this.findOne(id, organizationId);
    const oldStatus = ticket.status;
    ticket.status = status;
    
    if (status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    } else if (status === TicketStatus.CLOSED) {
      ticket.closedAt = new Date();
    }

    const updatedTicket = await this.ticketRepository.save(ticket);

    // Log event
    await this.auditService.logEvent({
      eventType: 'ticket.updated',
      entityType: 'ticket',
      entityId: updatedTicket.id,
      organizationId,
      userId,
      data: { 
        before: { status: oldStatus },
        after: { status: status }
      },
    });

    // Notify WebSocket
    this.eventsGateway.emitToOrganization(organizationId, 'ticket.updated', updatedTicket);

    return updatedTicket;
  }

  async handleSlaBreach(id: string, organizationId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, organizationId },
      relations: ['slaPolicy'],
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }

    if (ticket.slaBreached) {
      return ticket;
    }

    ticket.slaBreached = true;
    const savedTicket = await this.ticketRepository.save(ticket);

    // Create escalation record if policy has rules
    if (ticket.slaPolicy && ticket.slaPolicy.escalateOnBreach) {
      const escalationRepository = this.ticketRepository.manager.getRepository(Escalation);
      const escalation = escalationRepository.create({
        ticketId: ticket.id,
        organizationId,
        level: EscalationLevel.LEVEL_1,
        status: EscalationStatus.PENDING,
        reason: 'SLA response time exceeded',
        escalatedAt: new Date(),
      });
      await escalationRepository.save(escalation);
      
      // Notify managers if specified in policy
      if (ticket.slaPolicy.escalationRules?.notifyUserIds) {
        for (const managerId of ticket.slaPolicy.escalationRules.notifyUserIds) {
          this.eventsGateway.emitToUser(managerId, 'ticket.escalated', {
            ticketId: ticket.id,
            reason: 'SLA breach escalation',
          });
        }
      }
    }

    // Log event
    await this.auditService.logEvent({
      eventType: 'sla.breached',
      entityType: 'ticket',
      entityId: savedTicket.id,
      organizationId,
      data: { after: savedTicket },
    });

    // Notify WebSocket
    this.eventsGateway.emitToOrganization(organizationId, 'sla.breached', savedTicket);

    return savedTicket;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const ticket = await this.findOne(id, organizationId);
    await this.ticketRepository.remove(ticket);
  }
}
