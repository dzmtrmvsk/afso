import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AutoAssignProcessor } from './auto-assign.processor';
import { SlaProcessor } from './sla.processor';
import { TicketsModule } from '../tickets/tickets.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { UsersModule } from '../users/users.module';
import { SlaModule } from '../sla/sla.module';
import { AuditModule } from '../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'auto-assign' },
      { name: 'sla-monitor' },
    ),
    forwardRef(() => TicketsModule),
    AssignmentsModule,
    UsersModule,
    SlaModule,
    AuditModule,
    NotificationsModule,
  ],
  providers: [AutoAssignProcessor, SlaProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
