import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assignment, AssignmentStatus } from './entities/assignment.entity';
import { CreateAssignmentDto, UpdateAssignmentStatusDto } from './dto/assignment.dto';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { User } from '../users/entities/user.entity';

import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../notifications/events.gateway';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private readonly assignmentRepository: Repository<Assignment>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly auditService: AuditService,
    private readonly eventsGateway: EventsGateway,
    @InjectQueue('auto-assign') private autoAssignQueue: Queue,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<Assignment> {
    const { ticketId, agentId, notes } = createAssignmentDto;

    const ticket = await this.ticketRepository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    const agent = await this.userRepository.findOne({ where: { id: agentId } });
    if (!agent) throw new NotFoundException('Agent not found');

    const existingAssignment = await this.assignmentRepository.findOne({ where: { ticketId } });
    if (existingAssignment && existingAssignment.status !== AssignmentStatus.DECLINED) {
      throw new ConflictException('Ticket already has an active assignment');
    }

    const assignment = this.assignmentRepository.create({
      ticketId,
      agentId,
      notes,
      status: AssignmentStatus.PENDING,
      isAutoAssigned: false,
    });

    const savedAssignment = await this.assignmentRepository.save(assignment);

    // Update ticket status
    ticket.status = TicketStatus.ASSIGNED;
    await this.ticketRepository.save(ticket);

    // Update agent load
    agent.currentLoad += 1;
    await this.userRepository.save(agent);

    // Log event
    await this.auditService.logEvent({
      eventType: 'ticket.assigned',
      entityType: 'assignment',
      entityId: savedAssignment.id,
      organizationId: agent.organizationId,
      userId: agent.id,
      data: { after: savedAssignment },
    });

    // Notify agent via WebSocket
    this.eventsGateway.emitToUser(agentId, 'assignment.created', savedAssignment);

    return savedAssignment;
  }

  async accept(id: string, userId: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ 
      where: { id, agentId: userId },
      relations: ['ticket']
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = AssignmentStatus.ACCEPTED;
    assignment.acceptedAt = new Date();
    
    const savedAssignment = await this.assignmentRepository.save(assignment);

    // Log event
    await this.auditService.logEvent({
      eventType: 'assignment.accepted',
      entityType: 'assignment',
      entityId: savedAssignment.id,
      organizationId: savedAssignment.ticket.organizationId,
      userId,
      data: { after: savedAssignment },
    });

    return savedAssignment;
  }

  async decline(id: string, userId: string, reason: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ 
      where: { id, agentId: userId },
      relations: ['ticket', 'agent']
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    const oldStatus = assignment.status;
    assignment.status = AssignmentStatus.DECLINED;
    assignment.notes = reason;
    
    assignment.ticket.status = TicketStatus.PENDING;
    await this.ticketRepository.save(assignment.ticket);

    assignment.agent.currentLoad = Math.max(0, assignment.agent.currentLoad - 1);
    await this.userRepository.save(assignment.agent);

    const savedAssignment = await this.assignmentRepository.save(assignment);

    await this.auditService.logEvent({
      eventType: 'assignment.declined',
      entityType: 'assignment',
      entityId: savedAssignment.id,
      organizationId: savedAssignment.ticket.organizationId,
      userId,
      data: { 
        before: { status: oldStatus },
        after: { status: AssignmentStatus.DECLINED, reason }
      },
    });

    await this.autoAssignQueue.add('assign-ticket', {
      ticketId: assignment.ticketId,
      organizationId: assignment.ticket.organizationId,
    });

    return savedAssignment;
  }

  async complete(id: string, userId: string, notes?: string): Promise<Assignment> {
    const assignment = await this.assignmentRepository.findOne({ 
      where: { id, agentId: userId },
      relations: ['ticket', 'agent']
    });
    if (!assignment) throw new NotFoundException('Assignment not found');

    assignment.status = AssignmentStatus.COMPLETED;
    assignment.completedAt = new Date();
    if (notes) assignment.notes = notes;

    assignment.ticket.status = TicketStatus.RESOLVED;
    assignment.ticket.resolvedAt = new Date();
    await this.ticketRepository.save(assignment.ticket);

    assignment.agent.currentLoad = Math.max(0, assignment.agent.currentLoad - 1);
    await this.userRepository.save(assignment.agent);

    const savedAssignment = await this.assignmentRepository.save(assignment);

    await this.auditService.logEvent({
      eventType: 'assignment.completed',
      entityType: 'assignment',
      entityId: savedAssignment.id,
      organizationId: savedAssignment.ticket.organizationId,
      userId,
      data: { after: savedAssignment },
    });

    return savedAssignment;
  }

  async findByAgent(agentId: string): Promise<Assignment[]> {
    return this.assignmentRepository.find({
      where: { agentId },
      relations: ['ticket'],
      order: { createdAt: 'DESC' }
    });
  }
}
