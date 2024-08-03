import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PlatformSellController } from './platformsell.controller';
import { PrismaService } from 'src/Prisma.Service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { EmailService } from 'src/email/email.service';

@Module({
  controllers: [PlatformSellController],
  providers: [PrismaService, EmailService],
})
export class PlatformSellModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(PlatformSellController);
  }
}
