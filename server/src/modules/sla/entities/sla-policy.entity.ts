import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { TicketPriority } from '../../tickets/entities/ticket.entity';

@Entity('sla_policies')
export class SlaPolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Organization)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: TicketPriority, enumName: 'ticket_priority_enum' })
  priority: TicketPriority;

  @Column({ type: 'int' })
  responseTimeMinutes: number;

  @Column({ type: 'int' })
  resolutionTimeMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  escalateOnBreach: boolean;

  @Column({ type: 'jsonb', nullable: true })
  escalationRules: {
    notifyUserIds: string[];
    reassignToTeamId?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
