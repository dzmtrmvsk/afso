import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import { AppDataSource } from './config/data-source';
import { queueConfig } from './config/queue.config';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../env',
    }),
    TypeOrmModule.forRoot({
      ...AppDataSource.options,
    }),
    BullModule.forRoot(queueConfig()),
    ScheduleModule.forRoot(),
  ],
  controllers: [HealthController],
})
export class AppModule {}
