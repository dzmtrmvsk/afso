import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SlaPolicy } from './entities/sla-policy.entity';
import { Escalation } from './entities/escalation.entity';
import { SlaService } from './sla.service';
import { SlaController } from './sla.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SlaPolicy, Escalation]),
  ],
  providers: [SlaService],
  controllers: [SlaController],
  exports: [SlaService],
})
export class SlaModule {}
