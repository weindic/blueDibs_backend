import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { CreateReferralDTO, UpdateReferralDTO } from './refral.dto';

@Injectable()
export class ReferralService {
  constructor(private prisma: PrismaService) {}

  async createReferral(data: CreateReferralDTO) {
    return this.prisma.referral.create({
      data,
    });
  }

  async updateReferral(id: string, data: UpdateReferralDTO) {
    return this.prisma.referral.update({
      where: { id },
      data,
    });
  }

  async findReferralByCode(referralCode: string) {
    return this.prisma.referral.findUnique({
      where: { referralCode },
    });
  }

  async findReferralByCodeAndStatus(referralCode: string, status: number) {
    return this.prisma.referral.findFirst({
      where: { referralCode, status },
    });
  }


 
  async countReferrals(userId: string): Promise<number> {
    return this.prisma.referral.count({
      where: { senderId: userId },
    });
  }

  async countClaimedReferrals(userId: string): Promise<number> {
    return this.prisma.referral.count({
      where: { senderId: userId, status: 0 },
    });
  }
}
