import { Controller, Post, Body, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { SignupRequestService } from './signup-request.service';
import { AddUserDTO } from './signup-request.dto';

@Controller('signup-request')
export class SignupRequestController {
  constructor(private readonly signupRequestService: SignupRequestService) {}

  @Post('newRequest')
  @HttpCode(HttpStatus.OK)
  async newRequest(@Body() body: AddUserDTO) {
    return this.signupRequestService.newRequest(body)
  }


  @Post('verify-otp')
  async verifyOTP(@Body() body: { email: string; otp: number }) {
    try {
      const { email, otp } = body;
      const result = await this.signupRequestService.verifyOTP(email, otp);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Re-throw HTTP exceptions
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }


  @Post('update-otp')
  async updateOtpByEmail(@Body() body: { email: string }) {
    try {
      const { email } = body;
      const result = await this.signupRequestService.updateOtpByEmail(email);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }



  @Post('create-profile')
  @HttpCode(HttpStatus.OK)
  async addUser(@Body() body: AddUserDTO) {
    try {
      const result = await this.signupRequestService.addUser(body);
      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
