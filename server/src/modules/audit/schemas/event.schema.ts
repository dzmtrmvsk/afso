import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Event extends Document {
  @Prop({ required: true })
  eventType: string;

  @Prop({ required: true })
  entityType: string;

  @Prop({ required: true })
  entityId: string;

  @Prop({ required: true })
  organizationId: string;

  @Prop({ required: false })
  userId: string;

  @Prop({ type: Object })
  data: {
    before?: object;
    after?: object;
    metadata?: object;
  };

  @Prop()
  ipAddress: string;

  @Prop()
  userAgent: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);

EventSchema.index({ entityType: 1, entityId: 1 });
EventSchema.index({ organizationId: 1, createdAt: -1 });
EventSchema.index({ eventType: 1 });
