import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { Ticket } from '../../tickets/entities/ticket.entity';

export enum LocationType {
  OFFICE = 'office',
  WAREHOUSE = 'warehouse',
  SERVICE_AREA = 'service_area',
  CUSTOMER_SITE = 'customer_site',
  OTHER = 'other',
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Organization, (organization) => organization.locations)
  organization: Organization;

  @Column()
  organizationId: string;

  @Column({ type: 'enum', enum: LocationType })
  type: LocationType;

  @Column()
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @OneToMany(() => Ticket, (ticket) => ticket.location, { nullable: true })
  tickets: Ticket[];

  @Column({ type: 'jsonb', nullable: true })
  serviceRadius: {
    value: number;
    unit: 'km' | 'miles';
  };

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
