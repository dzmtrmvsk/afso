import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { SlaPolicy } from '../../sla/entities/sla-policy.entity';
import { TicketComment } from './ticket-comment.entity';
import { TicketHistory } from './ticket-history.entity';
import { TicketAttachment } from './ticket-attachment.entity';
import { Escalation } from '../../sla/entities/escalation.entity';
import { Location } from '../../locations/entities/location.entity';
import { Customer } from '../../customers/entities/customer.entity';
import { ServiceType } from '../../service-types/entities/service-type.entity';

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

  @Column({ type: 'enum', enum: TicketPriority, enumName: 'ticket_priority_enum', default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, enumName: 'ticket_status_enum', default: TicketStatus.PENDING })
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

  @ManyToOne(() => Location, (location) => location.tickets, { nullable: true })
  location: Location;

  @Column({ nullable: true })
  locationId: string;

  @ManyToOne(() => Customer, (customer) => customer.tickets, { nullable: true })
  customer: Customer;

  @Column({ nullable: true })
  customerId: string;

  @ManyToOne(() => ServiceType, (serviceType) => serviceType.tickets, { nullable: true })
  serviceType: ServiceType;

  @Column({ nullable: true })
  serviceTypeId: string;

  @OneToMany(() => TicketComment, (comment) => comment.ticket, { cascade: true })
  comments: TicketComment[];

  @OneToMany(() => TicketHistory, (history) => history.ticket, { cascade: true })
  history: TicketHistory[];

  @OneToMany(() => TicketAttachment, (attachment) => attachment.ticket, { cascade: true })
  attachments: TicketAttachment[];

  @OneToMany(() => Escalation, (escalation) => escalation.ticket, { cascade: true })
  escalations: Escalation[];

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  requiredSkills: string[];

  @Column({ type: 'int', default: 0 })
  estimatedDurationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;
}
