import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ReferralController } from './referal.controller';
import { ReferralService } from './referal.service';
import { ReferralWalletService } from '../refralWallet/referral-wallet.service';
import { PrismaService } from '../Prisma.Service';
import { AuthMiddleware } from 'src/auth/auth.middleware';
import { ReferralWalletModule } from '../refralWallet/referral-wallet.module';
import { UserModule } from '../user/user.module'; // Import UserModule and UserService from the correct path

@Module({
  imports: [ReferralWalletModule, UserModule], // Include UserModule here
  controllers: [ReferralController],
  providers: [PrismaService, ReferralService, ReferralWalletService], // Add UserService to providers
  exports: [ReferralService],
})
export class ReferralModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'referrals/public', method: RequestMethod.ALL } // Add any public routes that do not require authentication
      )
      .forRoutes(ReferralController);
  }
}
