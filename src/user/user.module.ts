import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UserController } from './user.controller';
import { PrismaService } from 'src/Prisma.Service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { HoldingModule } from 'src/holdings/holdings.module';
import { UserService } from './UserService';
import { WalletController } from './wallet.controller';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [HoldingModule, EmailModule],
  controllers: [UserController, WalletController],
  providers: [PrismaService, UserService, EmailService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: '/user/send-otp', method: RequestMethod.ALL },
        { path: '/user/verify-otp', method: RequestMethod.ALL },
        { path: '/user', method: RequestMethod.POST },
        { path: '/user/update-profile', method: RequestMethod.ALL },
        { path: '/user/dummy', method: RequestMethod.GET },
       
      )
      .forRoutes(UserController, WalletController);
  }
}
