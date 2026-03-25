import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

@Entity('service_types')
export class ServiceType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Organization, (organization) => organization.serviceTypes)
  organization: Organization;

  @Column()
  organizationId: string;

  @OneToMany(() => Ticket, (ticket) => ticket.serviceType, { nullable: true })
  tickets: Ticket[];

  @Column({ type: 'int', default: 0 })
  estimatedDurationMinutes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  baseCost: number;

  @Column({ type: 'jsonb', nullable: true })
  requiredSkills: string[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
