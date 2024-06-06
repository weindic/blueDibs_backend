import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private mailerService: MailerService) {}

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email.toLowerCase(),
        from: '"Support Team" <admin@bluedibs.com>',
        subject: 'Welcome to BlueDibs! Confirm your Email',
        template: './confirmation',
        context: {
          otp,
        },
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error.stack);
      throw new Error('Failed to send OTP email');
    }
  }




  async resetPassOtp(email: string, otp: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email.toLowerCase(),
        from: '"Support Team" <admin@bluedibs.com>',
        subject: 'Reset Password OTP  | BlueDibs',
        template: './confirmation',
        context: {
          otp,
        },
      });
      this.logger.log(`OTP email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}`, error.stack);
      throw new Error('Failed to send OTP email');
    }
  }
}
