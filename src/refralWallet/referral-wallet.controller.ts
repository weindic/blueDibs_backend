import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ReferralWalletService } from './referral-wallet.service';
import { CreateReferralWalletDTO } from './referral-wallet.dto';
import { PrismaService } from 'src/Prisma.Service';

@Controller('referral-wallets')
export class ReferralWalletController {
  constructor(private readonly referralWalletService: ReferralWalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createReferralWalletDto: CreateReferralWalletDTO) {
    return this.referralWalletService.createReferralWallet(createReferralWalletDto);
  }

  @Get(':userId')
  async getWalletBalance(@Param('userId') userId: string) {
    const balance = await this.referralWalletService.getWalletBalance(userId);
    return { userId, balance };
  }



  @Post('refferalGet')
  async deductReferralWalletAmount(@Body() body: { userId: string, amount: number }) {
    const { userId, amount } = body;

    console.log('Received userId:', userId);
    console.log('Received amount:', amount);

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return { status: false, message: 'Invalid amount specified.' };
    }

    const referralWallet = await this.prisma.referralWallet.findFirst({
      where: { userId }
    });

    if (!referralWallet) {
      return { status: false, message: 'Wallet not found' };
    }

    if (referralWallet.balance < amount) {
      return { status: false, message: 'Not enough balance.' };
    }

    await this.prisma.referralWallet.update({
      where: { id: referralWallet.id }, // Use the unique identifier `id` for the update
      data: {
        balance: { decrement: amount }
      }
    });

    await this.prisma.withDrawalRequest.create({
      data: {
        status: 'PENDING',
        userId: userId, // Adjusted to directly set userId
        amount,
        type: 2
      }
    });

    return { status: true, message: 'Amount deducted and withdrawal request created.' };
  }
  
  
}
