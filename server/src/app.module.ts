import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { AppDataSource } from './config/data-source';
import { queueConfig } from './config/queue.config';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { SlaModule } from './modules/sla/sla.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { TeamsModule } from './modules/teams/teams.module';
import { AuditModule } from './modules/audit/audit.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { QueuesModule } from './modules/queues/queues.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CustomersModule } from './modules/customers/customers.module';
import { LocationsModule } from './modules/locations/locations.module';
import { ServiceTypesModule } from './modules/service-types/service-types.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../env',
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/afso'),
    BullModule.forRoot(queueConfig()),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    TicketsModule,
    SlaModule,
    AssignmentsModule,
    TeamsModule,
    AuditModule,
    NotificationsModule,
    QueuesModule,
    AnalyticsModule,
    CustomersModule,
    LocationsModule,
    ServiceTypesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
