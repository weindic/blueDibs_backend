import { Module } from '@nestjs/common';
import { KycRequestService } from './kyc-request.service';
import { KycRequestController } from './kyc-request.controller';
import { PrismaService } from 'src/Prisma.Service';
import { EmailService } from 'src/email/email.service';


@Module({
  controllers: [KycRequestController],
  providers: [KycRequestService, PrismaService, EmailService],
})
export class KycRequestModule {}
