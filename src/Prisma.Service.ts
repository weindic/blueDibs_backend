import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    Object.assign(
      this,
      this.$extends({
        name: 'user-extension',
        query: {
          user: {
            findFirst: async ({ args, query }) => {
              args.where ??= {};
              args.where.activated ??= true;

              const user = await query(args);
              return user;
            },
            findMany: async ({ args, query }) => {
              args.where ??= {};
              args.where.activated ??= true;

              const users = await query(args);
              return users;
            },
          },
        },
      }),
    );
  }

  async enableShutdownHooks(app: INestApplication) {
    await this.$disconnect();
    await app.close();
  }
}
