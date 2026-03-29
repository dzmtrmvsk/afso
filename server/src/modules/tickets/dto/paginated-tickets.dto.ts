import { Ticket } from '../entities/ticket.entity';

export class PaginatedTicketsDto {
  data: Ticket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
