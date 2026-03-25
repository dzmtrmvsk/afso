import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { QueueItem } from './queue-item.entity';

export enum QueuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum QueueStrategy {
  FIFO = 'fifo',
  PRIORITY = 'priority',
  LOAD_BALANCED = 'load_balanced',
  SKILL_BASED = 'skill_based',
  ROUND_ROBIN = 'round_robin',
}

@Entity('queues')
export class Queue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Organization, (organization) => organization.queues)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: QueueStrategy, default: QueueStrategy.LOAD_BALANCED })
  strategy: QueueStrategy;

  @OneToMany(() => QueueItem, (item) => item.queue, { cascade: true })
  items: QueueItem[];

  @Column({ type: 'int', default: 0 })
  itemCount: number;

  @Column({ type: 'int', default: 0 })
  processingCount: number;

  @Column({ type: 'int', default: 0 })
  completedCount: number;

  @Column({ type: 'jsonb', nullable: true })
  rules: {
    maxConcurrent?: number;
    maxRetries?: number;
    timeoutSeconds?: number;
    [key: string]: unknown;
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
