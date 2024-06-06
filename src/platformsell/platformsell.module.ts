import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PlatformSellController } from './platformsell.controller';
import { PrismaService } from 'src/Prisma.Service';
import { AuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  controllers: [PlatformSellController],
  providers: [PrismaService],
})
export class PlatformSellModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(PlatformSellController);
  }
}
