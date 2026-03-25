import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { TicketsService } from '../tickets/tickets.service';
import { AssignmentsService } from '../assignments/assignments.service';
import { UsersService } from '../users/users.service';
import { TicketStatus } from '../tickets/entities/ticket.entity';
import { UserRole } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Processor('auto-assign')
export class AutoAssignProcessor {
  private readonly logger = new Logger(AutoAssignProcessor.name);

  constructor(
    private readonly ticketsService: TicketsService,
    private readonly assignmentsService: AssignmentsService,
    private readonly usersService: UsersService,
  ) {}

  @Process('assign-ticket')
  async handleAutoAssignment(job: Job<{ ticketId: string; organizationId: string }>) {
    const { ticketId, organizationId } = job.data;
    this.logger.log(`Processing auto-assignment for ticket ${ticketId}`);

    try {
      const ticket = await this.ticketsService.findOne(ticketId, organizationId);
      
      // Validation: Only auto-assign pending or in-queue tickets
      if (ticket.status !== TicketStatus.PENDING && ticket.status !== TicketStatus.IN_QUEUE) {
        this.logger.debug(`Ticket ${ticketId} is already ${ticket.status}, skipping auto-assign`);
        return;
      }

      // 1. Fetch all active agents in the organization, ordered by current load
      const agents = await this.usersService.findAllAgents(organizationId);
      
      if (agents.length === 0) {
        this.logger.warn(`No active agents found for organization ${organizationId}. Ticket ${ticketId} remains in queue.`);
        return;
      }

      // Filter by skills if required, then pick the one with the least load.
      let eligibleAgents = agents;
      if (ticket.requiredSkills && ticket.requiredSkills.length > 0) {
        eligibleAgents = agents.filter(agent => 
          ticket.requiredSkills.every(skill => agent.skills?.includes(skill))
        );
      }

      if (eligibleAgents.length === 0) {
        this.logger.warn(`No agents with matching skills (${ticket.requiredSkills?.join(', ')}) found for ticket ${ticketId}`);
        // In production, we might notify a dispatcher here
        return;
      }

      // 3. Selection: agents are already ordered by currentLoad ASC from UsersService.findAllAgents
      const selectedAgent = eligibleAgents[0];

      // 4. Create assignment and update state
      await this.assignmentsService.create({
        ticketId: ticket.id,
        agentId: selectedAgent.id,
        notes: `System auto-assigned based on skill match and load (${selectedAgent.currentLoad} active tasks).`,
      });

      this.logger.log(`Ticket ${ticketId} successfully auto-assigned to agent ${selectedAgent.firstName} ${selectedAgent.lastName} (ID: ${selectedAgent.id})`);
    } catch (error) {
      this.logger.error(`Critical error during auto-assignment for ticket ${ticketId}: ${error.message}`, error.stack);
      throw error; // Let BullMQ handle retries based on config
    }
  }
}
