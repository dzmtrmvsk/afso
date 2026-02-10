import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Assignment } from './assignment.entity';
import { SlaPolicy } from './sla-policy.entity';

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum TicketStatus {
  PENDING = 'pending',
  IN_QUEUE = 'in_queue',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.PENDING })
  status: TicketStatus;

  @ManyToOne(() => Organization, (organization) => organization.tickets)
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => User, { nullable: true })
  createdBy: User;

  @Column({ nullable: true })
  createdById: string;

  @OneToOne(() => Assignment, (assignment) => assignment.ticket, { nullable: true })
  assignment: Assignment;

  @ManyToOne(() => SlaPolicy, { nullable: true })
  slaPolicy: SlaPolicy;

  @Column({ nullable: true })
  slaPolicyId: string;

  @Column({ type: 'timestamp', nullable: true })
  slaDeadline: Date;

  @Column({ default: false })
  slaBreached: boolean;

  @Column({ type: 'jsonb', nullable: true })
  location: {
    address: string;
    latitude: number;
    longitude: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  requiredSkills: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;
}
