import { Injectable } from '@nestjs/common';

@Injectable()
export class SlaService {
  getStatus() {
    return { message: 'SLA module is operational' };
  }
}
