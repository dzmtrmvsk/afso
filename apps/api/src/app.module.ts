import { Module } from '@nestjs/common';
import { InfraModule } from './infra/infra.module';
import { CoreModule } from './core/core.module';
import { UsersModule } from './features/users/users.module';
import { TicketsModule } from './features/tickets/tickets.module';
import { SlaModule } from './features/sla/sla.module';

@Module({
  imports: [
    InfraModule,
    CoreModule,
    UsersModule,
    TicketsModule,
    SlaModule,
  ],
})
export class AppModule {}
