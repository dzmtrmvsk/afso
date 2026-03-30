import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from './entities/ticket.entity';
import { CreateTicketDto, UpdateTicketDto } from './dto/ticket.dto';
import { Customer } from '../customers/entities/customer.entity';
import { ServiceType } from '../service-types/entities/service-type.entity';
import { SlaService } from '../sla/sla.service';
import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../notifications/events.gateway';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Escalation, EscalationLevel, EscalationStatus } from '../sla/entities/escalation.entity';
import { TicketFilters } from './dto/ticket-filters.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(ServiceType)
    private readonly serviceTypeRepository: Repository<ServiceType>,
    private readonly slaService: SlaService,
    private readonly auditService: AuditService,
    private readonly eventsGateway: EventsGateway,
    @InjectQueue('auto-assign') private autoAssignQueue: Queue,
    @InjectQueue('sla-monitor') private slaQueue: Queue,
  ) {}

  async create(dto: CreateTicketDto, organizationId: string, userId: string): Promise<Ticket> {
    let customerId = dto.customerId;
    if (!customerId && dto.customerName) {
      const customer = this.customerRepository.create({
        name: dto.customerName,
        email: dto.customerEmail || `${Date.now()}@temp.local`,
        organizationId,
      });
      const saved = await this.customerRepository.save(customer);
      customerId = saved.id;
    }

    let serviceTypeId = dto.serviceTypeId;
    if (!serviceTypeId && dto.serviceTypeName) {
      const st = this.serviceTypeRepository.create({
        name: dto.serviceTypeName,
        organizationId,
      });
      const saved = await this.serviceTypeRepository.save(st);
      serviceTypeId = saved.id;
    }

    const slaDeadline = await this.slaService.calculateDeadline(
      dto.priority || TicketPriority.MEDIUM,
      organizationId,
    );

    const ticket = this.ticketRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority || TicketPriority.MEDIUM,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      address: dto.address,
      customerId,
      serviceTypeId,
      teamId: dto.teamId,
      slaPolicyId: dto.slaPolicyId,
      estimatedDurationMinutes: dto.estimatedDurationMinutes || 0,
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

    await this.autoAssignQueue.add('assign-ticket', {
      ticketId: savedTicket.id,
      organizationId,
      teamId: dto.teamId,
    });

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

  async findAll(organizationId: string, filters: TicketFilters): Promise<{ data: Ticket[]; total: number; page: number; limit: number; totalPages: number }> {
    const { status, priority, page = 1, limit = 20 } = filters;
    const query = this.ticketRepository.createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.team', 'team')
      .leftJoinAndSelect('ticket.assignment', 'assignment')
      .leftJoinAndSelect('assignment.agent', 'agent')
      .where('ticket.organizationId = :organizationId', { organizationId });

    if (status) {
      query.andWhere('ticket.status = :status', { status });
    }

    if (priority) {
      query.andWhere('ticket.priority = :priority', { priority });
    }

    const [data, total] = await query
      .orderBy('ticket.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByAgent(agentId: string, organizationId: string): Promise<Ticket[]> {
    return this.ticketRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.assignment', 'assignment')
      .leftJoinAndSelect('ticket.team', 'team')
      .leftJoinAndSelect('ticket.slaPolicy', 'slaPolicy')
      .where('assignment.agentId = :agentId', { agentId })
      .andWhere('ticket.organizationId = :organizationId', { organizationId })
      .andWhere('ticket.status NOT IN (:...closedStatuses)', {
        closedStatuses: [TicketStatus.CLOSED],
      })
      .orderBy('ticket.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string, organizationId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, organizationId },
      relations: ['createdBy', 'assignment', 'assignment.agent', 'slaPolicy', 'team', 'customer', 'serviceType'],
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

  async startWork(id: string, organizationId: string, userId: string): Promise<Ticket> {
    const ticket = await this.findOne(id, organizationId);
    if (ticket.status !== TicketStatus.ASSIGNED && ticket.status !== TicketStatus.ON_HOLD) {
      throw new BadRequestException('Ticket must be assigned or on hold to start work');
    }
    const now = new Date();
    ticket.status = TicketStatus.IN_PROGRESS;
    ticket.startedAt = ticket.startedAt || now;
    ticket.pausedAt = null as any;
    return this.ticketRepository.save(ticket);
  }

  async pauseWork(id: string, organizationId: string, userId: string): Promise<Ticket> {
    const ticket = await this.findOne(id, organizationId);
    if (ticket.status !== TicketStatus.IN_PROGRESS) {
      throw new BadRequestException('Ticket must be in progress to pause');
    }
    const now = new Date();
    const elapsed = ticket.pausedAt ? 0 : (now.getTime() - (ticket.startedAt?.getTime() || now.getTime()));
    ticket.totalWorkTimeMs = (ticket.totalWorkTimeMs || 0) + elapsed;
    ticket.pausedAt = now;
    ticket.status = TicketStatus.ON_HOLD;
    return this.ticketRepository.save(ticket);
  }

  async completeWork(id: string, organizationId: string, userId: string): Promise<Ticket> {
    const ticket = await this.findOne(id, organizationId);
    if (ticket.status !== TicketStatus.IN_PROGRESS && ticket.status !== TicketStatus.ON_HOLD) {
      throw new BadRequestException('Ticket must be in progress or on hold to complete');
    }
    const now = new Date();
    if (ticket.status === TicketStatus.IN_PROGRESS && ticket.startedAt) {
      const elapsed = now.getTime() - ticket.startedAt.getTime();
      ticket.totalWorkTimeMs = (ticket.totalWorkTimeMs || 0) + elapsed;
    }
    ticket.status = TicketStatus.RESOLVED;
    ticket.resolvedAt = now;
    ticket.pausedAt = null as any;

    const saved = await this.ticketRepository.save(ticket);

    await this.auditService.logEvent({
      eventType: 'ticket.resolved',
      entityType: 'ticket',
      entityId: saved.id,
      organizationId,
      userId,
      data: { after: saved },
    });

    this.eventsGateway.emitToOrganization(organizationId, 'ticket.resolved', saved);
    return saved;
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

    await this.auditService.logEvent({
      eventType: 'ticket.updated',
      entityType: 'ticket',
      entityId: updatedTicket.id,
      organizationId,
      userId,
      data: { before: { status: oldStatus }, after: { status } },
    });

    this.eventsGateway.emitToOrganization(organizationId, 'ticket.updated', updatedTicket);
    return updatedTicket;
  }

  async handleSlaBreach(id: string, organizationId: string): Promise<Ticket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id, organizationId },
      relations: ['slaPolicy'],
    });

    if (!ticket) throw new NotFoundException(`Ticket with ID ${id} not found`);
    if (ticket.slaBreached) return ticket;

    ticket.slaBreached = true;
    const savedTicket = await this.ticketRepository.save(ticket);

    if (ticket.slaPolicy?.escalateOnBreach) {
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
    }

    this.eventsGateway.emitToOrganization(organizationId, 'sla.breached', savedTicket);
    return savedTicket;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const ticket = await this.findOne(id, organizationId);
    await this.ticketRepository.remove(ticket);
  }
}
