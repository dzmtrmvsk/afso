import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { User } from '../../users/entities/user.entity';
import { Organization } from '../../organizations/entities/organization.entity';

export enum EscalationLevel {
  LEVEL_1 = 'level_1',
  LEVEL_2 = 'level_2',
  LEVEL_3 = 'level_3',
  CRITICAL = 'critical',
}

export enum EscalationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CANCELLED = 'cancelled',
}

@Entity('escalations')
export class Escalation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.escalations, { onDelete: 'CASCADE' })
  ticket: Ticket;

  @Column()
  ticketId: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: EscalationLevel })
  level: EscalationLevel;

  @Column({ type: 'enum', enum: EscalationStatus, default: EscalationStatus.PENDING })
  status: EscalationStatus;

  @ManyToOne(() => User, { nullable: true })
  escalatedTo: User;

  @Column({ nullable: true })
  escalatedToId: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'timestamp' })
  escalatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  notificationsSent: Array<{
    userId: string;
    channel: string;
    sentAt: Date;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
