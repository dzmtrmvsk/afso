import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Team } from '../../teams/entities/team.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Notification } from '../../notifications/entities/notification.entity';
import { Location } from '../../locations/entities/location.entity';
import { SkillCategory } from '../../skills/entities/skill-category.entity';
import { Integration } from '../../integrations/entities/integration.entity';
import { Queue } from '../../queues/entities/queue.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';
import { Role } from '../../permissions/entities/role.entity';
import { AuditLog } from '../../audit/entities/audit-log.entity';
import { Metric } from '../../analytics/entities/metric.entity';
import { Report } from '../../reports/entities/report.entity';
import { Webhook } from '../../webhooks/entities/webhook.entity';
import { ServiceType } from 'src/modules/service-types/entities/service-type.entity';
import { Customer } from 'src/modules/customers/entities/customer.entity';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Team, (team) => team.organization)
  teams: Team[];

  @OneToMany(() => Ticket, (ticket) => ticket.organization)
  tickets: Ticket[];

  @OneToMany(() => Invoice, (invoice) => invoice.organization)
  invoices: Invoice[];

  @OneToMany(() => Notification, (notification) => notification.organization)
  notifications: Notification[];

  @OneToMany(() => Location, (location) => location.organization)
  locations: Location[];

  @OneToMany(() => SkillCategory, (category) => category.organization)
  skillCategories: SkillCategory[];

  @OneToMany(() => Integration, (integration) => integration.organization)
  integrations: Integration[];

  @OneToMany(() => Queue, (queue) => queue.organization)
  queues: Queue[];

  @OneToOne(() => Subscription, (subscription) => subscription.organization, { nullable: true })
  subscription: Subscription;

  @OneToMany(() => Role, (role) => role.organization)
  roles: Role[];

  @OneToMany(() => AuditLog, (log) => log.organization)
  auditLogs: AuditLog[];

  @OneToMany(() => Metric, (metric) => metric.organization)
  metrics: Metric[];

  @OneToMany(() => Report, (report) => report.organization)
  reports: Report[];

  @OneToMany(() => Webhook, (webhook) => webhook.organization)
  webhooks: Webhook[];

  @OneToMany(() => Customer, (customer) => customer.organization)
  customers: Customer[];

  @OneToMany(() => ServiceType, (serviceType) => serviceType.organization)
  serviceTypes: ServiceType[];

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
