import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { WithdrawalController } from './withdrawal.controller';
import { PrismaService } from 'src/Prisma.Service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { UserController } from 'src/user/user.controller';
import { WalletController } from 'src/user/wallet.controller';

@Module({
  controllers: [WithdrawalController],
  providers: [PrismaService],
})
export class WithdrawalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(WithdrawalController);
  }
}
