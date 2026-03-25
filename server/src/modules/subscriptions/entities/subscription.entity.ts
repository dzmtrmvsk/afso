import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { SubscriptionPlan } from './subscription-plan.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, (organization) => organization.subscription)
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => SubscriptionPlan)
  plan: SubscriptionPlan;

  @Column()
  planId: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.TRIAL })
  status: SubscriptionStatus;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  renewalDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monthlyPrice: number;

  @Column({ type: 'int', default: 1 })
  userCount: number;

  @Column({ type: 'int', default: 0 })
  ticketsProcessed: number;

  @Column({ default: true })
  autoRenew: boolean;

  @Column({ type: 'jsonb', nullable: true })
  features: Record<string, boolean>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
