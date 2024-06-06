import { Module } from '@nestjs/common';
import { KycRequestService } from './kyc-request.service';
import { KycRequestController } from './kyc-request.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [KycRequestController],
  providers: [KycRequestService, PrismaService],
})
export class KycRequestModule {}
