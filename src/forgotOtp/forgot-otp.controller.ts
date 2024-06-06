// src/forgot-otp/forgot-otp.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ForgotOtpService } from './forgot-otp.service';
import { SendOtpDto, VerifyOtpDto} from './send-otp.dto';


@Controller('forgot-otp')
export class ForgotOtpController {
  constructor(private readonly forgotOtpService: ForgotOtpService) {}

  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.forgotOtpService.sendOtp(sendOtpDto);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.forgotOtpService.verifyOtp(verifyOtpDto);
  }
}
