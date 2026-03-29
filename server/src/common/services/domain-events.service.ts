import { Injectable } from '@nestjs/common';
import { AuditService } from '../../modules/audit/audit.service';
import { EventsGateway } from '../../modules/notifications/events.gateway';

export interface DomainEvent {
  eventType: string;
  entityType: string;
  entityId: string;
  organizationId: string;
  userId?: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class DomainEventsService {
  constructor(
    private readonly auditService: AuditService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async emit(event: DomainEvent, wsEventName?: string): Promise<void> {
    await this.auditService.logEvent({
      eventType: event.eventType,
      entityType: event.entityType,
      entityId: event.entityId,
      organizationId: event.organizationId,
      userId: event.userId,
      data: event.data,
    });

    this.eventsGateway.emitToOrganization(
      event.organizationId,
      wsEventName || event.eventType,
      event.data,
    );
  }

  async emitMultiple(events: DomainEvent[]): Promise<void> {
    await Promise.all(events.map(event => this.emit(event)));
  }
}
