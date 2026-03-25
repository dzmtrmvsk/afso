import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Webhook } from './webhook.entity';

export enum WebhookDeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
}

@Entity('webhook_events')
export class WebhookEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Webhook, (webhook) => webhook.deliveries, { onDelete: 'CASCADE' })
  webhook: Webhook;

  @Column()
  webhookId: string;

  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, unknown>;

  @Column({ type: 'enum', enum: WebhookDeliveryStatus, default: WebhookDeliveryStatus.PENDING })
  status: WebhookDeliveryStatus;

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'int', nullable: true })
  httpStatusCode: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextRetryAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
