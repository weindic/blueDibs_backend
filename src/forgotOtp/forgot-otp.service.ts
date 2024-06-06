import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { SendOtpDto, VerifyOtpDto } from './send-otp.dto';

import { addMinutes } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class ForgotOtpService {
  constructor(private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async sendOtp(data: SendOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { message: 'Email does not exist!', status: false };
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate a 4-digit numeric OTP
    const expiry = addMinutes(new Date(), 10);

    const existingOtpRecord = await this.prisma.forgotOTP.findUnique({
      where: { email: data.email },
    });

    if (existingOtpRecord) {
      // Update the existing record with new OTP and expiry
      await this.prisma.forgotOTP.update({
        where: { email: data.email },
        data: {
          otp,
          expiry,
          status: 1, // Reset status to active
          createdAt: new Date(), // Update createdAt to current time
        },
      });
    } else {
      // Create a new record
      await this.prisma.forgotOTP.create({
        data: {
          email: data.email,
          otp,
          expiry,
        },
      });
    }

    // Send the OTP via email (implementation not shown here)
    await this.emailService.resetPassOtp(data.email, otp);

    return { message: 'OTP sent successfully', status: true };
  }

  async verifyOtp(data: VerifyOtpDto) {
    const record = await this.prisma.forgotOTP.findUnique({
      where: { email: data.email },
    });

    if (!record || record.otp !== data.otp || record.expiry < new Date() || record.status !== 1) {
        return { message: 'Invalid OTP or Expired', status:false };
    }

    await this.prisma.forgotOTP.update({
      where: { email: data.email },
      data: { status: 0 },
    });

    return { message: 'OTP verified successfully', status:true };
  }
}
