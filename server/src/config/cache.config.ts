import { CacheModuleOptions } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

export const cacheConfig = async (): Promise<CacheModuleOptions> => {
  return {
    store: await redisStore({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
      password: process.env.REDIS_PASSWORD,
      ttl: 300000, // 5 minutes default TTL in milliseconds
    }),
    isGlobal: true,
  };
};
