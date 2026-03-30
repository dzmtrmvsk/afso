import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Notification } from '../../notifications/entities/notification.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  MANAGER = 'manager',
  AGENT = 'agent',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ nullable: true })
  phone: string;

  @ManyToOne(() => Organization, (organization) => organization.users, { nullable: true })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ nullable: true })
  position: string;

  @OneToMany(() => Assignment, (assignment) => assignment.agent)
  assignments: Assignment[];

  @OneToMany(() => Notification, (notification) => notification.recipient)
  notifications: Notification[];

  @Column({ type: 'jsonb', nullable: true })
  skills: string[];

  @Column({ default: 0 })
  currentLoad: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
