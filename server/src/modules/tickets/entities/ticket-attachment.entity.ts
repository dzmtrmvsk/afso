import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Ticket } from './ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_attachments')
export class TicketAttachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Ticket, (ticket) => ticket.attachments, { onDelete: 'CASCADE' })
  ticket: Ticket;

  @Column()
  ticketId: string;

  @ManyToOne(() => User)
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @Column()
  filename: string;

  @Column()
  fileUrl: string;

  @Column()
  fileSize: number;

  @Column({ nullable: true })
  mimeType: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
