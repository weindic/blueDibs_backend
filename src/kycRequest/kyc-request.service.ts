import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.service';
import { CreateKycRequestDto } from './create-kyc-request.dto';
import { UpdateKycStatusDto } from './update-kyc-status.dto';

@Injectable()
export class KycRequestService {
  constructor(private prisma: PrismaService) {}

  async create(createKycRequestDto: CreateKycRequestDto) {

  
    return this.prisma.kycRequest.upsert({
      where: {
        userId: createKycRequestDto.userId,
      },
      update: {
        ...createKycRequestDto,
      },
      create: {
        ...createKycRequestDto,
      },
    });
  }
  

  async updateStatus(id: string, updateKycStatusDto: UpdateKycStatusDto) {
    const kycRequest = await this.prisma.kycRequest.findUnique({ where: { id } });
    if (!kycRequest) {
      throw new NotFoundException('KYC Request not found');
    }

    return this.prisma.kycRequest.update({
      where: { id },
      data: { status: updateKycStatusDto.status },
    });
  }

  async findByUserId(userId: string) {
    const data = await this.prisma.kycRequest.findUnique({
      where: { userId },
    });
  
    if (data) {
      return { data, status: true };
    } else {
      return { data: null, status: false };
    }
  }
  
}
