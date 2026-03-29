import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Organization } from '../../modules/organizations/entities/organization.entity';

export enum IntegrationType {
  WEBHOOK = 'webhook',
  API = 'api',
  EMAIL = 'email',
  TELEGRAM = 'telegram',
  SLACK = 'slack',
  ZAPIER = 'zapier',
  CUSTOM = 'custom',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING = 'pending',
}

@Entity('integrations')
export class Integration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: IntegrationType })
  type: IntegrationType;

  @ManyToOne(() => Organization, (organization) => organization.integrations)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: IntegrationStatus, default: IntegrationStatus.PENDING })
  status: IntegrationStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb' })
  config: Record<string, unknown>;

  @Column({ type: 'jsonb', nullable: true })
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    token?: string;
    [key: string]: unknown;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastErrorAt: Date;

  @Column({ type: 'text', nullable: true })
  lastError: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
