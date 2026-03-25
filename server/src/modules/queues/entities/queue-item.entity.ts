import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Queue } from './queue.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum QueueItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRYING = 'retrying',
  SKIPPED = 'skipped',
}

@Entity('queue_items')
export class QueueItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Queue, (queue) => queue.items, { onDelete: 'CASCADE' })
  queue: Queue;

  @Column()
  queueId: string;

  @ManyToOne(() => Ticket, { nullable: true })
  ticket: Ticket;

  @Column({ nullable: true })
  ticketId: string;

  @Column({ type: 'enum', enum: QueueItemStatus, default: QueueItemStatus.PENDING })
  status: QueueItemStatus;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
