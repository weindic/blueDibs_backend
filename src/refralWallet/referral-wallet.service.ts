import { Injectable } from '@nestjs/common';
import { PrismaService } from '../Prisma.Service';
import { CreateReferralWalletDTO } from './referral-wallet.dto';

@Injectable()
export class ReferralWalletService {
  constructor(private prisma: PrismaService) {}

  async createReferralWallet(data: CreateReferralWalletDTO) {
    return this.prisma.referralWallet.create({
      data,
    });
  }

  async getWalletBalance(userId: string) {
    const wallets = await this.prisma.referralWallet.findMany({
      where: { userId },
    });

    const totalBalance = wallets.reduce((acc, wallet) => acc + wallet.balance, 0);
    return totalBalance;
  }

  async updateBalance(userId: string, amount: number) {
    const wallet = await this.prisma.referralWallet.findFirst({
      where: { userId },
    });

    if (wallet) {
      // Update the balance by adding the new amount to the existing balance
      return this.prisma.referralWallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance + amount },
      });
    } else {
      // Create a new wallet entry if it does not exist
      return this.createReferralWallet({
        userId,
        balance: amount,
        status: 1,
        createdAt: new Date(),
      });
    }
  }


  
}
