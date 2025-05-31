import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { useMiddleware } from './middleware/prisma.middleware';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{ 
  

  async onModuleInit() {
    this.$use(useMiddleware());
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Optional: helper for clean shutdown
  async enableShutdownHooks() {
    process.on('SIGINT', async () => {
      await this.$disconnect();
    });
    process.on('SIGTERM', async () => {
      await this.$disconnect();
    });
  }
}
