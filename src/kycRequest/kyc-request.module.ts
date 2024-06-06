import { Module } from '@nestjs/common';
import { KycRequestService } from './kyc-request.service';
import { KycRequestController } from './kyc-request.controller';
import { PrismaService } from 'src/Prisma.Service';


@Module({
  controllers: [KycRequestController],
  providers: [KycRequestService, PrismaService],
})
export class KycRequestModule {}
