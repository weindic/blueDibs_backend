// src/forgot-otp/forgot-otp.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { ForgotOtpService } from './forgot-otp.service';
import { ForgotOtpController } from './forgot-otp.controller';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports:[EmailModule],
  controllers: [ForgotOtpController],
  providers: [ForgotOtpService,EmailService, PrismaService],
})
export class ForgotOtpModule {}
