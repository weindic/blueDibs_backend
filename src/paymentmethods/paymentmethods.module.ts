import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PaymentmethodsController } from './paymentmethods.controller';
import { PrismaService } from 'src/Prisma.Service';
import { AuthMiddleware } from 'src/auth/auth.middleware';

@Module({
  controllers: [PaymentmethodsController],
  providers: [PrismaService],
})
export class PaymentmethodsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(PaymentmethodsController);
  }
}
