import { Module } from '@nestjs/common';
import { ReferralWalletController } from './referral-wallet.controller';
import { ReferralWalletService } from './referral-wallet.service';
import { PrismaService } from 'src/Prisma.Service';

@Module({
  imports: [],
  controllers: [ReferralWalletController],
  providers: [PrismaService, ReferralWalletService],
  exports: [ReferralWalletService],
})
export class ReferralWalletModule {}
