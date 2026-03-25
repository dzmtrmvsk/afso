import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import { Event, EventSchema } from './schemas/event.schema';
import { AuditLog } from './entities/audit-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }]),
    TypeOrmModule.forFeature([AuditLog]),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
