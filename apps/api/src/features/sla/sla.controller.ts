import { Controller, Get } from '@nestjs/common';
import { SlaService } from './sla.service';

@Controller('sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get()
  getStatus() {
    return this.slaService.getStatus();
  }
}
