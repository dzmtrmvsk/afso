import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from './schemas/event.schema';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
  ) {}

  async logEvent(eventData: Partial<Event>): Promise<Event> {
    const createdEvent = new this.eventModel(eventData);
    return createdEvent.save();
  }

  async getEventsByEntity(entityType: string, entityId: string): Promise<Event[]> {
    return this.eventModel.find({ entityType, entityId }).sort({ createdAt: -1 }).exec();
  }

  async getEventsByOrganization(organizationId: string, limit = 50): Promise<Event[]> {
    return this.eventModel.find({ organizationId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}
