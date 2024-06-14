import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './Prisma.Service';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { UserModule } from './user/user.module';
import { PassportModule } from '@nestjs/passport';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { HoldingModule } from './holdings/holdings.module';
import { WithdrawalModule } from './withdrawal/withdrawal.module';
import { PaymentmethodsModule } from './paymentmethods/paymentmethods.module';
import { AdminModule } from './admin/admin.module';
import { PlatformSellModule } from './platformsell/platformsell.module';
import { ReferralModule } from './referal/refral.module';
import { ReferralWalletModule } from './refralWallet/referral-wallet.module';
import { PopularProfileModule } from './blueTick/popular-profile.module';
import { VIPChatModule } from './vipChatSetting/vip-chat.module';
import { KycRequestModule } from './kycRequest/kyc-request.module';
import { VipChatRequestModule } from './vipChatRequest/vip-chat-request.module';
import { NotificationAlertsModule } from './notificationAlert/notification-alerts.module';
import { SignupRequestModule } from './signupRequest/signup-request.module';
import { ForgotOtpModule } from './forgotOtp/forgot-otp.module';
import { VipChatRoomModule } from './vipChatRoom/vip-chat-room.module';
import { VipChatBoxModule } from './vipChatBox/vip-chat-box.module';

@Module({


  imports: [
 
    PassportModule,
    UserModule,
    PostModule,
    CommentModule,
    HoldingModule,
    WithdrawalModule,
    PaymentmethodsModule,
    AdminModule,
    PlatformSellModule,
    ReferralWalletModule,
    ReferralModule,
    PopularProfileModule,
    VIPChatModule,
    KycRequestModule,
    VipChatRequestModule,
    NotificationAlertsModule,
    SignupRequestModule,
    ForgotOtpModule,
    VipChatRoomModule,
    VipChatBoxModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModuleexport {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        // CORS headers
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        if (req.method === 'OPTIONS') {
          res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
          return res.status(200).json({});
        }
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
