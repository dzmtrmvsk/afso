import { Module, Global } from '@nestjs/common';
import { DomainEventsService } from './services/domain-events.service';
import { AuditModule } from '../modules/audit/audit.module';
import { NotificationsModule } from '../modules/notifications/notifications.module';

@Global()
@Module({
  imports: [AuditModule, NotificationsModule],
  providers: [DomainEventsService],
  exports: [DomainEventsService],
})
export class CommonModule {}
