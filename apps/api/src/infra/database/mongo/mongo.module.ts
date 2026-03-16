import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const user = config.get<string>('MONGO_INITDB_ROOT_USERNAME');
        const pass = config.get<string>('MONGO_INITDB_ROOT_PASSWORD');
        const host = config.get<string>('MONGO_HOST');
        const port = config.get<number>('MONGO_PORT');
        const db = config.get<string>('MONGO_DB');

        return {
          uri: `mongodb://${user}:${pass}@${host}:${port}/${db}?authSource=admin`,
        };
      },
    }),
  ],
})
export class MongoModule {}
