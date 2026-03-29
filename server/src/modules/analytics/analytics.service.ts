import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as cacheManager from 'cache-manager';
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
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: cacheManager.Cache,
  ) {}

  async getDashboardStats(organizationId: string, from?: Date, to?: Date) {
    const startDate = from || new Date(new Date().setDate(new Date().getDate() - 30));
    const endDate = to || new Date();

    // Generate cache key based on organization and date range
    const cacheKey = `dashboard:${organizationId}:${startDate.toISOString()}:${endDate.toISOString()}`;
    
    // Try to get from cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Optimize ticket stats with single query using aggregation
    const ticketStats = await this.ticketRepository
      .createQueryBuilder('ticket')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN status = :resolved THEN 1 ELSE 0 END)', 'resolved')
      .addSelect('SUM(CASE WHEN status = :pending THEN 1 ELSE 0 END)', 'pending')
      .addSelect('SUM(CASE WHEN slaBreached = true THEN 1 ELSE 0 END)', 'breached')
      .where('ticket.organizationId = :organizationId', { organizationId })
      .andWhere('ticket.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .setParameters({ 
        resolved: TicketStatus.RESOLVED, 
        pending: TicketStatus.PENDING 
      })
      .getRawOne();

    // Optimize agent stats with single query using aggregation
    const agentStats = await this.userRepository
      .createQueryBuilder('user')
      .select('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN status = :active THEN 1 ELSE 0 END)', 'active')
      .addSelect('AVG(COALESCE(currentLoad, 0))', 'averageLoad')
      .where('user.organizationId = :organizationId', { organizationId })
      .andWhere('user.role = :role', { role: UserRole.AGENT })
      .setParameter('active', UserStatus.ACTIVE)
      .getRawOne();

    const totalTickets = parseInt(ticketStats.total) || 0;
    const breachedTickets = parseInt(ticketStats.breached) || 0;
    const complianceRate = totalTickets > 0 
      ? Number(((totalTickets - breachedTickets) / totalTickets * 100).toFixed(2)) 
      : 100;

    const result = {
      tickets: {
        total: totalTickets,
        resolved: parseInt(ticketStats.resolved) || 0,
        pending: parseInt(ticketStats.pending) || 0,
        slaBreached: breachedTickets,
      },
      agents: {
        total: parseInt(agentStats.total) || 0,
        active: parseInt(agentStats.active) || 0,
        averageLoad: Number(parseFloat(agentStats.averageLoad || '0').toFixed(2)),
      },
      sla: {
        complianceRate,
      }
    };

    await this.cacheManager.set(cacheKey, result, 300000);

    return result;
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
