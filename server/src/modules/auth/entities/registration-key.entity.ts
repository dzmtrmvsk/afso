import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('registration_keys')
export class RegistrationKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  organizationName: string;

  @ManyToOne(() => Organization, { nullable: true })
  organization: Organization;

  @Column({ nullable: true })
  organizationId: string;

  @Column({ default: false })
  used: boolean;

  @Column({ nullable: true })
  usedByEmail: string;

  @CreateDateColumn()
  createdAt: Date;
}
