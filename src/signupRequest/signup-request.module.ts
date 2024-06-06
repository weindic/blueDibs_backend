import { Module } from '@nestjs/common';
import { SignupRequestService } from './signup-request.service';
import { SignupRequestController } from './signup-request.controller';
import { PrismaService } from '../prisma.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports:[EmailModule],
  controllers: [SignupRequestController],
  providers: [SignupRequestService, EmailService, PrismaService],
})
export class SignupRequestModule {}
