import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../modules/organizations/entities/organization.entity';
import { WebhookEvent } from './webhook-event.entity';

export enum WebhookEventType {
  TICKET_CREATED = 'ticket.created',
  TICKET_UPDATED = 'ticket.updated',
  TICKET_ASSIGNED = 'ticket.assigned',
  TICKET_RESOLVED = 'ticket.resolved',
  TICKET_CLOSED = 'ticket.closed',
  ASSIGNMENT_CREATED = 'assignment.created',
  ASSIGNMENT_ACCEPTED = 'assignment.accepted',
  ASSIGNMENT_DECLINED = 'assignment.declined',
  ASSIGNMENT_COMPLETED = 'assignment.completed',
  SLA_BREACHED = 'sla.breached',
  ESCALATION_TRIGGERED = 'escalation.triggered',
}

@Entity('webhooks')
export class Webhook {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Organization, (organization) => organization.webhooks)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column()
  url: string;

  @Column({ type: 'simple-array' })
  events: WebhookEventType[];

  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, string>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @OneToMany(() => WebhookEvent, (event) => event.webhook, { cascade: true })
  deliveries: WebhookEvent[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastDeliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
