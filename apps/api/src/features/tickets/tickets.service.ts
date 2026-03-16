import { Injectable } from '@nestjs/common';

@Injectable()
export class TicketsService {
  findAll() {
    return { message: 'Tickets module is operational' };
  }
}
