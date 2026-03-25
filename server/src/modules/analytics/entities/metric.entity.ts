import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

export enum MetricType {
  SLA_COMPLIANCE = 'sla_compliance',
  AGENT_PERFORMANCE = 'agent_performance',
  QUEUE_LENGTH = 'queue_length',
  AVERAGE_RESOLUTION_TIME = 'average_resolution_time',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',
  TICKET_VOLUME = 'ticket_volume',
  RESPONSE_TIME = 'response_time',
  ESCALATION_RATE = 'escalation_rate',
}

@Entity('metrics')
export class Metric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: MetricType })
  type: MetricType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
