import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';

export enum HistoryAction {
  CREATED = 'created',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  ASSIGNED = 'assigned',
  REASSIGNED = 'reassigned',
  UNASSIGNED = 'unassigned',
  COMMENT_ADDED = 'comment_added',
  SLA_SET = 'sla_set',
  SLA_BREACHED = 'sla_breached',
  ESCALATED = 'escalated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REOPENED = 'reopened',
  CUSTOM_FIELD_CHANGED = 'custom_field_changed',
}

@Entity('ticket_history')
export class TicketHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.history, { onDelete: 'CASCADE' })
  ticket: Ticket;

  @Column()
  ticketId: string;

  @ManyToOne(() => User, { nullable: true })
  changedBy: User;

  @Column({ nullable: true })
  changedById: string;

  @Column({ type: 'enum', enum: HistoryAction })
  action: HistoryAction;

  @Column({ type: 'jsonb', nullable: true })
  oldValue: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  newValue: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
