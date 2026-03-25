import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Role } from './role.entity';

export enum PermissionResource {
  TICKETS = 'tickets',
  ASSIGNMENTS = 'assignments',
  USERS = 'users',
  TEAMS = 'teams',
  ORGANIZATIONS = 'organizations',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  INTEGRATIONS = 'integrations',
  SLA = 'sla',
  QUEUES = 'queues',
  ANALYTICS = 'analytics',
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: PermissionResource })
  resource: PermissionResource;

  @Column({ type: 'enum', enum: PermissionAction })
  action: PermissionAction;

  @Column()
  description: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
