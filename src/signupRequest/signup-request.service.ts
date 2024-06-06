import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/Prisma.Service';
import { AddUserDTO } from './signup-request.dto';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/UserService';

@Injectable()
export class SignupRequestService {
  constructor(private readonly prisma: PrismaService,
    private readonly emailService: EmailService
            
  ) {}

  async newRequest(body: AddUserDTO) {
    try {
      // Check if the email already exists in the User collection
      const userExists = await this.prisma.user.findUnique({
        where: { email: body.email },
      });

      if (userExists) {
        return { message: 'Email already exists', status: true };
      }

      // Check if the email already exists in the signupRequest collection
      const signupRequestExists = await this.prisma.signupRequest.findUnique({
        where: { email: body.email },
      });

      const otpVal: any = this.generateOTP();

      let user;
      if (signupRequestExists) {
        // Update the existing record
        user = await this.prisma.signupRequest.update({
          where: { id: signupRequestExists.id },
          data: {
            username: body.username,
            password: body.password,
            otp: otpVal,
            status: 0, // Assuming 0 means not verified
            createdAt: new Date(),
          },
        });
      } else {
        // Create a new user
        user = await this.prisma.signupRequest.create({
          data: {
            email: body.email,
            username: body.username,
            password: body.password,
            otp: otpVal,
            status: 0, // Assuming 0 means not verified
            createdAt: new Date(),
          },
        });
      }

      // Send OTP email
      await this.emailService.sendOtpEmail(body.email, otpVal);
      return { message: 'User created and OTP sent successfully', user, status: true };

    } catch (error) {
      console.error('Error creating user request:', error);
      throw new HttpException('Error creating user request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }


  async verifyOTP(email: string, otp: number): Promise<{ message: string, status: boolean }> {
    try {
      // Find the user request by email
      const userRequest = await this.prisma.signupRequest.findUnique({
        where: {
          email,
        },
      });

      if (!userRequest) {
       
        return { message: 'Email does not exist.', status: true };
      }

 
      console.log('userRequest', userRequest)
      // Check if OTP matches
      if (userRequest.otp == otp) {
        // OTP is valid, update user request status to verified
        await this.prisma.signupRequest.update({
          where: { id: userRequest.id },
          data: {
            status: 1, // Assuming 1 means verified
          },
        });

        return { message: 'OTP verified successfully', status: true };
      } else {
        throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      throw new HttpException('Error verifying OTP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async updateOtpByEmail(email: string): Promise<{ message: string, otp: number, status:boolean }> {
    try {
      const userRequest = await this.prisma.signupRequest.findUnique({
        where: { email },
      });

      if (!userRequest) {
        throw new HttpException('User request not found', HttpStatus.NOT_FOUND);
      }

      const newOtp = this.generateOTP();
      await this.prisma.signupRequest.update({
        where: { id: userRequest.id },
        data: { otp: newOtp, createdAt: new Date() },
      });

      return { message: 'OTP updated successfully', otp: newOtp, status:true };
    } catch (error) {
      throw new HttpException('Error updating OTP', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async addUser(body: any) {
    try {
      console.log('body', body);

      // Check if the email already exists in the User collection
      const existingUser = await this.prisma.user.findUnique({
        where: {
          email: body.email,
        },
      });

      if (existingUser) {
        // If the email exists and the user is verified, throw a conflict exception
        if (existingUser.verified) {
          throw new HttpException('User already exists', HttpStatus.CONFLICT);
        } else {
          // If the email exists and the user is not verified, update the existing record
       
          const user = await this.prisma.user.update({
            where: {
              email: body.email,
            },
            data: {
              username: body.username,
              firebaseId: body.firebaseId,
              verified:true,
              shares: 0,
              lastSell: {
                equity: 0,
                time: new Date(0),
              },
              otp: 0,
              otpSentTime: new Date(),
              activated: false, // Ensure activated is set to false
            },
          });

      
          return { message: 'User updated successfully', user };
        }
      } else {
        // If the email does not exist, create a new user
     
        const user = await this.prisma.user.create({
          data: {
            email: body.email,
            username: body.username,
            firebaseId: body.firebaseId,
            verified:true,
            shares: 0,
            lastSell: {
              equity: 0,
              time: new Date(0),
            },
            otp: 0,
            otpSentTime: new Date(),
            activated: false, // Ensure activated is set to false for new users
          },
        });

  
        return { message: 'User created successfully', user };
      }
    } catch (err) {
      console.error('Error occurred:', err); // Log detailed error

      if (err.code === 'P2002') {
        throw new HttpException('User already exists', HttpStatus.CONFLICT);
      } else {
        throw new HttpException('Something went wrong', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }





  private generateOTP(): number {
    // Generate a random 4-digit OTP
    return Math.floor(1000 + Math.random() * 9000);
  }
}
