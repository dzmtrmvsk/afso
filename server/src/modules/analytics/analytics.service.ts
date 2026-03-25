import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Metric, MetricType } from './entities/metric.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Metric)
    private readonly metricRepository: Repository<Metric>,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getDashboardStats(organizationId: string, from?: Date, to?: Date) {
    const startDate = from || new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = to || new Date();

    const [totalTickets, resolvedTickets, pendingTickets, breachedTickets] = await Promise.all([
      this.ticketRepository.count({ where: { organizationId, createdAt: Between(startDate, endDate) } }),
      this.ticketRepository.count({ where: { organizationId, status: TicketStatus.RESOLVED, createdAt: Between(startDate, endDate) } }),
      this.ticketRepository.count({ where: { organizationId, status: TicketStatus.PENDING, createdAt: Between(startDate, endDate) } }),
      this.ticketRepository.count({ where: { organizationId, slaBreached: true, createdAt: Between(startDate, endDate) } }),
    ]);

    const [totalAgents, activeAgents] = await Promise.all([
      this.userRepository.count({ where: { organizationId, role: UserRole.AGENT } }),
      this.userRepository.count({ where: { organizationId, role: UserRole.AGENT, status: UserStatus.ACTIVE } }),
    ]);

    // Calculate average load
    const agents = await this.userRepository.find({ where: { organizationId, role: UserRole.AGENT } });
    const averageLoad = agents.length > 0 
      ? agents.reduce((acc, agent) => acc + (agent.currentLoad || 0), 0) / agents.length 
      : 0;

    // SLA Compliance rate calculation
    const complianceRate = totalTickets > 0 
      ? Number(((totalTickets - breachedTickets) / totalTickets * 100).toFixed(2)) 
      : 100;

    return {
      tickets: {
        total: totalTickets,
        resolved: resolvedTickets,
        pending: pendingTickets,
        slaBreached: breachedTickets,
      },
      agents: {
        total: totalAgents,
        active: activeAgents,
        averageLoad: Number(averageLoad.toFixed(2)),
      },
      sla: {
        complianceRate,
      }
    };
  }

  async saveMetric(organizationId: string, type: MetricType, value: number, dimensions?: Record<string, string>) {
    const metric = this.metricRepository.create({
      organizationId,
      type,
      value,
      dimensions,
      date: new Date(),
    });
    return this.metricRepository.save(metric);
  }
}
