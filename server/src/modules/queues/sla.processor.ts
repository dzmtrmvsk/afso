import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { TicketsService } from '../tickets/tickets.service';
import { SlaService } from '../sla/sla.service';
import { TicketStatus } from '../tickets/entities/ticket.entity';
import { AuditService } from '../audit/audit.service';
import { EventsGateway } from '../notifications/events.gateway';
import { Logger } from '@nestjs/common';

@Processor('sla-monitor')
export class SlaProcessor {
  private readonly logger = new Logger(SlaProcessor.name);

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly slaService: SlaService,
    private readonly auditService: AuditService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  @Process('check-sla')
  async handleSlaCheck(job: Job<{ ticketId: string; organizationId: string }>) {
    const { ticketId, organizationId } = job.data;
    
    try {
      const ticket = await this.ticketsService.findOne(ticketId, organizationId);
      
      // If ticket is already resolved or closed, SLA is met
      if (ticket.status === TicketStatus.RESOLVED || ticket.status === TicketStatus.CLOSED) {
        return;
      }

      // Check if deadline passed
      if (ticket.slaDeadline && new Date() > ticket.slaDeadline && !ticket.slaBreached) {
        await this.ticketsService.handleSlaBreach(ticket.id, organizationId);
        this.logger.warn(`SLA breached for ticket ${ticketId}`);
      }
    } catch (error) {
      this.logger.error(`Failed SLA check for ticket ${ticketId}: ${error.message}`);
    }
  }
}
